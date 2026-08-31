const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  screen,
  powerMonitor,
  ipcMain,
  Notification,
  dialog,
  session,
  safeStorage,
} = require("electron");
const net = require("net");
const path = require("path");
const screenshot = require("screenshot-desktop");
const sharp = require("sharp");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const Store = require("electron-store").default;
const activeWin = require("active-win");
const { uIOhook } = require("uiohook-napi");
const { execFile } = require("child_process");
const crypto = require("crypto");
const os = require("os");

process.on("uncaughtException", (err) => {
  try {
    fs.appendFileSync(
      path.join(app.getPath("userData"), "workcomposer-error.log"),
      `${new Date().toISOString()}\n${err.stack}\n\n`,
    );
  } catch {}
});

process.on("unhandledRejection", (err) => {
  try {
    fs.appendFileSync(
      path.join(app.getPath("userData"), "workcomposer-error.log"),
      `${new Date().toISOString()}\n${err}\n\n`,
    );
  } catch {}
});

const store = new Store();

const isDev = !app.isPackaged;

const singleInstanceLock = app.requestSingleInstanceLock();

if (!singleInstanceLock) {
  app.quit();
} else {
  if (process.platform === "win32" || process.platform === "linux") {
    if (isDev && process.argv[1]) {
      app.setAsDefaultProtocolClient("workcomposer", process.execPath, [
        path.resolve(process.argv[1]),
      ]);
    } else {
      app.setAsDefaultProtocolClient("workcomposer");
    }
  } else {
    app.setAsDefaultProtocolClient("workcomposer");
  }
}

const API_BASE_URL = "http://localhost:5000/api";

const WEB_APP_URL = "http://localhost:3000";

const devLog = (...args) => {
  if (isDev) {
    console.log(...args);
  }
};

const devWarn = (...args) => {
  if (isDev) {
    console.warn(...args);
  }
};

const logError = (error, context = "") => {
  try {
    const message = error?.stack || error?.message || String(error);

    fs.appendFileSync(
      path.join(app.getPath("userData"), "workcomposer-error.log"),
      `${new Date().toISOString()} ${
        context ? `[${context}] ` : ""
      }${message}\n\n`,
      
    );
  } catch {}
};

function saveAuthToken(token) {
  if (!token) return;

  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error("Secure storage is not available");
  }

  const encryptedToken = safeStorage.encryptString(token);

  store.set("authToken", encryptedToken.toString("base64"));
}

function getStoredAuthToken() {
  return getSecureToken("authToken");
}

function saveSecureToken(key, token) {
  if (!token) return;

  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error("Electron secure storage is unavailable");
  }

  const encrypted = safeStorage.encryptString(token);

  store.set(key, encrypted.toString("base64"));
}

function getDeviceInfo() {
  let deviceId = store.get("deviceId");

  if (!deviceId) {
    deviceId = crypto.randomUUID();

    store.set("deviceId", deviceId);

    devLog("NEW DEVICE ID CREATED:", deviceId);
  }

  return {
    deviceId,
    platform: process.platform,
    appVersion: app.getVersion(),
    hostname: os.hostname(),
  };
}

function getSecureToken(key) {
  const encrypted = store.get(key);

  if (!encrypted) {
    return null;
  }

  if (!safeStorage.isEncryptionAvailable()) {
    return null;
  }

  try {
    return safeStorage.decryptString(Buffer.from(encrypted, "base64"));
  } catch (err) {
    logError(err, `FAILED TO DECRYPT ${key}`);

    store.delete(key);

    return null;
  }
}

function deleteSecureToken(key) {
  store.delete(key);
}

function deleteAuthToken() {
  store.delete("authToken");
  store.delete("refreshToken");
  authToken = null;

  devLog("AUTH TOKENS DELETED");
}

function clearElectronAuth() {
  authToken = null;

  deleteSecureToken("authToken");
  deleteSecureToken("refreshToken");

  stopTracking();

  currentUserId = null;
  currentProjectId = null;
  currentTaskId = null;
  trackingSettings = null;

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("electron-logged-out");
  }

  devLog("ELECTRON AUTH CLEARED");
}

function deleteAuthToken() {
  clearElectronAuth();
}

function extractDomain(url) {
  try {
    if (!url) return null;
    const domain = new URL(url).hostname;
    return domain.replace("www.", "");
  } catch {
    return null;
  }
}

function isAccessTokenExpired(token) {
  try {
    if (!token) {
      return true;
    }

    const payloadPart = token.split(".")[1];

    if (!payloadPart) {
      return true;
    }

    const decoded = JSON.parse(
      Buffer.from(payloadPart, "base64url").toString("utf8"),
    );

    if (!decoded?.exp) {
      return true;
    }

    // Refresh if token expires within the next 60 seconds.
    return decoded.exp * 1000 <= Date.now() + 60_000;
  } catch {
    return true;
  }
}

let refreshPromise = null;

async function refreshAuthToken() {
  // If another refresh is already running,
  // wait for that same refresh instead of starting another one.
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshToken = getSecureToken("refreshToken");

      if (!refreshToken) {
        devLog("REFRESH FAILED: NO STORED REFRESH TOKEN");
        return { success: false, invalid: true };
      }

      devLog(
        "REFRESH REQUEST START:",
        API_BASE_URL,
        "REFRESH TOKEN PRESENT:",
        !!refreshToken,
      );

      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        client: "desktop",
        refreshToken,
      });

      devLog(
        "REFRESH RESPONSE:",
        data?.accessToken ? "ACCESS TOKEN RECEIVED" : "NO ACCESS TOKEN",
        data?.refreshToken ? "REFRESH TOKEN RECEIVED" : "NO REFRESH TOKEN",
      );

      authToken = data.accessToken;

      try {
        saveSecureToken("authToken", data.accessToken);
        saveSecureToken("refreshToken", data.refreshToken);
      } catch (storageErr) {
        logError(
          storageErr,
          "TOKEN STORAGE FAILED (non-fatal, using in-memory token)",
        );
      }

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("token-refreshed", data.accessToken);
      }

      return { success: true, accessToken: data.accessToken };
      devLog(
        "ELECTRON TOKEN REFRESH FAILED:",
        JSON.stringify(
          {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          },
          null,
          2,
        ),
      );

      console.error(
        "ELECTRON TOKEN REFRESH FAILED:",
        error.response?.data || error.message,
      );

      // The server rejected the refresh token.
      // Do not keep retrying the same invalid session.
      const isInvalidRefreshToken = error.response?.status === 401;

      if (isInvalidRefreshToken) {
        deleteSecureToken("authToken");
        deleteSecureToken("refreshToken");
        authToken = null;

        stopTracking();

        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("electron-logged-out");
        }

        devLog("INVALID REFRESH TOKEN - ELECTRON SESSION CLEARED");
      } else {
        devLog("TRANSIENT REFRESH FAILURE - KEEPING SESSION, WILL RETRY");
      }

      return { success: false, invalid: isInvalidRefreshToken };
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

