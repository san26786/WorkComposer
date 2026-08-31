"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import type { ReactNode } from "react";

import toast from "react-hot-toast";

import API from "@/api";
import { useProject } from "@/context/ProjectContext";
import socket from "@/socket/socket";
import useEffectiveTrackingSettings from "@/hooks/useEffectiveTrackingSettings";
import { useDashboard } from "@/context/DashboardContext";

/*TYPES */

type TimerContextType = {
  timer: any;
  isTracking: boolean;

  start: (
    userId: string,
    projectId?: string | null,
    taskId?: string | null
  ) => void;

  switchTask: (
    projectId: string | null,
    taskId: string | null
  ) => void;

  stop: () => void;

  finishDay: () => Promise<any>;

  duration: number;

  todayWorkSeconds: number;
  todayBreakSeconds: number;
  finishedToday: boolean;
  refreshTodayWork: () => Promise<void>;
  lastStartedAt: number;
  lastStoppedAt: number;
};

/* CONTEXT */

const TimerContext = createContext<TimerContextType | null>(null);

/* PROVIDER */
type Props = {
  children: ReactNode;
};

export const TimerProvider = ({ children }: Props) => {
  const [timer, setTimer] = useState<any>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [todayWorkSeconds, setTodayWorkSeconds] = useState(0);
  const [todayBreakSeconds, setTodayBreakSeconds] = useState(0);
  const [lastStoppedAt, setLastStoppedAt] = useState(0);
  const [lastStartedAt, setLastStartedAt] = useState(0);
  const [finishedToday, setFinishedToday] = useState(false);
  const [attendanceChecked, setAttendanceChecked] = useState(false);
  const [showIdleModal, setShowIdleModal] = useState(false);
  const [idleCountdown, setIdleCountdown] = useState(20);
  const autoStarted = useRef(false);

  const isTrackingRef = useRef(false);

  const handlingSleep = useRef(false);


  const { user } = useDashboard();

  const {
    settings: effectiveSettings,
  } = useEffectiveTrackingSettings();


  const refreshTodayWork = async () => {
    try {
      const { data } = await API.get("/sessions/today");

      setTodayWorkSeconds(data.workSeconds);
      setTodayBreakSeconds(data.breakSeconds);
    } catch (err) {
      console.error(err);
    }
  };


  // START
  const start = useCallback((
    userId: string,
    projectId: string | null = null,
    taskId: string | null = null
  ) => {
    // Tracking can only be controlled by the desktop app.
    if (!window.electronAPI) return;

    if (isTracking) return;

    if (!attendanceChecked) {
      return;
    }

    if (finishedToday) {
      toast.error(
        "You have already finished working for today. You can start again tomorrow."
      );
      return;
    }

    socket.emit("startTimer", {
      userId,
      project: projectId,
      task: taskId,
    });
  }, [isTracking, attendanceChecked, finishedToday]);

  useEffect(() => {
    if (!window.electronAPI) return;
    if (!user) return;

    if (!effectiveSettings) return;

    if (!attendanceChecked) return;

    if (finishedToday) {
      toast.error(
        "You have already finished working for today. You can start again tomorrow."
      );
      return;
    }

    const mode = effectiveSettings?.tracking?.trackingMode;

    if (
      mode === "manual" &&
      !effectiveSettings?.tracking?.startTrackingOnBoot
    ) {
      return;
    }

    if (isTracking || timer) return;

    if (autoStarted.current) return;

    autoStarted.current = true;

    start(user._id, null, null);

  }, [
    user,
    effectiveSettings,
    timer,
    isTracking,
    start,
    attendanceChecked,
    finishedToday,
  ]);

  useEffect(() => {
    isTrackingRef.current = isTracking;
  }, [isTracking]);


  useEffect(() => {
    if (!user) return;

    const removeListener =
      window.electronAPI?.onAutoStartTracking(() => {

        if (isTrackingRef.current) return;

        start(user._id, null, null);
      });

    return () => {
      removeListener?.();
    };
  }, [user]);

  // SWITCH TASK
  const switchTask = (
    projectId: string | null,
    taskId: string | null
  ) => {
    if (!window.electronAPI) return;

    window.electronAPI.switchTask(
      projectId,
      taskId
    );

    if (!timer?._id) return;

    socket.emit("switchTask", {
      userId: timer.user,
      project: projectId,
      task: taskId,
    });
  };


  // STOP
  const stop = useCallback(() => {
    if (!window.electronAPI) return;

    if (!timer?._id) return;

    if (!socket.connected) {
      toast.error("Connection lost. Reconnecting...");
      socket.connect();
      return;
    }

    socket.emit("stopTimer", {
      timerId: timer._id,
    });
  }, [timer]);

  useEffect(() => {
    if (!user) return;

    const removeListener =
      window.electronAPI?.onAutoStopTracking(() => {

        if (!isTrackingRef.current) return;

        stop();
      });

    return () => {
      removeListener?.();
    };
  }, [user, stop]);

  const finishDay = useCallback(async () => {
    if (finishedToday) {
      toast.error(
        "You have already finished working for today. You can start again tomorrow."
      );
      return null;
    }

    try {
      // If currently tracking, stop first so the
      // current session is saved before finishing.
      if (isTracking) {
        stop();

        // Give the socket/session save a moment to complete.
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      const { data } = await API.post("/attendance/finish");

      setFinishedToday(true);

      // Refresh today's totals after finishing.
      await refreshTodayWork();

      return data.report;
    } catch (err: any) {
      console.error("FINISH DAY ERROR:", err);

      console.error(
        err?.response?.data?.message ||
        "Failed to finish workday"
      );

      return null;
    }
  }, [
    finishedToday,
    isTracking,
    stop,
    refreshTodayWork,
  ]);


  useEffect(() => {
    if (!user?._id) return;

    const getActiveTimer = async () => {
      try {
        await refreshTodayWork();

        const res = await API.get(
          `/timers/active/${user._id}`,
        );

        if (res.data) {
          setTimer(res.data);
          setIsTracking(true);

          const start = new Date(
            res.data.startTime
          ).getTime();

          const now = Date.now();

          setDuration(
            Math.floor((now - start) / 1000)
          );
        } else {
          setTimer(null);
          setIsTracking(false);
          setDuration(0);
        }
      } catch (err) {
        console.error(err);
      }
    };

    getActiveTimer();

    window.electronAPI?.onIdleWarning(() => {
      setIdleCountdown(20);
      setShowIdleModal(true);
    });

    window.electronAPI?.onIdleResumed(() => {

      setShowIdleModal(false);
      setIdleCountdown(20);
    });


    socket.off("timerStarted");
    socket.off("timerStopped");
    socket.off("tracking:started");
    socket.off("tracking:stopped");

    const handleTimerStarted = (data: any) => {
      setTimer(data);
      setIsTracking(true);

      window.electronAPI?.startTracking(
        data.project?._id || null,
        data.task?._id || null
      );

      setLastStartedAt(Date.now());
    };

    const handleTimerStopped = (data: any) => {
      handlingSleep.current = false;

      setTimer(null);
      setIsTracking(false);
      setDuration(0);

      window.electronAPI?.stopTracking();

      window.electronAPI?.updateTrackingBar({
        duration: 0,
        isTracking: false,
      });

      setLastStoppedAt(Date.now());
    };

    socket.on("timerStarted", handleTimerStarted);
    socket.on("timerStopped", handleTimerStopped);

    socket.on("tracking:started", handleTimerStarted);
    socket.on("tracking:stopped", handleTimerStopped);



    return () => {
      socket.off("timerStarted", handleTimerStarted);
      socket.off("timerStopped", handleTimerStopped);
      socket.off("tracking:started", handleTimerStarted);
      socket.off("tracking:stopped", handleTimerStopped);
    };
  }, [user]);

  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(async () => {
      if (handlingSleep.current) return;

      const sleep = await window.electronAPI?.getLastSleep();

      if (!sleep) return;

      if (
        effectiveSettings?.tracking?.continueTrackingDuringSleep
      ) {

        return;
      }

      const allowed =
        (effectiveSettings?.tracking?.sleepBreakHours || 0) * 60 +
        (effectiveSettings?.tracking?.sleepBreakMinutes || 0);

      if (sleep.sleptMinutes > allowed) {
        handlingSleep.current = true;

        stop();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isTracking,
    effectiveSettings,
    stop,
  ]);

  useEffect(() => {
    const removeTrackingBarListener =
      window.electronAPI?.onTrackingBarStop(() => {
        stop();
      });

    return () => {
      removeTrackingBarListener?.();
    };
  }, [stop]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTracking && timer?.startTime) {
      interval = setInterval(() => {
        const seconds = Math.floor(
          (Date.now() - new Date(timer.startTime).getTime()) / 1000
        );

        setDuration(seconds);

        window.electronAPI?.updateTrackingBar({
          todayWorkSeconds,
          startTime: timer.startTime,
          isTracking,
        });
      }, 1000);
    }

    return () =>
      clearInterval(interval);
  }, [isTracking, timer, todayWorkSeconds]);

  useEffect(() => {
    if (!showIdleModal) return;

    const interval = setInterval(() => {
      setIdleCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);

          setShowIdleModal(false);

          // Automatically stop tracking
          stop();

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showIdleModal]);

  const inactivityMinutes =
    effectiveSettings?.tracking?.inactivityMinutes || 3;

  useEffect(() => {
    const checkTodayAttendance = async () => {
      if (!user?._id) return;

      try {
        const { data } = await API.get(
          `/attendance/summary/${user._id}`
        );

        setFinishedToday(Boolean(data.finishTime));

      } catch (err) {

        // If the check fails, don't assume the day is finished.
        setFinishedToday(false);

      } finally {
        setAttendanceChecked(true);
      }
    };

    checkTodayAttendance();
  }, [user]);

  return (
    <TimerContext.Provider
      value={{
        timer,
        isTracking,
        start,
        switchTask,
        stop,
        finishDay,
        duration,
        todayWorkSeconds,
        todayBreakSeconds,
        finishedToday,
        refreshTodayWork,
        lastStartedAt,
        lastStoppedAt,
      }}
    >
      {children}

      {showIdleModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
          <div className="bg-[#162742] rounded-xl p-6 w-[420px] shadow-2xl border border-[#2A3D5C]">

            <h2 className="text-xl font-bold text-white">
              Are you still working?
            </h2>

            <p className="text-gray-300 mt-3">
              No keyboard or mouse activity has been detected for{" "}
              {inactivityMinutes} minute
              {inactivityMinutes === 1 ? "" : "s"}.
            </p>

            <p className="text-yellow-400 text-lg font-bold mt-4">
              {idleCountdown}s remaining
            </p>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  window.electronAPI?.resetIdle();

                  setIdleCountdown(20);
                  setShowIdleModal(false);
                }}
                className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg text-white"
              >
                Yes, I&apos;m Working
              </button>
            </div>

          </div>
        </div>
      )}

    </TimerContext.Provider>
  );
};

//  HOOK

export const useTimer = () => {
  const context = useContext(TimerContext);

  if (!context) {
    throw new Error("useTimer must be used within TimerProvider");
  }

  return context;

};