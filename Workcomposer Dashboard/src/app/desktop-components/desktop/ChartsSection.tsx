import { Clock3, CalendarDays, RefreshCw } from "lucide-react";
import Last30DaysChart from "./Last30DaysChart";
import TodayChart from "./TodayChart";
import { useState } from "react";

export default function ChartSection() {

  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 p-4">

      {/* Today Chart */}
      <div className="rounded-xl p-2 transition-shadow duration-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]">
        <div className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.6)]">
              <Clock3 className="w-4 h-4 text-white" />
            </div>

            <div>
              <h3 className="text-white font-semibold text-sm">
                Today
              </h3>

              <p className="text-gray-400 text-xs">
                Hourly Breakdown
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-400 text-xs">
                Work
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-gray-400 text-xs">
                Break
              </span>
            </div>

            <button
              onClick={() => {
                setRefreshing(true);
                setRefreshKey((prev) => prev + 1);
              }}
              className="text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""
                  }`}
              />
            </button>
          </div>
        </div>

        <div className="h-[300px]">
          <TodayChart
            refreshKey={refreshKey}
            setRefreshing={setRefreshing}
          />
        </div>
      </div>

      {/* Last 30 Days Chart */}
      <div className="rounded-xl p-2 transition-shadow duration-300 hover:shadow-[0_0_25px_rgba(34,211,238,0.25)]">
        <div className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.6)]">
              <CalendarDays className="w-4 h-4 text-white" />
            </div>

            <div>
              <h3 className="text-white font-semibold text-sm">
                Last 30 Days
              </h3>

              <p className="text-gray-400 text-xs">
                Daily Breakdown
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-400 text-xs">
                Work
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-gray-400 text-xs">
                Break
              </span>
            </div>

            <button
              onClick={() => {
                setRefreshing(true);
                setRefreshKey((prev) => prev + 1);
              }}
              className="text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""
                  }`}
              />
            </button>
          </div>
        </div>

        <div className="h-[300px]">
          <Last30DaysChart
            refreshKey={refreshKey}
            setRefreshing={setRefreshing}
          />
        </div>
      </div>

    </div>
  );
}