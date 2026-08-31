"use client";

type DailyWorkReportProps = {
  report: any;
  onClose: () => void;
};

export default function DailyWorkReport({
  report,
  onClose,
}: DailyWorkReportProps) {
  return (
    <div className="fixed inset-0  z-[100000] flex items-center justify-center bg-black/60 p-3 sm:p-5">
      <div
        className="
          flex
          max-h-[92vh]
          w-full
          max-w-4xl
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-[#263852]
          bg-[#16253D]
          shadow-2xl
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#263852] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Daily Work Report
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              {report?.date || "--"}{" "}
              {report?.timezone ? `• ${report.timezone}` : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex h-8 w-8 shrink-0 items-center justify-center
              rounded-lg
              text-gray-400
              hover:bg-[#243447]
              hover:text-white
            "
          >
            ×
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto p-5 sm:p-6">
          {/* User */}
          <div className="rounded-xl border border-[#263852] bg-[#111E33] p-4">
            <p className="text-sm font-semibold text-white">
              {report?.user?.name}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {report?.user?.email}
            </p>
          </div>

          {/* Summary */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Work Summary
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ReportStat
                label="Start"
                value={report?.summary?.startTime || "--"}
              />

              <ReportStat
                label="Finish"
                value={report?.summary?.finishTime || "--"}
              />

              <ReportStat
                label="Work Time"
                value={report?.summary?.workTime || "0h 0m"}
              />

              <ReportStat
                label="Break Time"
                value={report?.summary?.breakTime || "0h 0m"}
              />
            </div>
          </div>

          {/* Activity */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Activity
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ReportStat
                label="Key Presses"
                value={report?.activity?.keyPresses ?? 0}
              />

              <ReportStat
                label="Mouse Clicks"
                value={report?.activity?.mouseClicks ?? 0}
              />

              <ReportStat
                label="Mouse Moves"
                value={report?.activity?.mouseMoves ?? 0}
              />

              <ReportStat
                label="Screenshots"
                value={report?.activity?.screenshotCount ?? 0}
              />
            </div>

            <div className="mt-3 rounded-xl border border-[#263852] bg-[#111E33] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  Activity Score
                </span>

                <span className="text-lg font-bold text-green-400">
                  {report?.activity?.activityScore ?? 0}%
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#243447]">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        report?.activity?.activityScore ?? 0
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Tasks
            </h3>

            {report?.tasks?.length > 0 ? (
              <div className="space-y-2">
                {report.tasks.map((item: any, index: number) => (
                  <div
                    key={`${item.task?._id || "task"}-${index}`}
                    className="
                      rounded-xl
                      border
                      border-[#263852]
                      bg-[#111E33]
                      p-4
                    "
                  >
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-medium text-white">
                          {item.task?.title || "Untitled Task"}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {item.project?.name || "No Project"}
                        </p>
                      </div>

                      <span className="text-sm font-semibold text-blue-400">
                        {item.time || "0h 0m"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[#263852] bg-[#111E33] p-4 text-sm text-gray-400">
                No task activity recorded today.
              </div>
            )}
          </div>

          {/* Sessions */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Session Timeline
            </h3>

            <div className="overflow-hidden rounded-xl border border-[#263852]">
              <div className="max-h-64 overflow-y-auto">
                {report?.sessions?.length > 0 ? (
                  report.sessions.map(
                    (session: any, index: number) => (
                      <div
                        key={session.id || index}
                        className="
                          flex
                          flex-col
                          gap-2
                          border-b
                          border-[#263852]
                          bg-[#111E33]
                          px-4
                          py-3
                          last:border-b-0
                          sm:flex-row
                          sm:items-center
                          sm:justify-between
                        "
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`
                              h-2.5
                              w-2.5
                              rounded-full
                              ${
                                session.type === "work"
                                  ? "bg-green-500"
                                  : "bg-orange-400"
                              }
                            `}
                          />

                          <div>
                            <p className="text-sm font-medium capitalize text-white">
                              {session.type}
                            </p>

                            <p className="text-xs text-gray-500">
                              {session.startTime} → {session.endTime}
                            </p>
                          </div>
                        </div>

                        <span className="text-sm font-medium text-gray-300">
                          {session.time}
                        </span>
                      </div>
                    )
                  )
                ) : (
                  <div className="bg-[#111E33] px-4 py-4 text-sm text-gray-400">
                    No sessions recorded today.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-[#263852] bg-[#16253D] px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="
              w-full
              rounded-lg
              bg-blue-600
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-blue-700
            "
          >
            Done
          </button>
        </div>
      </div>
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