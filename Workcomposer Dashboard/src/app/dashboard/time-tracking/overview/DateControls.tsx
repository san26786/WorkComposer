"use client";
import { useState, type Dispatch, type SetStateAction } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import DateRangeModalPreview from "./DateRangeModalPreview";
import { useAppTimezone } from "@/hooks/useAppTimezone";
import {
  addDaysInTimezone,
  createDateInTimezone,
  getDatePartsInTimezone,
  isSameDayInTimezone,
} from "@/utils/appTimezone";

type Props = {
  date: Date;
  setDate: Dispatch<SetStateAction<Date>>;
  setReportRange: Dispatch<
    SetStateAction<{
      type: string;
      startDate: Date;
      endDate: Date;
    }>
  >;

  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
};

export default function DateControls({
  date,
  setDate,
  setReportRange,
  onRefresh,
  isRefreshing,
}: Props) {

  const timezone = useAppTimezone();

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: timezone,
    });

  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [dateLabel, setDateLabel] = useState("Today");
  const [dateRangeText, setDateRangeText] = useState(formatDate(new Date()));



  const handlePrev = () => {
    const newDate = addDaysInTimezone(date, -1, timezone);

    setDate(newDate);
    setDateRangeText(formatDate(newDate));

    const isToday = isSameDayInTimezone(newDate, new Date(), timezone);

    setDateLabel(isToday ? "Today" : "Day");

    setReportRange({
      type: "Day",
      startDate: newDate,
      endDate: newDate,
    });
  };

  const handleNext = () => {
    const newDate = addDaysInTimezone(date, 1, timezone);

    setDate(newDate);
    setDateRangeText(formatDate(newDate));

    const isToday = isSameDayInTimezone(newDate, new Date(), timezone);

    setDateLabel(isToday ? "Today" : "Day");

    setReportRange({
      type: "Day",
      startDate: newDate,
      endDate: newDate,
    });
  };

  const handleToday = () => {
    const { year, month, day } = getDatePartsInTimezone(
      new Date(),
      timezone
    );

    const today = createDateInTimezone(year, month, day, timezone);

    setDate(today);
    setDateLabel("Today");
    setDateRangeText(formatDate(today));

    setReportRange({
      type: "Today",
      startDate: today,
      endDate: today,
    });
  };

  return (
    <div className="relative ml-auto flex w-full flex-wrap items-center justify-start gap-3 sm:w-auto sm:justify-end">
      <div className="relative inline-block">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              handleToday();
              setIsDateModalOpen(true);
            }}
            className="text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg shadow-sm px-4 py-2 ring-1 ring-slate-100 hover:shadow-md hover:border-slate-300 hover:bg-slate-500 transition-all duration-200 cursor-pointer"
          >
            {dateLabel}
          </button>

          <button
            onClick={handlePrev}
            className="text-slate-600 hover:text-slate-800 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 cursor-pointer font-medium"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() =>
              setIsDateModalOpen(true)
            }
            className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 sm:px-4 py-2 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-100 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md cursor-pointer">
            <span className="truncate font-semibold">{dateRangeText}</span>
            <ChevronRight
              className="w-4 h-4 text-slate-500 transition-transform duration-200"
            />
          </button>

          <button
            onClick={handleNext}
            className="text-slate-600 cursor-pointer font-medium hover:text-slate-800 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200"
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    <button
  type="button"
  onClick={onRefresh}
  disabled={isRefreshing}
  className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
  title="Refresh"
>
  <RefreshCw
    className={`w-5 h-5 ${
      isRefreshing ? "animate-spin" : ""
    }`}
  />
</button>

      {isDateModalOpen && (
        <DateRangeModalPreview
          initialDate={date}
          onClose={() =>
            setIsDateModalOpen(false)
          }
          onApply={(newDate, label, rangeText, range) => {
            setDate(newDate);
            setDateLabel(label);
            setDateRangeText(rangeText);
            setReportRange(range);
          }}
        />
      )}
    </div>
  );
}