let isRefreshingElectronToken = false;
let refreshQueue = [];

function processRefreshQueue(success) {
  refreshQueue.forEach((callback) => callback(success));
  refreshQueue = [];
}

axios.interceptors.response.use(
  (response) => response,

  async (error) => {
    devLog(
      "AXIOS RESPONSE INTERCEPTOR:",
      error.response?.status,
      error.config?.url,
    );

    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Never intercept the refresh request itself
    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    // Only handle unauthorized requests
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Prevent infinite retry
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Another request is already refreshing
    if (isRefreshingElectronToken) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((success) => {
          if (!success) {
            reject(error);
            return;
          }

          originalRequest.headers.Authorization = `Bearer ${authToken}`;

          resolve(axios(originalRequest));
        });
      });
    }

    isRefreshingElectronToken = true;
    try {
      const result = await refreshAuthToken();

      processRefreshQueue(result.success);

      if (!result.success) {
        return Promise.reject(error);
      }

      originalRequest.headers.Authorization = `Bearer ${authToken}`;

      return axios(originalRequest);
    } finally {
      isRefreshingElectronToken = false;
    }
  },
);

function getBrowserInfo() {
  return new Promise((resolve) => {
    const exePath = app.isPackaged
      ? path.join(process.resourcesPath, "BrowserUrlReader.exe")
      : path.join(__dirname, "../resources/BrowserUrlReader.exe");

    execFile(exePath, (error, stdout, stderr) => {
      if (error) {
        devLog("BrowserReader Error:", error.message);
        return resolve(null);
      }

      if (stderr) {
        devLog("BrowserReader stderr:", stderr);
      }

      try {
        const result = JSON.parse(stdout);

        // Program.cs prints {} when no supported browser is active
        if (!result.Browser) {
          return resolve(null);
        }

        resolve(result);
      } catch (err) {
        devLog("BrowserReader Parse Error:", stdout);
        resolve(null);
      }
    });
  });
}

function getCurrentLocation() {
  return new Promise((resolve) => {
    const exePath = app.isPackaged
      ? path.join(process.resourcesPath, "LocationReader", "LocationReader.exe")
      : path.join(
          __dirname,
          "../resources/LocationReader",
          "LocationReader.exe",
        );

    execFile(exePath, (error, stdout, stderr) => {
      if (error) {
        devLog("LocationReader Error:", error.message);
        return resolve(null);
      }

      if (stderr) {
        devLog("LocationReader stderr:", stderr);
      }

      try {
        const result = JSON.parse(stdout);

        if (!result.Success) {
          devLog(result.Error);
          return resolve(null);
        }

        resolve(result);
      } catch (err) {
        devLog("LocationReader Parse Error:", stdout);
        resolve(null);
      }
    });
  });
}

let authToken = null;
let trackingSettings = null;
let screenshotInterval = null;
let activityInterval = null;
let idleCheckInterval = null;
let locationInterval = null;

let appUsageInterval = null;

let mainWindow = null;

let idleCountdownInterval = null;
let idleCountdown = 20;

let mouseClicks = 0;
let keyPresses = 0;
let mouseMoves = 0;

let screenshotMouseClicks = 0;
let screenshotKeyPresses = 0;
let screenshotMouseMoves = 0;

let lastActivityAt = Date.now();
let idleWarningShown = false;

let isTracking = false;
let currentUserId = null;

let currentProjectId = null;
let currentTaskId = null;

let sleepStartedAt = null;
let lastSleepInfo = null;

let internetCheckInterval = null;

let shiftAutoStartedToday = false;
let manuallyStoppedDuringShift = false;
let stoppedForBreak = false;
let autoStoppedForBreak = false;

