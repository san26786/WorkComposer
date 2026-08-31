"use client";

import { Clipboard, Clock, CirclePause, Play, Square } from "lucide-react";
import { useEffect, useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { useDesktop } from "@/context/DesktopContext";
import { useTimer } from "@/context/TimerContext";
import { useDashboard } from "@/context/DashboardContext";
import DailyWorkReport from "@/components/reports/DailyWorkReport";
import API from "@/api";
import toast from "react-hot-toast";

export default function TopBar() {


  const {
    selectedProject,
  } = useProject();

  const {
    setActivePage,
    setActiveReport,
  } = useDesktop();

  const { user } = useDashboard();

  const {
    timer,
    isTracking,
    start,
    stop,
    finishDay,
    duration,

    todayWorkSeconds,
    todayBreakSeconds,
    refreshTodayWork,

    lastStartedAt,
    lastStoppedAt,

    finishedToday,
  } = useTimer();

  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [dailyReport, setDailyReport] = useState<any>(null);
  const [showDailyReport, setShowDailyReport] = useState(false);

  useEffect(() => {
    if (!window.electronAPI) return;

    window.electronAPI.onIdleTimeout(() => {
      stop();
    });
  }, [stop]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return `${h}h ${m}m ${s}s`;
  };

  const displayedWorkSeconds = isTracking
    ? todayWorkSeconds + duration
    : todayWorkSeconds;

  useEffect(() => {
    if (lastStartedAt || lastStoppedAt) {
      refreshTodayWork();
    }
  }, [lastStartedAt, lastStoppedAt]);


  const handleFinishDay = async () => {
    try {
      setFinishing(true);

      const report = await finishDay();

      if (report) {
        setDailyReport(report);
        setShowFinishModal(false);
        setShowDailyReport(true);

      }
    } finally {
      setFinishing(false);
    }
  };


  return (
    <div
      className="
      fixed
      top-0
      left-[78px]
      right-0
      z-30

      min-h-16

      bg-[#162742]
      border-b
      border-[#263852]

      flex
      items-center

      px-4
      lg:px-5
      xl:px-6

      py-2

      gap-3
      xl:gap-4

      overflow-visible
    "
    >
      {/* =====================================================
        LEFT SIDE — CURRENT TASK
    ====================================================== */}
      <div
        className="
        flex
        items-center

        min-w-0
        flex-1

        overflow-hidden
      "
      >
        {timer?.task ? (
          <div
            className="
            flex
            items-center
            gap-2

            min-w-0
            max-w-full

            bg-[#0F1B31]
            border
            border-[#263852]
            rounded-lg

            px-3
            xl:px-4

            py-2

            transition-shadow
            duration-300

            hover:shadow-[0_0_16px_rgba(96,165,250,0.25)]
          "
          >
            <Clipboard className="w-4 h-4 text-blue-400 shrink-0" />

            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 uppercase">
                Current Task
              </p>

              <p
                className="
                text-sm
                text-white
                font-medium
                truncate

                max-w-[140px]
                lg:max-w-[200px]
                xl:max-w-[280px]
                2xl:max-w-[380px]
              "
              >
                {timer.task.title}
              </p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setActivePage("projects")}
            className="
            shrink-0

            px-4
            xl:px-5

            py-2

            rounded-lg

            text-xs
            font-medium

            bg-blue-600
            hover:bg-blue-700

            text-gray-200

            transition-shadow
            duration-300

            hover:shadow-[0_0_16px_rgba(37,99,235,0.5)]
          "
          >
            + Select Task
          </button>
        )}
      </div>

      {/* =====================================================
        RIGHT SIDE
    ====================================================== */}
      <div
        className="
        flex
        items-center
        justify-end

        flex-wrap

        gap-2
        lg:gap-3
        xl:gap-4

        shrink-0
      "
      >
        {/* ===================================================
          WORK TODAY
      ==================================================== */}
        <div
          className="
          bg-[#0F1B31]
          border
          border-[#263852]
          rounded-xl

          px-2
          lg:px-3

          py-1

          min-w-[145px]
          lg:min-w-[165px]
          xl:min-w-[180px]

          flex
          items-center
          gap-2
          lg:gap-3

          transition-shadow
          duration-300

          hover:shadow-[0_0_16px_rgba(74,222,128,0.25)]
        "
        >
          <div
            className="
            w-9
            h-9
            lg:w-10
            lg:h-10

            rounded-lg

            bg-[#113B35]

            flex
            items-center
            justify-center

            shrink-0

            shadow-[0_0_10px_rgba(74,222,128,0.4)]
          "
          >
            <Clock className="w-4 h-4 text-green-400" />
          </div>

          <div className="min-w-0">
            <p
              className="
              text-[10px]
              lg:text-[11px]

              text-gray-400
              font-bold

              whitespace-nowrap
            "
            >
              WORK TODAY
            </p>

            <h3
              className="
              text-white
              font-bold

              text-base
              lg:text-lg
              xl:text-xl

              whitespace-nowrap
            "
            >
              {formatDuration(displayedWorkSeconds)}
            </h3>
          </div>
        </div>

        {/* ===================================================
          BREAK TODAY
      ==================================================== */}
        <div
          className="
          bg-[#0F1B31]
          border
          border-[#263852]
          rounded-lg

          px-2
          lg:px-3

          py-1

          min-w-[145px]
          lg:min-w-[165px]
          xl:min-w-[180px]

          flex
          items-center
          gap-2
          lg:gap-3

          transition-shadow
          duration-300

          hover:shadow-[0_0_16px_rgba(251,146,60,0.25)]
        "
        >
          <div
            className="
            w-9
            h-9
            lg:w-10
            lg:h-10

            rounded-lg

            bg-[#3B2418]

            flex
            items-center
            justify-center

            shrink-0

            shadow-[0_0_10px_rgba(251,146,60,0.4)]
          "
          >
            <CirclePause className="w-4 h-4 text-orange-400" />
          </div>

          <div className="min-w-0">
            <p
              className="
              text-[10px]
              lg:text-[11px]

              text-gray-400
              font-bold

              whitespace-nowrap
            "
            >
              BREAK TODAY
            </p>

            <h3
              className="
              text-white
              font-bold

              text-base
              lg:text-lg
              xl:text-xl

              whitespace-nowrap
            "
            >
              {formatDuration(todayBreakSeconds)}
            </h3>
          </div>
        </div>

        {/* ===================================================
          START / STOP
      ==================================================== */}
        <button
          onClick={() => {
            if (!user?._id) return;

            if (isTracking) {
              stop();
            } else {
              start(user._id);
            }
          }}
          className={`
          shrink-0

          font-semibold

          px-4
          lg:px-5
          xl:px-6

          py-2

          rounded-lg

          flex
          items-center
          justify-center
          gap-1

          whitespace-nowrap

          text-white

          transition-shadow
          duration-300

          ${isTracking
              ? "bg-red-600 hover:bg-red-700 hover:shadow-[0_0_18px_rgba(220,38,38,0.5)]"
              : "bg-green-600 hover:bg-green-700 hover:shadow-[0_0_18px_rgba(22,163,74,0.5)]"
            }
        `}
        >
          <Play size={15} />

          {isTracking ? "Stop" : "Start"}
        </button>

        {/* ===================================================
          FINISH
      ==================================================== */}
        <button
          disabled={finishedToday}
          onClick={() => setShowFinishModal(true)}
          className={`
          shrink-0

          font-semibold

          px-4
          lg:px-5
          xl:px-6

          py-2

          rounded-lg

          flex
          items-center
          justify-center
          gap-1

          whitespace-nowrap

          transition-shadow
          duration-300

          ${finishedToday
              ? "bg-[#243447] text-gray-400 cursor-not-allowed"
              : "bg-[#243447] text-white hover:bg-[#30445A] hover:shadow-[0_0_16px_rgba(148,163,184,0.25)]"
            }
        `}
        >
          {finishedToday ? (
            <>
              <span>✓</span>
              Finished
            </>
          ) : (
            <>
              <Square size={15} />
              Finish
            </>
          )}
        </button>
      </div>

      {/* =====================================================
        FINISH MODAL
    ====================================================== */}
      {showFinishModal && (
        <div
          className="
          fixed
          inset-0
          z-50

          flex
          items-center
          justify-center

          bg-black/50

          px-4
        "
        >
          <div
            className="
            w-full
            max-w-[400px]

            rounded-xl

            bg-[#16253D]
            border
            border-[#263852]

            p-6

            shadow-2xl
          "
          >
            <h2 className="text-lg font-semibold text-white">
              Finish your workday?
            </h2>

            <p className="text-sm text-gray-400 mt-2">
              You&apos;ve finished working for today. You won&apos;t be able
              to start tracking again until tomorrow.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowFinishModal(false)}
                disabled={finishing}
                className="
                px-4
                py-2

                rounded-lg

                text-sm
                font-medium

                bg-[#243447]
                text-gray-300

                hover:bg-[#30445A]
              "
              >
                Cancel
              </button>

              <button
                onClick={handleFinishDay}
                disabled={finishing}
                className="
                px-4
                py-2

                rounded-lg

                text-sm
                font-semibold

                bg-red-600
                text-white

                hover:bg-red-700

                disabled:opacity-50
              "
              >
                {finishing ? "Finishing..." : "Finish Day"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDailyReport && dailyReport && (
        <DailyWorkReport
          report={dailyReport}
          onClose={() => setShowDailyReport(false)}
        />
      )}
    </div>
  );
}

function ReportStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-[#263852] bg-[#111E33] p-4">
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-2 truncate text-base font-semibold text-white">
        {value}
      </p>
    </div>
  );
}