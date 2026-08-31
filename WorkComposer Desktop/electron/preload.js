const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  saveToken: (accessToken, refreshToken) =>
    ipcRenderer.send("save-token", {
      accessToken,
      refreshToken,
    }),

  getToken: () => ipcRenderer.invoke("get-token"),

  refreshToken: () => ipcRenderer.invoke("refresh-token"),

  logoutElectron: () => ipcRenderer.invoke("logout-electron"),

  onTokenRefreshed: (callback) => {
    const listener = (_, accessToken) => callback(accessToken);

    ipcRenderer.on("token-refreshed", listener);

    return () => {
      ipcRenderer.removeListener("token-refreshed", listener);
    };
  },

  getDeviceId: () => ipcRenderer.invoke("get-device-id"),

  getDeviceInfo: () => ipcRenderer.invoke("get-device-info"),

  onElectronLoggedOut: (callback) => {
    const listener = () => callback();

    ipcRenderer.on("electron-logged-out", listener);

    return () => {
      ipcRenderer.removeListener("electron-logged-out", listener);
    };
  },

  onDeviceSignedOut: (callback) => {
    const listener = () => callback();

    ipcRenderer.on("device-signed-out", listener);

    return () => {
      ipcRenderer.removeListener("device-signed-out", listener);
    };
  },

  startTracking: (projectId, taskId) =>
    ipcRenderer.send("start-tracking", {
      projectId,
      taskId,
    }),

  switchTask: (projectId, taskId) =>
    ipcRenderer.send("switch-task", {
      projectId,
      taskId,
    }),

  onTrackingBarStop: (callback) => {
    const listener = () => callback();

    ipcRenderer.on("trackingbar-stop", listener);

    return () => {
      ipcRenderer.removeListener("trackingbar-stop", listener);
    };
  },

  stopTrackingFromBar: () => ipcRenderer.send("trackingbar-stop"),

  stopTracking: () => ipcRenderer.send("stop-tracking"),

  openMainWindow: () => ipcRenderer.send("open-main-window"),

  showSystemNotification: (title, body) =>
    ipcRenderer.send("show-system-notification", {
      title,
      body,
    }),

  reloadTrackingSettings: () => ipcRenderer.send("reload-tracking-settings"),

  onIdleWarning: (callback) => {
    const listener = () => callback();

    ipcRenderer.on("idle-warning", listener);

    return () => {
      ipcRenderer.removeListener("idle-warning", listener);
    };
  },

  onAutoStartTracking: (callback) => {
    const listener = (...args) => {
      callback();
    };

    ipcRenderer.on("auto-start-tracking", listener);

    return () => {
      ipcRenderer.removeListener("auto-start-tracking", listener);
    };
  },

  onAutoStopTracking: (callback) => {
    const listener = () => {
      callback();
    };

    ipcRenderer.on("auto-stop-tracking", listener);

    return () => {
      ipcRenderer.removeListener("auto-stop-tracking", listener);
    };
  },

  rendererReadyForAutoStart: () =>
    ipcRenderer.send("renderer-ready-auto-start"),

  onIdleStart: (callback) => {
    const listener = (_, data) => callback(data);

    ipcRenderer.on("idle-start", listener);

    return () => {
      ipcRenderer.removeListener("idle-start", listener);
    };
  },

  onIdleCountdown: (callback) => {
    const listener = (_, data) => callback(data);

    ipcRenderer.on("idle-countdown", listener);

    return () => {
      ipcRenderer.removeListener("idle-countdown", listener);
    };
  },

  onIdleResumed: (callback) => {
    const listener = () => callback();

    ipcRenderer.on("idle-resumed", listener);

    return () => {
      ipcRenderer.removeListener("idle-resumed", listener);
    };
  },

  onIdleTimeout: (callback) => {
    const listener = () => callback();

    ipcRenderer.on("idle-timeout", listener);

    return () => {
      ipcRenderer.removeListener("idle-timeout", listener);
    };
  },

  getLastSleep: () => ipcRenderer.invoke("get-last-sleep"),

  resetIdle: () => ipcRenderer.send("reset-idle"),

  updateTrackingBar: (data) => ipcRenderer.send("tracking-update", data),

  onTrackingUpdate: (callback) => {
    const listener = (_, data) => callback(data);

    ipcRenderer.on("tracking-update", listener);

    return () => {
      ipcRenderer.removeListener("tracking-update", listener);
    };
  },
});