function getCurrentShift() {
  const schedule = trackingSettings?.shift?.schedule;

  if (!trackingSettings?.shift?.enabled || !Array.isArray(schedule)) {
    return null;
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

  return schedule.find((day) => day.day === today && day.enabled) || null;
}

function isWithinCurrentShift() {
  const shift = getCurrentShift();

  if (!shift) return false;

  const now = new Date();

  const [startHour, startMinute] = shift.startTime.split(":").map(Number);

  const [endHour, endMinute] = shift.endTime.split(":").map(Number);

  const start = new Date(now);
  start.setHours(startHour, startMinute, 0, 0);

  const end = new Date(now);
  end.setHours(endHour, endMinute, 0, 0);

  return now >= start && now <= end;
}

function isWithinScheduledBreak() {
  const shift = getCurrentShift();

  if (!shift || !shift.breaks?.length) {
    return false;
  }

  const now = new Date();

  for (const breakTime of shift.breaks) {
    const [startHour, startMinute] = breakTime.startTime.split(":").map(Number);

    const [endHour, endMinute] = breakTime.endTime.split(":").map(Number);

    const start = new Date(now);
    start.setHours(startHour, startMinute, 0, 0);

    const end = new Date(now);
    end.setHours(endHour, endMinute, 0, 0);

    if (now >= start && now <= end) {
      return true;
    }
  }

  return false;
}

uIOhook.on("click", () => {
  devLog("CLICK DETECTED");

  mouseClicks++;
  screenshotMouseClicks++;

  lastActivityAt = Date.now();

  devLog("idleWarningShown =", idleWarningShown);

  if (idleWarningShown) {
    hideIdleWindow();
  }
});

uIOhook.on("keydown", () => {
  keyPresses++;
  screenshotKeyPresses++;

  lastActivityAt = Date.now();

  if (idleWarningShown) {
    hideIdleWindow();
  }
});

let lastMouseMoveUpdate = 0;

uIOhook.on("mousemove", () => {
  const now = Date.now();

  // Update at most once every 500ms
  if (now - lastMouseMoveUpdate < 500) return;

  devLog("MOUSE MOVE");

  lastMouseMoveUpdate = now;
  lastActivityAt = now;
  mouseMoves++;
  screenshotMouseMoves++;

  if (idleWarningShown) {
    hideIdleWindow();
  }
});

ipcMain.on("reset-idle", () => {
  lastActivityAt = Date.now();
  idleWarningShown = false;

  devLog("IDLE TIMER RESET");
});

// uIOhook.start();

async function getActiveApp() {
  try {
    const browser = await getBrowserInfo();

    if (browser) {
      return {
        appName: browser.Domain,
        windowTitle: browser.Title,
        browser: browser.Browser,
        url: browser.Url,
      };
    }

    const win = await activeWin();

    if (!win) {
      return { appName: "Unknown", windowTitle: "Unknown" };
    }

    const rawUrl = win.url || null;
    const domain = extractDomain(rawUrl);

    const appName = domain || win.owner?.name || "Unknown";

    return {
      appName,
      windowTitle: win.title || "Unknown",
    };
  } catch (err) {
    devLog("ACTIVE WINDOW ERROR:", err);
    return { appName: "Unknown", windowTitle: "Unknown" };
  }
}

async function trackAppUsage() {
  try {
    if (!trackingSettings?.tracking?.applicationTracking) {
      devLog("APPLICATION TRACKING DISABLED");
      return;
    }

    if (!authToken) return;

    const activeApp = await getActiveApp();

    devLog("ACTIVE APP:", activeApp);

    devLog("SENDING USAGE:", {
      appName: activeApp.appName,
      windowTitle: activeApp.windowTitle,
      duration: 10,
      project: currentProjectId,
      task: currentTaskId,
    });

    await axios.post(
      `${API_BASE_URL}/usage/track`,
      {
        appName: activeApp.appName,
        windowTitle: activeApp.windowTitle,
        duration: 10,

        project: currentProjectId,
        task: currentTaskId,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );
  } catch (err) {
    logError(err, "APP USAGE TRACKING");
  }
}

async function sendLocation() {
  try {
    if (!authToken) return;

    if (!trackingSettings?.tracking?.ipTracking) {
      devLog("LOCATION TRACKING DISABLED");
      return;
    }

    const location = await getCurrentLocation();

    if (!location) return;

    devLog("LOCATION:", location);

    await axios.post(
      `${API_BASE_URL}/locations`,
      {
        latitude: location.Latitude,
        longitude: location.Longitude,
        accuracy: location.Accuracy,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    devLog("LOCATION SENT");
  } catch (err) {
    logError(err, "LOCATION TRACKING");
  }
}

async function loadTrackingSettings() {
  try {
    if (!authToken) return false;

    const { data } = await axios.get(
      `${API_BASE_URL}/time-tracking/settings/effective`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    trackingSettings = data;

    devLog("EFFECTIVE SETTINGS:", trackingSettings);

    updateTrackingBarVisibility();

    if (
      trackingSettings?.tracking?.trackingMode === "silent" &&
      mainWindow &&
      !mainWindow.isDestroyed()
    ) {
      devLog("HIDING MAIN WINDOW (SILENT MODE)");
      mainWindow.hide();
    }

    return true;
  } catch (err) {
    logError(err, "TRACKING SETTINGS");

    return false;
  }
}

function updateTrackingBarVisibility() {
  if (!trackingBar || trackingBar.isDestroyed()) {
    return;
  }

  const visibility =
    trackingSettings?.tracking?.statusBarVisibility || "during_tracking";

  devLog("STATUS BAR MODE:", visibility);

  switch (visibility) {
    case "always":
      trackingBar.show();
      break;

    case "hidden":
      trackingBar.hide();
      break;

    case "during_tracking":
      if (isTracking) {
        trackingBar.show();
      } else {
        trackingBar.hide();
      }
      break;
  }
}

async function sendActivity() {
  try {
    devLog("SEND ACTIVITY CALLED", keyPresses, mouseClicks);

    if (!authToken) return;

    devLog("SENDING ACTIVITY:", {
      keyPresses,
      mouseClicks,
      mouseMoves,
      project: currentProjectId,
      task: currentTaskId,
    });

    await axios.post(
      `${API_BASE_URL}/activity`,
      {
        keyPresses,
        mouseClicks,
        mouseMoves,

        project: currentProjectId,
        task: currentTaskId,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    devLog("ACTIVITY SENT:", keyPresses, mouseClicks);

    keyPresses = 0;
    mouseClicks = 0;
    mouseMoves = 0;
  } catch (err) {
    logError(err, "ACTIVITY TRACKING");
  }
}

function shouldIgnoreIdle(data, activeApp) {
  if (data.disableIdleCalculation) {
    devLog(`${activeApp.appName}: Disable Idle Calculation enabled`);

    return true;
  }

  if (data.preventBreakMode) {
    devLog(`${activeApp.appName}: Prevent Break Mode enabled`);

    return true;
  }

  return false;
}

function startIdleCountdown() {
  if (idleCountdownInterval) {
    clearInterval(idleCountdownInterval);
  }

  idleCountdown = 20;

  idleWindow.webContents.send("idle-countdown", {
    countdown: idleCountdown,
  });

  idleCountdownInterval = setInterval(() => {
    idleCountdown--;

    idleWindow.webContents.send("idle-countdown", {
      countdown: idleCountdown,
    });

    if (idleCountdown <= 0) {
      clearInterval(idleCountdownInterval);
      idleCountdownInterval = null;

      devLog("IDLE COUNTDOWN FINISHED");

      hideIdleWindow(false);

      if (mainWindow && !mainWindow.isDestroyed()) {
        devLog("SENDING IDLE TIMEOUT TO DASHBOARD");

        mainWindow.webContents.send("idle-timeout");
      }
    }
  }, 1000);
}

async function checkIdle() {
  if (!authToken) return;

  if (trackingSettings?.tracking?.allowWorkAwayFromComputer) {
    return;
  }

  devLog(
    "ALLOW WORK AWAY:",
    trackingSettings?.tracking?.allowWorkAwayFromComputer,
  );

  if (!trackingSettings?.tracking?.pauseTrackingWhenInactive) {
    return;
  }

  const idleSeconds = Math.floor((Date.now() - lastActivityAt) / 1000);

  const idleLimit = (trackingSettings?.tracking?.inactivityMinutes || 3) * 60;

  devLog({
    pauseTrackingWhenInactive:
      trackingSettings?.tracking?.pauseTrackingWhenInactive,
    inactivityMinutes: trackingSettings?.tracking?.inactivityMinutes,
    idleSeconds,
    idleLimit,
    idleWarningShown,
  });

  if (idleSeconds < idleLimit || idleWarningShown) {
    return;
  }

  try {
    // Get the current active application
    const activeApp = await getActiveApp();

    // Ask the backend if this app prevents break mode
    const { data } = await axios.get(
      `${API_BASE_URL}/app-classifications/check-break-mode`,
      {
        params: {
          appName: activeApp.appName,
        },
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    if (shouldIgnoreIdle(data, activeApp)) {
      lastActivityAt = Date.now();
      return;
    }

    devLog("PASSED IDLE LIMIT");

    idleWarningShown = true;

    devLog(`USER IDLE FOR ${idleSeconds} SECONDS`);

    if (idleWindow) {
      devLog("SHOW IDLE WINDOW");

      idleWindow.center();
      idleWindow.setAlwaysOnTop(true, "screen-saver");
      idleWindow.show();
      idleWindow.focus();
      startIdleCountdown();
    }
  } catch (err) {
    logError(err, "CHECK BREAK MODE");
  }
}

async function handleAuthDeepLink(deepLinkUrl) {
  try {
    const parsed = new URL(deepLinkUrl);

    if (parsed.hostname !== "auth") {
      devLog("IGNORING NON-AUTH DEEP LINK:", deepLinkUrl);
      return;
    }

    const accessToken = parsed.searchParams.get("accessToken");
    const refreshToken = parsed.searchParams.get("refreshToken");

    if (!accessToken || !refreshToken) {
      logError(new Error("Deep link missing tokens"), "OAUTH DEEP LINK");
      return;
    }

    authToken = accessToken;

    saveSecureToken("authToken", accessToken);
    saveSecureToken("refreshToken", refreshToken);

    devLog("OAUTH TOKENS SAVED FROM DEEP LINK");

    const deviceInfo = getDeviceInfo();

    await axios.post(`${API_BASE_URL}/users/device`, deviceInfo, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    await loadTrackingSettings();

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.loadURL(`${WEB_APP_URL}/desktop`);
      mainWindow.show();
      mainWindow.focus();
    }
  } catch (err) {
    logError(err, "OAUTH DEEP LINK HANDLING");
  }
}

// macOS: deep link received while app is already running, or app is
// launched fresh via the link (Electron queues it until 'ready')
app.on("open-url", (event, url) => {
  event.preventDefault();
  handleAuthDeepLink(url);
});

// Windows/Linux: a second launch attempt (e.g. via deep link) is
// redirected here instead of opening a second instance
app.on("second-instance", (event, argv) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }

  const deepLinkArg = argv.find((arg) => arg.startsWith("workcomposer://"));

  if (deepLinkArg) {
    handleAuthDeepLink(deepLinkArg);
  }
});

ipcMain.on("save-token", async (_, tokens) => {
  try {
    const { accessToken, refreshToken } = tokens;

    if (!accessToken || !refreshToken) {
      throw new Error("Access token or refresh token missing");
    }

    authToken = accessToken;

    saveSecureToken("authToken", accessToken);
    saveSecureToken("refreshToken", refreshToken);

    devLog("ELECTRON AUTH TOKENS SAVED SECURELY");

    const deviceInfo = getDeviceInfo();

    await axios.post(`${API_BASE_URL}/users/device`, deviceInfo, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    await loadTrackingSettings();
  } catch (err) {
    logError(err, "DEVICE REGISTRATION");
  }
});

const checkDeviceStatus = async () => {
  try {
    if (!authToken) return;

    const deviceId = store.get("deviceId");

    if (!deviceId) return;

    const response = await axios.get(
      `${API_BASE_URL}/users/device/${deviceId}/status`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    devLog("DEVICE STATUS:", response.data);

    if (!response.data.authorized) {
      devLog("DEVICE REMOTELY SIGNED OUT");

      authToken = null;
      store.delete("authToken");

      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("device-signed-out");
      }
    }
  } catch (err) {
    logError(err, "DEVICE STATUS CHECK");
  }
};

function getScreenshotDelay() {
  devLog("SCREEN CAPTURE SETTINGS:", trackingSettings?.screenCapture);

  const minutes = trackingSettings?.screenCapture?.screenshotFrequency || 5;

  const randomize = trackingSettings?.screenCapture?.randomizeFrequency;

  devLog("RANDOMIZE:", randomize);

  if (!randomize) {
    return minutes * 60 * 1000;
  }

  const min = minutes * 0.8;
  const max = minutes * 1.2;

  const randomMinutes = Math.random() * (max - min) + min;

  devLog("RANDOM MINUTES:", randomMinutes);

  return randomMinutes * 60 * 1000;
}

function startScreenshotInterval() {
  if (screenshotInterval) {
    return;
  }

  const scheduleNext = () => {
    const delay = getScreenshotDelay();

    devLog("NEXT SCREENSHOT IN", Math.round(delay / 1000), "seconds");

    screenshotInterval = setTimeout(async () => {
      await captureScreenshot();

      screenshotInterval = null;

      if (isTracking) {
        scheduleNext();
      }
    }, delay);
  };

  scheduleNext();
}

async function checkInternet() {
  if (!isTracking) return;

  if (!trackingSettings?.tracking?.stopTrackingWithoutInternet) {
    return;
  }

  const online = net.isOnline();

  devLog("INTERNET:", online);

  if (!online) {
    devLog("NO INTERNET - REQUESTING TRACKING STOP");

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("auto-stop-tracking");
    }

    return;
  }
}

async function updateTrackingStatus(isTracking) {
  try {
    if (!authToken) return;

    const deviceId = getDeviceInfo().deviceId;

    if (!deviceId) return;

    await axios.post(
      `${API_BASE_URL}/users/device/${deviceId}/tracking`,
      {
        isTracking,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    devLog("TRACKING STATUS UPDATED:", isTracking);
  } catch (err) {
    devWarn(
      "FAILED TO UPDATE TRACKING STATUS:",
      err?.response?.data || err.message,
    );
  }
}

ipcMain.on("start-tracking", (_, data) => {
  devLog("START TRACKING RECEIVED");

  startTracking(data?.projectId || null, data?.taskId || null);
});

ipcMain.on("open-main-window", () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.show();
  mainWindow.focus();
});

ipcMain.on("show-system-notification", (_, data) => {

  if (!Notification.isSupported()) {
    devWarn("SYSTEM NOTIFICATIONS ARE NOT SUPPORTED");
    return;
  }

  const notification = new Notification({
    title: data?.title || "WorkComposer",
    body: data?.body || "",
  });

  notification.show();

});

ipcMain.on("switch-task", (_, data) => {
  devLog("SWITCH TASK:", data);

  currentProjectId = data?.projectId || null;
  currentTaskId = data?.taskId || null;
});

async function startTracking(projectId = null, taskId = null) {
  devLog("START TRACKING");

  if (!trackingSettings) {
    devLog("TRACKING SETTINGS NOT LOADED YET - LOADING NOW");
    await loadTrackingSettings();
  }

  devLog("TODAY SHIFT:", getCurrentShift());
  devLog("WITHIN SHIFT:", isWithinCurrentShift());
  devLog("WITHIN BREAK:", isWithinScheduledBreak());

  isTracking = true;

  updateTrackingStatus(true);

  currentProjectId = projectId;
  currentTaskId = taskId;

  startScreenshotInterval();

  if (!activityInterval) {
    activityInterval = setInterval(sendActivity, 10000);
  }

  if (!locationInterval) {
    locationInterval = setInterval(sendLocation, 30000);
    sendLocation();
  }

  if (!appUsageInterval) {
    appUsageInterval = setInterval(trackAppUsage, 10000);

    trackAppUsage();
  }

  if (!idleCheckInterval) {
    idleCheckInterval = setInterval(checkIdle, 5000);
  }

  if (!internetCheckInterval) {
    internetCheckInterval = setInterval(checkInternet, 5000);
  }

  updateTrackingBarVisibility();
}

function stopTracking() {
  devLog("STOP TRACKING RECEIVED");
  isTracking = false;

  updateTrackingStatus(false);

  if (screenshotInterval) {
    clearInterval(screenshotInterval);
    screenshotInterval = null;
  }

  if (activityInterval) {
    clearInterval(activityInterval);
    activityInterval = null;
  }

  if (locationInterval) {
    clearInterval(locationInterval);
    locationInterval = null;
  }

  if (appUsageInterval) {
    clearInterval(appUsageInterval);
    appUsageInterval = null;
  }

  if (idleCheckInterval) {
    clearInterval(idleCheckInterval);
    idleCheckInterval = null;
  }

  if (internetCheckInterval) {
    clearInterval(internetCheckInterval);
    internetCheckInterval = null;
  }

  if (trackingBar && !trackingBar.isDestroyed()) {
    trackingBar.webContents.send("tracking-update", {
      duration: 0,
      isTracking: false,
    });

    if (trackingSettings?.tracking?.statusBarVisibility === "during_tracking") {
      trackingBar.hide();
    }
  }
}

ipcMain.on("stop-tracking", () => {
  stopTracking();

  manuallyStoppedDuringShift = true;
});

ipcMain.on("trackingbar-stop", () => {
  devLog("TRACKING BAR STOP CLICKED");

  // Notify the dashboard
  if (mainWindow && !mainWindow.isDestroyed()) {
    devLog("SENDING trackingbar-stop TO DASHBOARD");

    mainWindow.webContents.send("trackingbar-stop");
  }

  // Hide the floating toolbar immediately
  if (trackingBar && !trackingBar.isDestroyed()) {
    trackingBar.hide();
  }
});

ipcMain.on("tracking-update", (_, data) => {
  if (trackingBar && !trackingBar.isDestroyed()) {
    trackingBar.webContents.send("tracking-update", data);
  }
});

ipcMain.on("reload-tracking-settings", async () => {
  devLog("RELOADING TRACKING SETTINGS");

  await loadTrackingSettings();
});

ipcMain.on("show-main-window", () => {
  if (!mainWindow) return;

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.show();
  mainWindow.focus();
});

async function uploadScreenshot(filePath) {
  try {
    if (!authToken) {
      return;
    }

    const activeApp = await getActiveApp();

    const formData = new FormData();

    formData.append("screenshot", fs.createReadStream(filePath));

    formData.append("appName", activeApp.appName);
    formData.append("windowTitle", activeApp.windowTitle);

    formData.append("keyPresses", screenshotKeyPresses);
    formData.append("mouseClicks", screenshotMouseClicks);
    formData.append("mouseMoves", screenshotMouseMoves);

    const totalActions =
      screenshotKeyPresses + screenshotMouseClicks + screenshotMouseMoves;

    const activityScore = Math.min(Math.round((totalActions / 50) * 100), 100);

    formData.append("activityScore", activityScore);

    formData.append("project", currentProjectId || "");
    formData.append("task", currentTaskId || "");

    await axios.post(`${API_BASE_URL}/screenshots/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`,
      },
    });

    screenshotKeyPresses = 0;
    screenshotMouseClicks = 0;
    screenshotMouseMoves = 0;
  } catch (err) {
    logError(err, "SCREENSHOT UPLOAD");
  }
}

async function blurScreenshot(filePath) {
  const blurMode = trackingSettings?.screenCapture?.blurScreenshots;

  if (!blurMode || blurMode === "disabled") {
    return;
  }

  let sigma = 0;

  switch (blurMode) {
    case "slightly_blurred":
      sigma = 4;
      break;

    case "maximum_blurring":
      sigma = 12;
      break;

    default:
      return;
  }

  await sharp(filePath)
    .blur(sigma)
    .toFile(filePath + ".tmp");

  fs.renameSync(filePath + ".tmp", filePath);

  devLog("SCREENSHOT BLURRED:", blurMode);
}

async function captureScreenshot() {
  try {
    if (!trackingSettings?.screenCapture?.enabled) {
      devLog("SCREENSHOTS DISABLED");
      return;
    }

    const screenshotsDir = path.join(app.getPath("userData"), "screenshots");
    fs.mkdirSync(screenshotsDir, { recursive: true });

    const filePath = path.join(screenshotsDir, `shot-${Date.now()}.jpg`);

    const image = await screenshot(); // returns Buffer

    fs.writeFileSync(filePath, image);

    if (!fs.existsSync(filePath)) {
      throw new Error("Screenshot not created");
    }

    // Blur if enabled
    await blurScreenshot(filePath);

    await uploadScreenshot(filePath);

    try {
      fs.unlinkSync(filePath);
    } catch {}
  } catch (err) {
    logError(err, "SCREENSHOT CAPTURE");
  }
}

let tray = null;
let trackingBar = null;

let idleWindow = null;

function hideIdleWindow(resetIdle = true) {
  if (!idleWindow || idleWindow.isDestroyed()) return;

  if (idleCountdownInterval) {
    clearInterval(idleCountdownInterval);
    idleCountdownInterval = null;
  }

  idleWindow.hide();

  if (resetIdle) {
    idleWindow.webContents.send("idle-resumed");

    idleWarningShown = false;
    lastActivityAt = Date.now();
  }

  devLog("IDLE WINDOW HIDDEN");
}

function createTrackingBar() {
  devLog("CREATING TRACKING BAR");

  trackingBar = new BrowserWindow({
    width: 380,
    height: 46,
    frame: false,
    transparent: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    movable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  devLog("TRACKING BAR OBJECT:", !!trackingBar);

  trackingBar.loadURL(`${WEB_APP_URL}/tracking-bar`);

  trackingBar.webContents.on("did-finish-load", () => {
    devLog("TRACKING BAR LOADED");
  });

  trackingBar.webContents.on(
    "did-fail-load",
    (_, errorCode, errorDescription) => {
      devLog("TRACKING BAR FAILED:", errorCode, errorDescription);
    },
  );

  trackingBar.once("ready-to-show", () => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    const barWidth = 260;
    const barHeight = 52;

    trackingBar.setPosition(
      Math.round((width - barWidth) / 2),
      height - barHeight - 20,
    );
  });
}

function createIdleWindow() {
  devLog("CREATE IDLE WINDOW CALLED");

  idleWindow = new BrowserWindow({
    width: 900,
    height: 780,
    backgroundColor: "#162742",
    center: true,
    resizable: false,
    maximizable: false,
    minimizable: false,
    frame: false,
    useContentSize: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  idleWindow.loadURL(`${WEB_APP_URL}/idle`);

  idleWindow.webContents.on("did-finish-load", () => {
    devLog("IDLE WINDOW LOADED");
  });

  idleWindow.webContents.on(
    "did-fail-load",
    (_, errorCode, errorDescription) => {
      devLog("IDLE WINDOW FAILED:", errorCode, errorDescription);
    },
  );
}

function createWindow() {

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    autoHideMenuBar: false,

    icon: path.join(__dirname, "../assets/workcomposer.ico"),

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const isOAuthStartUrl = (url) =>
    /\/api\/auth\/(google|microsoft|apple)$/.test(new URL(url).pathname);

  const openInSystemBrowser = (url) => {
    const target = new URL(url);
    target.searchParams.set("client", "desktop");

    require("electron").shell.openExternal(target.toString());
  };

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (isOAuthStartUrl(url)) {
      event.preventDefault();
      openInSystemBrowser(url);
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isOAuthStartUrl(url)) {
      openInSystemBrowser(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  if (authToken) {
    devLog("OPENING DESKTOP");
    mainWindow.loadURL(`${WEB_APP_URL}/desktop`);
  } else {
    devLog("OPENING LOGIN");
    mainWindow.loadURL(`${WEB_APP_URL}/authenticate/login`);
  }

  mainWindow.on("close", (event) => {
    event.preventDefault();
    mainWindow.hide();
  });
}

async function getConnectionDiagnostics() {
  const apiReachable = await new Promise((resolve) => {
    const socket = net.createConnection(
      {
        host: "localhost",
        port: 5000,
        timeout: 2000,
      },
      () => {
        socket.end();
        resolve(true);
      },
    );

    socket.on("error", () => resolve(false));
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });

  return {
    api: apiReachable,
    socket: false,
    tracking: isTracking,
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  };
}

function createAppMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Start Tracking",
          click() {
            startTracking();
          },
        },
        {
          label: "Stop Tracking",
          click() {
            stopTracking();
          },
        },
        { type: "separator" },
        {
          label: "Settings",
          click() {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.show();
              mainWindow.focus();
              mainWindow.webContents.send("open-settings");
            }
          },
        },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: "Ctrl+Q",
          click() {
            app.exit();
          },
        },
      ],
    },

    {
      label: "Edit",
      submenu: [
        { role: "undo", label: "Undo" },
        { role: "redo", label: "Redo" },
        { type: "separator" },
        { role: "cut", label: "Cut" },
        { role: "copy", label: "Copy" },
        { role: "paste", label: "Paste" },
        { role: "selectAll", label: "Select All" },
      ],
    },

    {
      label: "View",
      submenu: [
        {
          label: "Reload",
          accelerator: "Ctrl+R",
          click() {
            if (mainWindow) {
              mainWindow.reload();
            }
          },
        },
        {
          label: "Force Reload",
          accelerator: "Ctrl+Shift+R",
          click() {
            if (mainWindow) {
              mainWindow.webContents.reloadIgnoringCache();
            }
          },
        },
        { type: "separator" },
        {
          label: "Toggle Full Screen",
          accelerator: "F11",
          click() {
            if (mainWindow) {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          },
        },
        { type: "separator" },
        {
          label: "Developer Tools",
          accelerator: "Ctrl+Shift+I",
          click() {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          },
        },
      ],
    },

    {
      label: "Window",
      submenu: [
        {
          label: "Minimize",
          accelerator: "Ctrl+W",
          role: "minimize",
        },
        {
          label: "Maximize",
          accelerator: "Ctrl+M",
          click() {
            if (!mainWindow) return;

            if (mainWindow.isMaximized()) {
              mainWindow.unmaximize();
            } else {
              mainWindow.maximize();
            }
          },
        },
        { type: "separator" },
        {
          label: "Reset Window Position",
          click() {
            if (!mainWindow) return;

            mainWindow.setSize(1400, 900);
            mainWindow.center();
          },
        },
      ],
    },

    {
      label: "Help",
      submenu: [
        {
          label: "About WorkComposer",
          click() {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "About WorkComposer",
              message: "WorkComposer Desktop",
              detail:
                `Version ${app.getVersion()}\n\n` +
                `Electron ${process.versions.electron}\n` +
                `Chrome ${process.versions.chrome}\n` +
                `Node ${process.versions.node}`,
              buttons: ["OK"],
            });
          },
        },

        {
          label: "Connection Diagnostics",
          async click() {
            const info = await getConnectionDiagnostics();

            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "Connection Diagnostics",
              message: "WorkComposer Desktop",
              detail:
                `API Server: ${info.api ? "✓ Connected" : "✗ Offline"}\n\n` +
                `Socket: ${info.socket ? "✓ Connected" : "✗ Disconnected"}\n\n` +
                `Tracking: ${info.tracking ? "✓ Running" : "○ Stopped"}\n\n` +
                `Electron: ${info.electron}\n` +
                `Chrome: ${info.chrome}\n` +
                `Node: ${info.node}`,
            });
          },
        },

        {
          label: "Clear Cache and Restart",
          async click() {
            try {
              const result = await dialog.showMessageBox(mainWindow, {
                type: "warning",
                title: "Clear Cache and Restart",
                message: "Clear application cache?",
                detail:
                  "WorkComposer will clear its cached data and restart. Your account and server data will not be deleted.",
                buttons: ["Cancel", "Clear & Restart"],
                defaultId: 1,
                cancelId: 0,
              });

              if (result.response !== 1) {
                return;
              }

              await session.defaultSession.clearCache();

              await session.defaultSession.clearStorageData({
                storages: ["appcache", "shadercache"],
              });

              app.relaunch();
              app.exit();
            } catch (error) {
              logError(error, "CLEAR CACHE");

              dialog.showErrorBox(
                "Clear Cache Failed",
                error.message || "Unable to clear application cache.",
              );
            }
          },
        },

        {
          label: "Reset Local Database",
          async click() {
            const result = await dialog.showMessageBox(mainWindow, {
              type: "warning",
              title: "Reset Local Database",
              message: "Reset local WorkComposer data?",
              detail:
                "This will remove locally stored WorkComposer data, including the saved login session. Your data already synchronized with the server will not be deleted.",
              buttons: ["Cancel", "Reset"],
              defaultId: 0,
              cancelId: 0,
            });

            if (result.response !== 1) {
              return;
            }

            try {
              store.clear();

              await dialog.showMessageBox(mainWindow, {
                type: "info",
                title: "Reset Complete",
                message: "Local data has been reset.",
                detail: "WorkComposer will restart now.",
                buttons: ["OK"],
              });

              app.relaunch();
              app.exit();
            } catch (error) {
              logError(error, "RESET LOCAL DATA");

              dialog.showErrorBox(
                "Reset Failed",
                error.message || "Unable to reset local data.",
              );
            }
          },
        },

        { type: "separator" },

        {
          label: "Check For Updates...",
          click() {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "Check For Updates",
              message: "WorkComposer is up to date",
              detail: `Current version: ${app.getVersion()}`,
              buttons: ["OK"],
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(async () => {
  devLog("APP READY FIRED");

  try {
    authToken = getStoredAuthToken();

    const hasRefreshToken = !!getSecureToken("refreshToken");

    devLog(
      "TOKEN LOADED:",
      !!authToken,
      "REFRESH TOKEN PRESENT:",
      hasRefreshToken,
    );

    if (authToken) {
      if (isAccessTokenExpired(authToken)) {
        devLog("STORED ACCESS TOKEN EXPIRED - REFRESHING...");

        const result = await refreshAuthToken();

        if (result.success) {
          devLog("ACCESS TOKEN REFRESHED BEFORE WINDOW");
        } else if (result.invalid) {
          devLog("REFRESH TOKEN INVALID - LOGIN REQUIRED");
          authToken = null;
        } else {
          // Transient failure (e.g. network/server unreachable at startup).
          // Keep the stored token and let it try again later rather than
          // forcing a logout.
          devLog("ACCESS TOKEN REFRESH FAILED (TRANSIENT) - KEEPING SESSION");
        }
      } else {
        devLog("STORED ACCESS TOKEN VALID");
      }
    } else if (hasRefreshToken) {
      devLog("NO ACCESS TOKEN - REFRESHING FROM STORED REFRESH TOKEN...");

      const result = await refreshAuthToken();

      if (result.success) {
        devLog("ACCESS TOKEN REFRESHED BEFORE WINDOW");
      } else if (result.invalid) {
        devLog("REFRESH TOKEN INVALID - LOGIN REQUIRED");
        authToken = null;
      } else {
        devLog("ACCESS TOKEN REFRESH FAILED (TRANSIENT) - WILL RETRY LATER");
      }
    } else {
      devLog("NO STORED AUTH TOKENS - LOGIN REQUIRED");
    }

    if (authToken) {
      devLog("LOADING TRACKING SETTINGS ON STARTUP");
      await loadTrackingSettings();
    }
  } catch (error) {
    logError(error, "TOKEN LOAD/REFRESH");
    authToken = null;
  }

  createWindow();
  devLog("WINDOW CREATED");

  const coldStartDeepLink = process.argv.find((arg) =>
    arg.startsWith("workcomposer://"),
  );

  if (coldStartDeepLink) {
    handleAuthDeepLink(coldStartDeepLink);
  }

  try {
    uIOhook.start();
    devLog("UIOHOOK STARTED");
  } catch (error) {
    logError(error, "UIOHOOK START");
  }
  createAppMenu();
  createTrackingBar();
  createIdleWindow();

  setInterval(() => {
    if (!trackingSettings?.shift?.enabled) return;

    if (!trackingSettings?.shift?.autoStartTracking) return;

    if (isTracking) return;

    if (manuallyStoppedDuringShift) return;

    if (shiftAutoStartedToday) return;

    if (!isWithinCurrentShift()) {
      shiftAutoStartedToday = false;
      manuallyStoppedDuringShift = false;
      return;
    }

    devLog("AUTO STARTING TRACKING");

    shiftAutoStartedToday = true;
    manuallyStoppedDuringShift = false;

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("auto-start-tracking");
    }
  }, 60000);

  setInterval(() => {
    if (!trackingSettings?.shift?.enabled) return;

    if (!trackingSettings?.shift?.autoStopTracking) return;

    if (!isTracking) return;

    if (isWithinCurrentShift()) return;

    devLog("AUTO STOPPING TRACKING");

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("auto-stop-tracking");
    }
  }, 60000);

  setInterval(() => {
    if (!trackingSettings?.shift?.enabled) return;

    if (!trackingSettings?.shift?.stopTrackingDuringBreaks) return;

    if (!isTracking) return;

    if (!isWithinCurrentShift()) return;

    if (!isWithinScheduledBreak()) {
      stoppedForBreak = false;
      return;
    }

    if (stoppedForBreak) return;

    stoppedForBreak = true;
    autoStoppedForBreak = true;

    devLog("AUTO STOP FOR BREAK");

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("auto-stop-tracking");
    }
  }, 60000);

  setInterval(() => {
    if (!trackingSettings?.shift?.enabled) return;

    if (!trackingSettings?.shift?.stopTrackingDuringBreaks) return;

    // Only resume if WE stopped it
    if (!autoStoppedForBreak) return;

    // User already started tracking manually
    if (isTracking) return;

    // Still on break
    if (isWithinScheduledBreak()) return;

    // Shift already ended
    if (!isWithinCurrentShift()) {
      autoStoppedForBreak = false;
      stoppedForBreak = false;
      return;
    }

    devLog("AUTO RESUME AFTER BREAK");

    autoStoppedForBreak = false;
    stoppedForBreak = false;

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("auto-start-tracking");
    }
  }, 60000);

  setInterval(() => {
    checkDeviceStatus();
  }, 30000);

  setInterval(async () => {
    if (!authToken) return;

    if (isAccessTokenExpired(authToken)) {
      devLog("PROACTIVE TOKEN REFRESH TRIGGERED");
      await refreshAuthToken();
    }
  }, 60000);

  powerMonitor.on("suspend", () => {
    devLog("SYSTEM SLEEP");

    sleepStartedAt = Date.now();
  });

  powerMonitor.on("resume", () => {
    devLog("SYSTEM RESUMED");

    if (!sleepStartedAt) return;

    const sleptMinutes = (Date.now() - sleepStartedAt) / 1000 / 60;

    devLog("SLEPT FOR", sleptMinutes, "MINUTES");

    lastSleepInfo = {
      sleptMinutes,
      resumedAt: Date.now(),
    };

    sleepStartedAt = null;
  });

  tray = new Tray(path.join(__dirname, "../assets/workcomposer-tray.png"));

  tray.setToolTip("WorkComposer");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show WorkComposer",
      click: () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },

    {
      type: "separator",
    },

    {
      label: "Quit",
      click: () => {
        app.exit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("get-token", async () => {
  return authToken;
});

ipcMain.handle("refresh-token", async () => {
  try {
    const result = await refreshAuthToken();

    if (!result.success) {
      return {
        success: false,
        accessToken: null,
        invalid: !!result.invalid,
      };
    }

    return {
      success: true,
      accessToken: authToken,
      invalid: false,
    };
  } catch (error) {
    console.error("IPC TOKEN REFRESH ERROR:", error);

    // Unexpected error, not a confirmed invalid refresh token —
    // treat as transient so the renderer doesn't force a logout.
    return {
      success: false,
      accessToken: null,
      invalid: false,
    };
  }
});

ipcMain.handle("get-device-id", () => {
  let deviceId = store.get("deviceId");

  if (!deviceId) {
    deviceId = crypto.randomUUID();

    store.set("deviceId", deviceId);

    devLog("NEW DEVICE ID CREATED:", deviceId);
  }

  return deviceId;
});

ipcMain.handle("get-device-info", () => {
  let deviceId = store.get("deviceId");

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    store.set("deviceId", deviceId);
  }

  return {
    deviceId,
    platform: process.platform,
    appVersion: app.getVersion(),
    hostname: require("os").hostname(),
  };
});

ipcMain.handle("get-last-sleep", () => {
  const sleep = lastSleepInfo;

  lastSleepInfo = null;

  return sleep;
});

ipcMain.handle("logout-electron", async () => {
  try {
    devLog("ELECTRON LOGOUT REQUESTED");

    clearElectronAuth();

    return {
      success: true,
    };
  } catch (error) {
    logError(error, "ELECTRON LOGOUT");

    return {
      success: false,
      message: error.message,
    };
  }
});
