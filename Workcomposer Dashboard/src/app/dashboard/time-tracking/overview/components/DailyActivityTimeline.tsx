"use client";

import { useEffect, useState } from "react";
import API from "@/api";


type Props = {
  userId: string;
  reportRange: {
    type: string;
    startDate: Date;
    endDate: Date;
  }
};

export default function DailyActivityTimeline({
  userId,
  reportRange,
}: Props) {

  type TimelineItem = {
    date: string;
    workTime: string;
    breakTime: string;
  };

  const [timeline, setTimeline] = useState<TimelineItem[]>([]);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const startDate =
          reportRange.startDate
            .toISOString()
            .split("T")[0];

        const endDate =
          reportRange.endDate
            .toISOString()
            .split("T")[0];

        const { data } = await API.get(
          `/activity/timeline/${userId}?startDate=${startDate}&endDate=${endDate}`
        );

        setTimeline(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTimeline();
  }, [userId, reportRange.startDate, reportRange.endDate]);

  const getDotColor = (workTime: string) => {
    const [hours] = workTime.split("h");

    const totalHours = Number(hours);

    if (totalHours >= 6) return "bg-green-500";

    if (totalHours >= 2) return "bg-yellow-500";

    return "bg-red-500";
  };


  return (
    <div className="mt-2">

      <div className="overflow-x-auto pb-2">

        <div className="flex gap-4 min-w-max">

          {timeline.map((item, index) => (
            <div
              key={index}
              className="w-[210px] border border-gray-200 rounded-lg p-4 bg-white"
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`w-3 h-3 rounded-full ${getDotColor(
                    item.workTime
                  )}`}
                />

                <span className="text-sm font-medium text-gray-700">
                  {item.date}
                </span>
              </div>

              <p className="text-sm text-gray-700">
                Work Time:
                <span className="ml-1 text-red-500 font-medium">
                  {item.workTime}
                </span>
              </p>

              <p className="text-sm text-gray-700 mt-1">
                On Break:
                <span className="ml-1">
                  {item.breakTime}
                </span>
              </p>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}