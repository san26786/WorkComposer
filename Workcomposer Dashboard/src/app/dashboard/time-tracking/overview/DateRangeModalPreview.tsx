"use client";
import { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppTimezone } from "@/hooks/useAppTimezone";
import { createDateInTimezone } from "@/utils/appTimezone";

interface DateRangeModalPreviewProps {
  onClose?: () => void;
  onApply?: (
    date: Date,
    label: string,
    rangeText: string,
    range: {
      type: string;
      startDate: Date;
      endDate: Date;
    }
  ) => void;
  initialDate?: Date;

}

export default function DateRangeModalPreview({ onClose, onApply, initialDate, }: DateRangeModalPreviewProps) {

  const timezone = useAppTimezone();

  const getTimezoneDateParts = (date: Date = new Date()) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);

    return {
      year: Number(parts.find((p) => p.type === "year")?.value),
      month: Number(parts.find((p) => p.type === "month")?.value) - 1,
      day: Number(parts.find((p) => p.type === "day")?.value),
    };
  };

  const addCalendarDays = (
    year: number,
    month: number,
    day: number,
    days: number
  ) => {
    const utcDate = new Date(Date.UTC(year, month, day));

    utcDate.setUTCDate(utcDate.getUTCDate() + days);

    return {
      year: utcDate.getUTCFullYear(),
      month: utcDate.getUTCMonth(),
      day: utcDate.getUTCDate(),
    };
  };

  const getTimezoneDate = (
    year: number,
    month: number,
    day: number
  ) => {
    return createDateInTimezone(
      year,
      month,
      day,
      timezone
    );
  };

  const formatCalendarDate = (
    year: number,
    month: number,
    day: number
  ) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  // Active quick select state
  const [selectedQuickSelect, setSelectedQuickSelect] = useState('Today');

  // Active date range type state
  const [selectedDateRangeType, setSelectedDateRangeType] = useState('Day');

  // Selected week state
  const getCurrentWeek = () => {
    const today = initialDate || new Date();

    const monday = new Date(today);
    monday.setDate(
      today.getDate() - ((today.getDay() + 6) % 7)
    );

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return `${monday.toISOString().split("T")[0]},${sunday.toISOString().split("T")[0]}`;
  };

  const [selectedWeek, setSelectedWeek] =
    useState(getCurrentWeek());

  // Generate weeks list dynamically for Week selector view
  const generateWeeks = () => {
    const weeks = [];

    // Current week's Sunday
    const currentDate = new Date();
    const sunday = new Date(currentDate);
    sunday.setDate(
      currentDate.getDate() + (7 - currentDate.getDay()) % 7
    );

    for (let i = 0; i < 40; i++) {
      const end = new Date(sunday);
      end.setDate(sunday.getDate() - i * 7);

      const start = new Date(end);
      start.setDate(end.getDate() - 6);

      const label =
        `${String(start.getDate()).padStart(2, "0")} ${start.toLocaleString("en-US", { month: "short" })}` +
        ` - ` +
        `${String(end.getDate()).padStart(2, "0")} ${end.toLocaleString("en-US", { month: "short" })} ${end.getFullYear()}`;

      const value =
        `${start.toISOString().split("T")[0]},${end.toISOString().split("T")[0]}`;

      weeks.push({
        label,
        value,
      });
    }

    return weeks;
  };

  // Active group by state
  const [selectedGroupBy, setSelectedGroupBy] = useState('Days');

  // Selected start and end dates (defaulting to May 19 and May 26, 2026 respectively)
  const today = initialDate || new Date();

  const [startDate, setStartDate] =
    useState<Date>(new Date(today));

  const [endDate, setEndDate] =
    useState<Date>(new Date(today));

  // Calendar states for Start & End calendars in Custom mode
  const [startCalMonth, setStartCalMonth] =
    useState(today.getMonth());

  const [startCalYear, setStartCalYear] =
    useState(today.getFullYear());

  const [endCalMonth, setEndCalMonth] =
    useState(today.getMonth());

  const [endCalYear, setEndCalYear] =
    useState(today.getFullYear());

  // Calendar state (current year and month)
  const baseDate = initialDate || new Date();

  const [currentYear, setCurrentYear] =
    useState(baseDate.getFullYear());

  const [currentMonth, setCurrentMonth] =
    useState(baseDate.getMonth());

  // Selected date state (defaulting to May 26, 2026)
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());

  const quickSelectItems = [
    'Today',
    'Yesterday',
    'This week (Mon - Today)',
    'Last 7 days',
    'Last week (Mon - Sun)',
    'Last 14 days',
    'This month',
    'Last 30 days',
    'Last month',
  ];

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to handle Quick Select clicks
  const handleQuickSelect = (item: string) => {
    setSelectedQuickSelect(item);

    const todayParts = getTimezoneDateParts();

    const today = getTimezoneDate(
      todayParts.year,
      todayParts.month,
      todayParts.day
    );

    if (item === "Today") {
      setSelectedDateRangeType("Day");

      setSelectedDate(today);

      setCurrentMonth(todayParts.month);
      setCurrentYear(todayParts.year);

    } else if (item === "Yesterday") {
      const yesterdayParts = addCalendarDays(
        todayParts.year,
        todayParts.month,
        todayParts.day,
        -1
      );

      const yesterday = getTimezoneDate(
        yesterdayParts.year,
        yesterdayParts.month,
        yesterdayParts.day
      );

      setSelectedDateRangeType("Day");

      setSelectedDate(yesterday);

      setCurrentMonth(yesterdayParts.month);
      setCurrentYear(yesterdayParts.year);

    } else if (item === "This week (Mon - Today)") {
      setSelectedDateRangeType("Week");

      const todayUtc = new Date(
        Date.UTC(
          todayParts.year,
          todayParts.month,
          todayParts.day
        )
      );

      const dayOfWeek = todayUtc.getUTCDay();

      const mondayOffset =
        dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

      const mondayParts = addCalendarDays(
        todayParts.year,
        todayParts.month,
        todayParts.day,
        mondayOffset
      );

      const sundayParts = {
        year: todayParts.year,
        month: todayParts.month,
        day: todayParts.day,
      };

      setSelectedWeek(
        `${formatCalendarDate(
          mondayParts.year,
          mondayParts.month,
          mondayParts.day
        )},${formatCalendarDate(
          sundayParts.year,
          sundayParts.month,
          sundayParts.day
        )}`
      );

    } else if (item === "Last week (Mon - Sun)") {
      setSelectedDateRangeType("Week");

      const todayUtc = new Date(
        Date.UTC(
          todayParts.year,
          todayParts.month,
          todayParts.day
        )
      );

      const dayOfWeek = todayUtc.getUTCDay();

      const mondayOffset =
        dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

      const lastMondayParts = addCalendarDays(
        todayParts.year,
        todayParts.month,
        todayParts.day,
        mondayOffset - 7
      );

      const lastSundayParts = addCalendarDays(
        lastMondayParts.year,
        lastMondayParts.month,
        lastMondayParts.day,
        6
      );

      setSelectedWeek(
        `${formatCalendarDate(
          lastMondayParts.year,
          lastMondayParts.month,
          lastMondayParts.day
        )},${formatCalendarDate(
          lastSundayParts.year,
          lastSundayParts.month,
          lastSundayParts.day
        )}`
      );

    } else if (
      item === "Last 7 days" ||
      item === "Last 14 days" ||
      item === "Last 30 days"
    ) {
      setSelectedDateRangeType("Custom");

      const days =
        item === "Last 7 days"
          ? 6
          : item === "Last 14 days"
            ? 13
            : 29;

      const startParts = addCalendarDays(
        todayParts.year,
        todayParts.month,
        todayParts.day,
        -days
      );

      const start = getTimezoneDate(
        startParts.year,
        startParts.month,
        startParts.day
      );

      const end = today;

      setStartDate(start);
      setEndDate(end);

      setStartCalMonth(startParts.month);
      setStartCalYear(startParts.year);

      setEndCalMonth(todayParts.month);
      setEndCalYear(todayParts.year);

    } else if (item === "This month") {
      setSelectedDateRangeType("Month");
      setSelectedGroupBy("Months");

      setCurrentMonth(todayParts.month);
      setCurrentYear(todayParts.year);

    } else if (item === "Last month") {
      setSelectedDateRangeType("Month");
      setSelectedGroupBy("Months");

      const lastMonth = addCalendarDays(
        todayParts.year,
        todayParts.month,
        1,
        -1
      );

      setCurrentMonth(lastMonth.month);
      setCurrentYear(lastMonth.year);
    }
  };
  // Generate calendar grid for any selected month & year
  const getCalendarDaysFor = (year: number, month: number) => {
    // First day of the current month
    const firstDayOfMonth = new Date(year, month, 1);
    // Day of the week of first day (0-6, Sunday is 0)
    const startDayOfWeek = firstDayOfMonth.getDay();

    // Number of days in the current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Number of days in previous month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

    const days = [];

    // Add days from the previous month
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
      });
    }

    // Add days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: month,
        year: year,
        isCurrentMonth: true,
      });
    }

    // Add days from the next month to fill up a standard 6-row (42 days) calendar
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  // Generate calendar grid for the selected month & year
  const getCalendarDays = () => getCalendarDaysFor(currentYear, currentMonth);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const isSameDay = (d1: Date, year: number, month: number, day: number) => {
    return d1.getFullYear() === year && d1.getMonth() === month && d1.getDate() === day;
  };

  const years = Array.from(
    { length: 50 },
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[3px] transition-all duration-300">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col transition-all duration-300">

        {/* Top Header - Close Button */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-end">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition duration-150 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Columns */}
        <div className="flex flex-col lg:flex-row lg:divide-x divide-slate-100 overflow-y-auto flex-1 min-h-0">

          {/* Left Column: Quick Select */}
          <div className="w-full lg:w-1/3 p-5 bg-[#fafbfd] overflow-y-auto">
            <h3 className="text-[11px] font-bold mb-4 text-slate-400 uppercase tracking-wider">
              Quick Select
            </h3>

            <ul className="space-y-1.5">
              {quickSelectItems.map((item, index) => {
                const isActive = selectedQuickSelect === item;
                return (
                  <li key={index}>
                    <button
                      onClick={() => handleQuickSelect(item)}
                      className={`w-full text-left text-sm px-4 py-2.5 rounded-lg transition-all duration-200 font-semibold cursor-pointer ${isActive
                        ? 'bg-[#e6efff] text-blue-600'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                    >
                      {item}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right Column: Calendar & Controls */}
          <div className="w-full lg:w-2/3 p-6 space-y-6 bg-white overflow-y-auto">

            {/* Date Range Type Selector */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                Date Range
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Day', 'Week', 'Month', 'Year', 'Custom'].map((item) => {
                  const isActive = selectedDateRangeType === item;
                  return (
                    <button
                      key={item}
                      onClick={() => {
                        setSelectedDateRangeType(item);
                        setSelectedQuickSelect(item);

                        if (item === "Year") {
                          setCurrentYear(new Date().getFullYear());
                          setSelectedGroupBy("Months");
                        }
                      }}
                      className={`px-5 py-2.5 rounded-lg border text-sm font-semibold transition-all duration-150 cursor-pointer ${isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
                        }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Calendar Container or Week Selector or Custom Selector */}
            {selectedDateRangeType === 'Week' ? (
              <div className="bg-[#f8fafc] rounded-xl p-5 border border-slate-100 shadow-xs">
                <fieldset className="space-y-2 bg-slate-50 rounded-xl p-4 min-h-[340px] max-h-[340px] overflow-y-auto">
                  <legend className="sr-only">Select Week</legend>
                  {generateWeeks().map((week, idx) => {
                    const isChecked = selectedWeek === week.value;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedWeek(week.value)
                          setSelectedQuickSelect("Week")
                        }}
                        className="group flex items-start gap-3 cursor-pointer hover:bg-white hover:shadow-xs rounded-lg p-2 transition-all duration-200"
                      >
                        <div className="flex h-6 shrink-0 items-center">
                          <div className="grid size-5 grid-cols-1">
                            <input
                              id={`week-${week.value}`}
                              name="selected-week"
                              type="radio"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedWeek(week.value)
                                setSelectedQuickSelect("Week")
                              }}
                              className="col-start-1 row-start-1 appearance-none rounded-md border-2 border-slate-300 bg-white checked:border-blue-600 checked:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 hover:border-blue-400 transition-all duration-200 cursor-pointer"
                              value={week.value}
                            />
                            <svg
                              className={`pointer-events-none col-start-1 row-start-1 size-3 self-center justify-self-center stroke-white transition-opacity duration-200 ${isChecked ? 'opacity-100' : 'opacity-0'}`}
                              viewBox="0 0 14 14"
                              fill="none"
                            >
                              <path d="M3 8L6 11L11 3.5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                          </div>
                        </div>
                        <div className="text-sm">
                          <label
                            htmlFor={`week-${week.value}`}
                            className="font-medium text-slate-800 cursor-pointer"
                          >
                            {week.label}
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </fieldset>
              </div>
            ) : selectedDateRangeType === 'Month' ? (
              /* Month and Year dual list selector exactly like requested */
              <div className="bg-[#f8fafc] rounded-xl p-5 border border-slate-100 shadow-xs">
                <div className="flex flex-col lg:flex-row gap-4 bg-white rounded-xl p-4 border border-slate-100 shadow-2xs" style={{ minHeight: '340px', maxHeight: '340px' }}>

                  {/* Year fieldset */}
                  <fieldset className="w-1/2 space-y-3">
                    <legend className="text-sm font-bold text-slate-800 uppercase tracking-wide px-1">Year</legend>
                    <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                      {years.map((yr) => {
                        const isDisabled = false;
                        const isChecked = currentYear === yr;
                        return (
                          <div
                            key={yr}
                            onClick={() => {
                              if (!isDisabled) {
                                setCurrentYear(yr);
                              }
                            }}
                            className={`group flex items-start gap-3 cursor-pointer hover:bg-white hover:shadow-sm rounded-lg p-2 transition-all duration-200 ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            <div className="flex h-6 shrink-0 items-center">
                              <div className="grid size-5 grid-cols-1">
                                <input
                                  id={`year-${yr}`}
                                  name="year"
                                  type="radio"
                                  checked={isChecked}
                                  disabled={isDisabled}
                                  onChange={() => { }}
                                  className="col-start-1 row-start-1 appearance-none rounded-md border-2 border-slate-300 bg-white checked:border-blue-600 checked:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:border-slate-200 disabled:bg-slate-100 hover:border-blue-400 transition-all duration-200 cursor-pointer"
                                  value={yr}
                                />
                                <svg
                                  className={`pointer-events-none col-start-1 row-start-1 size-3 self-center justify-self-center stroke-white transition-opacity duration-200 ${isChecked ? 'opacity-100' : 'opacity-0'}`}
                                  viewBox="0 0 14 14"
                                  fill="none"
                                >
                                  <path d="M3 8L6 11L11 3.5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                              </div>
                            </div>
                            <label htmlFor={`year-${yr}`} className="text-sm font-medium text-slate-800 select-none cursor-pointer">
                              {yr}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </fieldset>

                  {/* Month fieldset */}
                  <fieldset className="w-1/2 space-y-3">
                    <legend className="text-sm font-bold text-slate-800 uppercase tracking-wide px-1">Month</legend>
                    <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                      {monthsList.map((monthName, index) => {
                        const monthVal = index; // 0-indexed month
                        const isChecked = currentMonth === monthVal;
                        return (
                          <div
                            key={monthVal}
                            onClick={() => setCurrentMonth(monthVal)}
                            className="group flex items-start gap-3 cursor-pointer hover:bg-white hover:shadow-sm rounded-lg p-2 transition-all duration-200"
                          >
                            <div className="flex h-6 shrink-0 items-center">
                              <div className="grid size-5 grid-cols-1">
                                <input
                                  id={`month-${currentYear}-${monthVal + 1}`}
                                  name="month"
                                  type="radio"
                                  checked={isChecked}
                                  onChange={() => { }}
                                  className="col-start-1 row-start-1 appearance-none rounded-md border-2 border-slate-300 bg-white checked:border-blue-600 checked:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 hover:border-blue-400 transition-all duration-200 cursor-pointer"
                                  value={`${currentYear}-${monthVal + 1}`}
                                />
                                <svg
                                  className={`pointer-events-none col-start-1 row-start-1 size-3 self-center justify-self-center stroke-white transition-opacity duration-200 ${isChecked ? 'opacity-100' : 'opacity-0'}`}
                                  viewBox="0 0 14 14"
                                  fill="none"
                                >
                                  <path d="M3 8L6 11L11 3.5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                              </div>
                            </div>
                            <label htmlFor={`month-${currentYear}-${monthVal + 1}`} className="text-sm font-medium text-slate-800 select-none cursor-pointer">
                              {monthName}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </fieldset>

                </div>
              </div>
            ) : selectedDateRangeType === 'Year' ? (

              <div className="bg-[#f8fafc] rounded-xl p-5 border border-slate-100 shadow-xs">
                <fieldset className="space-y-2 bg-white rounded-xl p-4 max-h-[340px] overflow-y-auto">

                  {years.map((yr) => {
                    const isChecked = currentYear === yr;

                    return (
                      <div
                        key={yr}
                        onClick={() => setCurrentYear(yr)}
                        className="group flex items-start gap-3 cursor-pointer hover:bg-slate-50 rounded-lg p-2"
                      >
                        <div className="flex h-6 shrink-0 items-center">
                          <div className="grid size-5 grid-cols-1">
                            <input
                              type="radio"
                              checked={isChecked}
                              onChange={() => { }}
                              className="col-start-1 row-start-1 appearance-none rounded-md border-2 border-slate-300 bg-white checked:border-blue-600 checked:bg-blue-600"
                            />

                            <svg
                              className={`pointer-events-none col-start-1 row-start-1 size-3 self-center justify-self-center stroke-white ${isChecked ? "opacity-100" : "opacity-0"
                                }`}
                              viewBox="0 0 14 14"
                              fill="none"
                            >
                              <path
                                d="M3 8L6 11L11 3.5"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>

                        <label className="text-sm font-medium text-slate-800 cursor-pointer">
                          {yr}
                        </label>
                      </div>
                    );
                  })}
                </fieldset>
              </div>
            ) : selectedDateRangeType === 'Custom' ? (
              /* Custom double side-by-side calendar */
              <div className="bg-[#f8fafc] rounded-xl p-4 border border-slate-100 shadow-xs">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

                  {/* Start Date Calendar */}
                  <div className="bg-white rounded-lg p-4 border border-slate-100 shadow-2xs">
                    <h5 className="text-sm font-semibold mb-2 text-slate-700 px-1 py-0.5">Start Date</h5>
                    <div className="w-full text-sm">
                      <div className="flex items-center justify-between mb-3">
                        <button
                          onClick={() => {
                            if (startCalMonth === 0) {
                              setStartCalMonth(11);
                              setStartCalYear(prev => prev - 1);
                            } else {
                              setStartCalMonth(prev => prev - 1);
                            }
                          }}
                          className="p-1 hover:bg-gray-100 rounded cursor-pointer text-slate-500 transition"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-1 font-semibold text-slate-800">
                          <span>{monthsList[startCalMonth]}</span>
                          <span>{startCalYear}</span>
                        </div>
                        <button
                          onClick={() => {
                            if (startCalMonth === 11) {
                              setStartCalMonth(0);
                              setStartCalYear(prev => prev + 1);
                            } else {
                              setStartCalMonth(prev => prev + 1);
                            }
                          }}
                          className="p-1 hover:bg-gray-100 rounded cursor-pointer text-slate-500 transition"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-7 text-center font-bold text-slate-400 text-xs mb-2.5">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                          <div key={d} className="pb-1">{d}</div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 text-center text-sm gap-1">
                        {getCalendarDaysFor(startCalYear, startCalMonth).map((dayObj, index) => {
                          const isSelected = isSameDay(startDate, dayObj.year, dayObj.month, dayObj.day);
                          return (
                            <button
                              key={index}
                              onClick={() => setStartDate(new Date(dayObj.year, dayObj.month, dayObj.day))}
                              className={`w-8 h-8 flex items-center justify-center rounded-full mx-auto transition-all duration-150 cursor-pointer ${isSelected
                                ? 'bg-blue-600 text-white font-bold shadow-sm'
                                : dayObj.isCurrentMonth
                                  ? 'text-slate-800 hover:bg-gray-200'
                                  : 'text-gray-400 hover:bg-gray-200'
                                }`}
                            >
                              {dayObj.day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* End Date Calendar */}
                  <div className="bg-white rounded-lg p-4 border border-slate-100 shadow-2xs">
                    <h5 className="text-sm font-semibold mb-2 text-slate-700 px-1 py-0.5">End Date</h5>
                    <div className="w-full text-sm">
                      <div className="flex items-center justify-between mb-3">
                        <button
                          onClick={() => {
                            if (endCalMonth === 0) {
                              setEndCalMonth(11);
                              setEndCalYear(prev => prev - 1);
                            } else {
                              setEndCalMonth(prev => prev - 1);
                            }
                          }}
                          className="p-1 hover:bg-gray-100 rounded cursor-pointer text-slate-500 transition"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-1 font-semibold text-slate-800">
                          <span>{monthsList[endCalMonth]}</span>
                          <span>{endCalYear}</span>
                        </div>
                        <button
                          onClick={() => {
                            if (endCalMonth === 11) {
                              setEndCalMonth(0);
                              setEndCalYear(prev => prev + 1);
                            } else {
                              setEndCalMonth(prev => prev + 1);
                            }
                          }}
                          className="p-1 hover:bg-gray-100 rounded cursor-pointer text-slate-500 transition"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-7 text-center font-bold text-slate-400 text-xs mb-2.5">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                          <div key={d} className="pb-1">{d}</div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 text-center text-sm gap-1">
                        {getCalendarDaysFor(endCalYear, endCalMonth).map((dayObj, index) => {
                          const isSelected = isSameDay(endDate, dayObj.year, dayObj.month, dayObj.day);
                          return (
                            <button
                              key={index}
                              onClick={() => setEndDate(new Date(dayObj.year, dayObj.month, dayObj.day))}
                              className={`w-8 h-8 flex items-center justify-center rounded-full mx-auto transition-all duration-150 cursor-pointer ${isSelected
                                ? 'bg-blue-600 text-white font-bold shadow-sm'
                                : dayObj.isCurrentMonth
                                  ? 'text-slate-800 hover:bg-gray-200'
                                  : 'text-gray-400 hover:bg-gray-200'
                                }`}
                            >
                              {dayObj.day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              /* Calendar Container */
              <div className="bg-[#f8fafc] rounded-xl p-5 border border-slate-100 shadow-xs">
                <div className="bg-white rounded-lg p-5 max-w-md mx-auto shadow-xs border border-slate-100/80">

                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-5 px-1">
                    <button
                      onClick={handlePrevMonth}
                      className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <h2 className="font-bold text-slate-800 text-sm tracking-wide">
                      {monthsList[currentMonth]} {currentYear}
                    </h2>

                    <button
                      onClick={handleNextMonth}
                      className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Week Days Headers */}
                  <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 mb-3 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                      (day) => (
                        <div key={day} className="py-1">
                          {day}
                        </div>
                      )
                    )}
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-7 text-center text-sm gap-2">
                    {getCalendarDays().map((dayObj, index) => {
                      const isSelected = isSameDay(selectedDate, dayObj.year, dayObj.month, dayObj.day);

                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedDate(new Date(dayObj.year, dayObj.month, dayObj.day))}
                          className={`w-9 h-9 flex items-center justify-center rounded-full mx-auto transition-all duration-150 cursor-pointer ${isSelected
                            ? 'bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm ring-2 ring-blue-100'
                            : dayObj.isCurrentMonth
                              ? 'text-slate-800 font-semibold hover:bg-slate-100'
                              : 'text-slate-300 font-medium hover:bg-slate-50'
                            }`}
                        >
                          {dayObj.day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Group By Option */}
            <div className="bg-[#f8fafc] rounded-xl p-5 border border-slate-100 shadow-xs">
              <h4 className="text-[11px] font-bold mb-3 text-slate-400 uppercase tracking-wider">
                Group By
              </h4>

              <div className="flex gap-2">
                {['Days', 'Weeks', 'Months'].map((item) => {
                  const isActive = selectedGroupBy === item;
                  return (
                    <button
                      key={item}
                      onClick={() => setSelectedGroupBy(item)}
                      className={`px-5 py-2.5 rounded-lg border text-sm font-semibold transition-all duration-150 cursor-pointer ${isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs shadow-blue-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
                        }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Report Timezone — read only, sourced from the user's real Settings.
                (Previously this was a second, disconnected timezone picker that
                didn't match the real app timezone and wasn't saved anywhere.) */}
            <div className="bg-[#f8fafc] rounded-xl p-5 border border-slate-100 shadow-xs">
              <h4 className="text-[11px] font-bold mb-3 text-slate-400 uppercase tracking-wider">
                Report Timezone
              </h4>

              <div className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700">
                <span>{timezone}</span>
                <a
                  href="/dashboard/settings/profile"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Change in Settings
                </a>
              </div>
            </div>


          </div>


        </div>
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={() => {


              let range = {
                type: "Day",
                startDate: selectedDate,
                endDate: selectedDate,
              };


              let appliedDate = selectedDate;

              let rangeText = selectedDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });

              if (selectedDateRangeType === "Day") {
                const selectedDay = createDateInTimezone(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth(),
                  selectedDate.getDate(),
                  timezone
                );

                appliedDate = selectedDay;

                range = {
                  type: "Day",
                  startDate: selectedDay,
                  endDate: selectedDay,
                };

                rangeText = selectedDay.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  timeZone: timezone,
                });
              }

              // Week ranges
              if (selectedDateRangeType === "Week") {
                const [start, end] = selectedWeek.split(",");

                if (!start || !end) {
                  return;
                }

                const startParts = start.split("-").map(Number);
                const endParts = end.split("-").map(Number);

                if (
                  startParts.length !== 3 ||
                  endParts.length !== 3 ||
                  startParts.some(Number.isNaN) ||
                  endParts.some(Number.isNaN)
                ) {
                  return;
                }

                const [startYear, startMonth, startDay] = startParts as [
                  number,
                  number,
                  number
                ];

                const [endYear, endMonth, endDay] = endParts as [
                  number,
                  number,
                  number
                ];

                const weekStart = createDateInTimezone(
                  startYear,
                  startMonth - 1,
                  startDay,
                  timezone
                );

                const weekEnd = createDateInTimezone(
                  endYear,
                  endMonth - 1,
                  endDay,
                  timezone
                );

                range = {
                  type: "Week",
                  startDate: weekStart,
                  endDate: weekEnd,
                };

                appliedDate = weekStart;

                rangeText =
                  `${weekStart.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    timeZone: timezone,
                  })} - ${weekEnd.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    timeZone: timezone,
                  })}`;
              }

              // Month range
              if (selectedDateRangeType === "Month") {
                const firstDay = createDateInTimezone(
                  currentYear,
                  currentMonth,
                  1,
                  timezone
                );

                const lastCalendarDay = new Date(
                  Date.UTC(currentYear, currentMonth + 1, 0)
                ).getUTCDate();

                const lastDay = createDateInTimezone(
                  currentYear,
                  currentMonth,
                  lastCalendarDay,
                  timezone
                );

                appliedDate = firstDay;

                range = {
                  type: "Month",
                  startDate: firstDay,
                  endDate: lastDay,
                };

                rangeText = `${monthsList[currentMonth]} ${currentYear}`;
              }

              // Year Range
              if (selectedDateRangeType === "Year") {
                const firstDay = createDateInTimezone(
                  currentYear,
                  0,
                  1,
                  timezone
                );

                const lastDay = createDateInTimezone(
                  currentYear,
                  11,
                  31,
                  timezone
                );

                appliedDate = firstDay;

                range = {
                  type: "Year",
                  startDate: firstDay,
                  endDate: lastDay,
                };

                rangeText = currentYear.toString();
              }
              // Custom ranges
              if (selectedDateRangeType === "Custom") {
                const customStart = createDateInTimezone(
                  startDate.getFullYear(),
                  startDate.getMonth(),
                  startDate.getDate(),
                  timezone
                );

                const customEnd = createDateInTimezone(
                  endDate.getFullYear(),
                  endDate.getMonth(),
                  endDate.getDate(),
                  timezone
                );

                appliedDate = customStart;

                range = {
                  type: "Custom",
                  startDate: customStart,
                  endDate: customEnd,
                };

                rangeText =
                  `${customStart.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    timeZone: timezone,
                  })} - ${customEnd.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    timeZone: timezone,
                  })}`;
              }

              let label = selectedQuickSelect;

              if (selectedDateRangeType === "Month") {
                label = "Month";
              }

              if (selectedDateRangeType === "Year") {
                label = "Year";
              }

              if (
                selectedDateRangeType === "Custom" &&
                selectedQuickSelect === "Custom"
              ) {
                label = "Custom";
              }

              if (selectedDateRangeType === "Week") {
                switch (selectedQuickSelect) {
                  case "This week (Mon - Today)":
                    label = "This week";
                    break;

                  case "Last week (Mon - Sun)":
                    label = "Last week";
                    break;

                  default:
                    label = "Week";
                }
              }

              onApply?.(
                appliedDate,
                label,
                rangeText,
                range,
              );

              onClose?.();
            }}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div >
  );
}