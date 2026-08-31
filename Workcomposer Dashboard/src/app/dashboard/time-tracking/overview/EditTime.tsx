"use client";

import { useEffect, useState } from "react";
import API from "@/api";
import useEffectiveTrackingSettings from "@/hooks/useEffectiveTrackingSettings";
import toast from "react-hot-toast";
import { Clock3, ChevronDown } from "lucide-react";
import { IoCalendarClearOutline } from "react-icons/io5";
import { HiBriefcase } from "react-icons/hi2";
import { IoIosPause } from "react-icons/io";
import { PiInfo } from "react-icons/pi";
import { HiCheck } from "react-icons/hi2";
import { useAppTimezone } from "@/hooks/useAppTimezone";
import { createDateTimeInTimezone } from "@/utils/appTimezone";

type Props = {
  onClose: () => void;
  onSave: () => void;
};

const EditTime = ({ onClose, onSave }: Props) => {
  const timezone = useAppTimezone();

  const [mode, setMode] = useState<"work" | "break">("work");
  const [start, setStart] = useState<Date>(new Date());
  const [end, setEnd] = useState<Date>(
   new Date(new Date().getTime() + 5 * 60 * 1000),
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTask, setSelectedTask] = useState("");

  const { settings: effectiveSettings } =
    useEffectiveTrackingSettings();

  const backdatingLimit =
    effectiveSettings?.manualTime?.backdatingLimit ?? 365;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await API.get("/projects");

        setProjects(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    if (!selectedProject) {
      setTasks([]);
      setSelectedTask("");
      return;
    }

    const fetchTasks = async () => {
      try {
        const { data } = await API.get(
          `/tasks?project=${selectedProject}`
        );

        setTasks(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTasks();
  }, [selectedProject]);

  const duration: number = Math.max(
    0,
    Math.floor((end.getTime() - start.getTime()) / 1000),
  );

  // NOTE: `start`/`end` here hold the y/m/d/h/m the user picked from the
  // dropdowns, stored as local-browser Date objects purely so the native
  // getters (getFullYear/getMonth/...) are convenient to read back into the
  // <select> values. Before we ever send them anywhere, we re-interpret
  // those same y/m/d/h/m values as wall-clock time *in the app's report
  // timezone*, not the browser's timezone. That's what fixes the bug.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    const actualStart = createDateTimeInTimezone(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      start.getHours(),
      start.getMinutes(),
      timezone
    );

    const actualEnd = createDateTimeInTimezone(
      end.getFullYear(),
      end.getMonth(),
      end.getDate(),
      end.getHours(),
      end.getMinutes(),
      timezone
    );

    if (actualEnd <= actualStart) {
      if (!reason.trim()) {
        toast.error("Please provide a reason.");
        return;
      }

      toast.error("End time must be greater than start time.");
      return;
    }

    setLoading(true);

    try {
      type SessionPayload = {
        startTime: Date;
        endTime: Date;
        duration: number;
        date: string;
        team: string;
        type: "work" | "break";
      };

      const actualDuration = Math.max(
        0,
        Math.floor((actualEnd.getTime() - actualStart.getTime()) / 1000)
      );

      const payload: SessionPayload = {
        startTime: actualStart,
        endTime: actualEnd,
        duration: actualDuration,
        date: actualStart.toISOString().split("T")[0]!,
        team: "Default team",
        type: mode,
      }

      if (
        effectiveSettings?.manualTime?.requireProjectTask &&
        !selectedProject
      ) {
        toast.error("Please select a project.");

        return;
      }

      const { data } = await API.post("/manual-time-requests", {
        ...payload,
        project: selectedProject || null,
        task: selectedTask || null,
        reason,
      });

      toast.success(data.message);
      onSave();
      onClose();
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
        "Unable to save session."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateDate = (
    date: Date,
    type: "year" | "month" | "day" | "hour" | "minute",
    value: number,
    isStart: boolean = true,
  ) => {
    const newDate = new Date(date.getTime());

    if (type === "year") newDate.setFullYear(value);
    if (type === "month") newDate.setMonth(value - 1);
    if (type === "day") {
      const daysInMonth = new Date(
        newDate.getFullYear(),
        newDate.getMonth() + 1,
        0,
      ).getDate();

      newDate.setDate(Math.min(value, daysInMonth));
    }
    if (type === "hour") newDate.setHours(value);
    if (type === "minute") newDate.setMinutes(value);

    const earliestDate = new Date();

    earliestDate.setHours(0, 0, 0, 0);

    earliestDate.setDate(
      earliestDate.getDate() - backdatingLimit
    );

    if (newDate < earliestDate) {
      toast.error(
        `You can only add manual time up to ${backdatingLimit} day(s) in the past.`
      );

      return;
    }

    if (isStart) {
      setStart(newDate);

      if (newDate >= end) {
        const newEnd = new Date(newDate.getTime() + 5 * 60 * 1000);
        setEnd(newEnd);
      }
    } else {
      setEnd(newDate);
    }
  };

  const h = Math.floor(duration / 3600);
  const m = Math.floor((duration % 3600) / 60);
  const formatted: string = h > 0 ? `${h}h ${m}m` : `${m}m`;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 backdrop-blur-md bg-black/20"
      />

      <div
        className="fixed inset-0 z-50 w-screen overflow-y-auto"
        onClick={onClose}
      >
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full transform rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:max-w-4xl"
          >
            <div className="mt-3 text-center sm:mt-5">
              <h3
                id="headlessui-dialog-title-v-0-24"
                data-headlessui-state="open"
                className="text-base font-semibold leading-6 text-gray-900"
              >
                <div className="flex items-center mb-5">
                  <Clock3 className="h-6 w-6 text-indigo-600 mr-2" />
                  Add Manual Time
                </div>
              </h3>
            </div>

            {/*  FORM */}
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6 shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                  <IoCalendarClearOutline className="h-5 w-5 text-indigo-500 mr-2" />
                  Time Entry
                </h3>
                <div className="mb-5">
                  <div className="mb-4 flex justify-center sm:justify-end">
                    <div className="inline-flex rounded-md shadow-sm">
                      {/* WORK */}
                      <button
                        type="button"
                        onClick={() => setMode("work")}
                        className={`relative inline-flex items-center rounded-l-md px-4 py-2 text-sm font-medium transition-colors ${mode === "work"
                          ? "bg-indigo-500 text-white"
                          : "bg-white text-gray-700 border border-gray-300"
                          }`}
                      >
                        <HiBriefcase className="h-4 w-4 mr-1.5" />
                        Work Time
                      </button>

                      {/* BREAK */}
                      <button
                        type="button"
                        onClick={() => setMode("break")}
                        className={`relative -ml-px inline-flex items-center rounded-r-md px-4 py-2 text-sm font-medium transition-colors ${mode === "break"
                          ? "bg-indigo-500 text-white"
                          : "bg-white text-gray-700 border border-gray-300"
                          }`}
                      >
                        <IoIosPause className="h-4 w-4 mr-1.5" />
                        Break Time
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center">
                        <IoCalendarClearOutline className="w-5 h-5 text-indigo-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">
                          Select Time Range
                        </span>
                      </div>

                      <div className="flex items-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                        <Clock3 className="h-4 w-4 mr-1.5" />
                        {formatted}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-md p-3 border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-2">
                          <div className="h-4 w-4 rounded-full bg-indigo-500 mr-2"></div>
                          <label className="text-sm font-medium text-gray-700">
                            Start
                          </label>
                        </div>

                        <div className="space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full items-end">
                            <div className="w-full">
                              <label className="block text-sm font-medium text-gray-900">
                                Year
                              </label>
                              <div className="mt-1 relative">
                                <select
                                  aria-label="Start year"
                                  value={start.getFullYear()}
                                  onChange={(e) =>
                                    updateDate(
                                      start,
                                      "year",
                                      Number(e.target.value),
                                      true,
                                    )
                                  }
                                  className="block w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-sm text-gray-900 outline outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600"
                                >
                                  <option value={2026}>2026</option>
                                  <option value={2025}>2025</option>
                                  <option value={2024}>2024</option>
                                  <option value={2023}>2023</option>
                                  <option value={2022}>2022</option>
                                  <option value={2021}>2021</option>
                                  <option value={2020}>2020</option>
                                  <option value={2019}>2019</option>
                                  <option value={2018}>2018</option>
                                  <option value={2017}>2017</option>
                                  <option value={2016}>2016</option>
                                  <option value={2015}>2015</option>
                                  <option value={2014}>2014</option>
                                  <option value={2013}>2013</option>
                                  <option value={2012}>2012</option>
                                  <option value={2011}>2011</option>
                                  <option value={2010}>2010</option>
                                  <option value={2009}>2009</option>
                                  <option value={2008}>2008</option>
                                  <option value={2007}>2007</option>
                                  <option value={2006}>2006</option>
                                  <option value={2005}>2005</option>
                                  <option value={2004}>2004</option>
                                  <option value={2003}>2003</option>
                                  <option value={2002}>2002</option>
                                  <option value={2001}>2001</option>
                                  <option value={2000}>2000</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              </div>
                            </div>

                            <div className="w-full">
                              <label htmlFor="start-month" className="block text-sm font-medium text-gray-900">
                                Month
                              </label>
                              <div className="mt-1 relative">
                                <select
                                  id="start-month"
                                  value={start.getMonth() + 1}
                                  onChange={(e) =>
                                    updateDate(
                                      start,
                                      "month",
                                      Number(e.target.value),
                                      true,
                                    )
                                  }
                                  className="block w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-sm text-gray-900 outline outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600"
                                >
                                  <option value={1}>January</option>
                                  <option value={2}>February</option>
                                  <option value={3}>March</option>
                                  <option value={4}>April</option>
                                  <option value={5}>May</option>
                                  <option value={6}>June</option>
                                  <option value={7}>July</option>
                                  <option value={8}>August</option>
                                  <option value={9}>September</option>
                                  <option value={10}>October</option>
                                  <option value={11}>November</option>
                                  <option value={12}>December</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              </div>
                            </div>

                            <div className="w-full">
                              <label htmlFor="start-day" className="block text-sm font-medium text-gray-900">
                                Day
                              </label>
                              <div className="mt-1 relative">
                                <select
                                  id="start-day"
                                  value={start.getDate()}
                                  onChange={(e) =>
                                    updateDate(
                                      start,
                                      "day",
                                      Number(e.target.value),
                                      true,
                                    )
                                  }
                                  className="block w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-sm text-gray-900 outline outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600"
                                >
                                  {Array.from(
                                    {
                                      length: new Date(
                                        start.getFullYear(),
                                        start.getMonth() + 1,
                                        0,
                                      ).getDate(),
                                    },
                                    (_, i) => i + 1,
                                  ).map((day) => (
                                    <option key={day} value={day}>
                                      {day}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full items-end">
                            <div className="w-full">
                              <label className="block text-sm font-medium text-gray-900">
                                Hour
                              </label>
                              <div className="mt-1 relative">
                                <select
                                  value={start.getHours()}
                                  onChange={(e) =>
                                    updateDate(
                                      start,
                                      "hour",
                                      Number(e.target.value),
                                      true,
                                    )
                                  }
                                  className="block w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-sm text-gray-900 outline outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600"
                                >
                                  <option value={0}>00</option>
                                  <option value={1}>01</option>
                                  <option value={2}>02</option>
                                  <option value={3}>03</option>
                                  <option value={4}>04</option>
                                  <option value={5}>05</option>
                                  <option value={6}>06</option>
                                  <option value={7}>07</option>
                                  <option value={8}>08</option>
                                  <option value={9}>09</option>
                                  <option value={10}>10</option>
                                  <option value={11}>11</option>
                                  <option value={12}>12</option>
                                  <option value={13}>13</option>
                                  <option value={14}>14</option>
                                  <option value={15}>15</option>
                                  <option value={16}>16</option>
                                  <option value={17}>17</option>
                                  <option value={18}>18</option>
                                  <option value={19}>19</option>
                                  <option value={20}>20</option>
                                  <option value={21}>21</option>
                                  <option value={22}>22</option>
                                  <option value={23}>23</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              </div>
                            </div>

                            <div className="w-full">
                              <label className="block text-sm font-medium text-gray-900">
                                Minute
                              </label>
                              <div className="mt-1 relative">
                                <select
                                  value={start.getMinutes()}
                                  onChange={(e) =>
                                    updateDate(
                                      start,
                                      "minute",
                                      Number(e.target.value),
                                      true,
                                    )
                                  }
                                  className="block w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-sm text-gray-900 outline outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600"
                                >
                                  <option value={0}>00</option>
                                  <option value={1}>01</option>
                                  <option value={2}>02</option>
                                  <option value={3}>03</option>
                                  <option value={4}>04</option>
                                  <option value={5}>05</option>
                                  <option value={6}>06</option>
                                  <option value={7}>07</option>
                                  <option value={8}>08</option>
                                  <option value={9}>09</option>
                                  <option value={10}>10</option>
                                  <option value={11}>11</option>
                                  <option value={12}>12</option>
                                  <option value={13}>13</option>
                                  <option value={14}>14</option>
                                  <option value={15}>15</option>
                                  <option value={16}>16</option>
                                  <option value={17}>17</option>
                                  <option value={18}>18</option>
                                  <option value={19}>19</option>
                                  <option value={20}>20</option>
                                  <option value={21}>21</option>
                                  <option value={22}>22</option>
                                  <option value={23}>23</option>
                                  <option value={24}>24</option>
                                  <option value={25}>25</option>
                                  <option value={26}>26</option>
                                  <option value={27}>27</option>
                                  <option value={28}>28</option>
                                  <option value={29}>29</option>
                                  <option value={30}>30</option>
                                  <option value={31}>31</option>
                                  <option value={32}>32</option>
                                  <option value={33}>33</option>
                                  <option value={34}>34</option>
                                  <option value={35}>35</option>
                                  <option value={36}>36</option>
                                  <option value={37}>37</option>
                                  <option value={38}>38</option>
                                  <option value={39}>39</option>
                                  <option value={40}>40</option>
                                  <option value={41}>41</option>
                                  <option value={42}>42</option>
                                  <option value={43}>43</option>
                                  <option value={44}>44</option>
                                  <option value={45}>45</option>
                                  <option value={46}>46</option>
                                  <option value={47}>47</option>
                                  <option value={48}>48</option>
                                  <option value={49}>49</option>
                                  <option value={50}>50</option>
                                  <option value={51}>51</option>
                                  <option value={52}>52</option>
                                  <option value={53}>53</option>
                                  <option value={54}>54</option>
                                  <option value={55}>55</option>
                                  <option value={56}>56</option>
                                  <option value={57}>57</option>
                                  <option value={58}>58</option>
                                  <option value={59}>59</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-md p-3 border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-2">
                          <div className="h-4 w-4 rounded-full bg-green-500 mr-2"></div>
                          <label className="text-sm font-medium text-gray-700">
                            End
                          </label>
                        </div>

                        <div className="space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full items-end">
                            <div className="w-full">
                              <label className="block text-sm font-medium text-gray-900">
                                Year
                              </label>
                              <div className="mt-1 relative">
                                <select
                                  aria-label="End year"
                                  value={end.getFullYear()}
                                  onChange={(e) =>
                                    updateDate(
                                      end,
                                      "year",
                                      Number(e.target.value),
                                      false,
                                    )
                                  }
                                  className="block w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-sm text-gray-900 outline outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600"
                                >
                                  <option value={2026}>2026</option>
                                  <option value={2025}>2025</option>
                                  <option value={2024}>2024</option>
                                  <option value={2023}>2023</option>
                                  <option value={2022}>2022</option>
                                  <option value={2021}>2021</option>
                                  <option value={2020}>2020</option>
                                  <option value={2019}>2019</option>
                                  <option value={2018}>2018</option>
                                  <option value={2017}>2017</option>
                                  <option value={2016}>2016</option>
                                  <option value={2015}>2015</option>
                                  <option value={2014}>2014</option>
                                  <option value={2013}>2013</option>
                                  <option value={2012}>2012</option>
                                  <option value={2011}>2011</option>
                                  <option value={2010}>2010</option>
                                  <option value={2009}>2009</option>
                                  <option value={2008}>2008</option>
                                  <option value={2007}>2007</option>
                                  <option value={2006}>2006</option>
                                  <option value={2005}>2005</option>
                                  <option value={2004}>2004</option>
                                  <option value={2003}>2003</option>
                                  <option value={2002}>2002</option>
                                  <option value={2001}>2001</option>
                                  <option value={2000}>2000</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              </div>
                            </div>

                            <div className="w-full">
                              <label htmlFor="end-month" className="block text-sm font-medium text-gray-900">
                                Month
                              </label>
                              <div className="mt-1 relative">
                                <select
                                  id="end-month"
                                  value={end.getMonth() + 1}
                                  onChange={(e) =>
                                    updateDate(
                                      end,
                                      "month",
                                      Number(e.target.value),
                                      false,
                                    )
                                  }
                                  className="block w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-sm text-gray-900 outline outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600"
                                >
                                  <option value={1}>January</option>
                                  <option value={2}>February</option>
                                  <option value={3}>March</option>
                                  <option value={4}>April</option>
                                  <option value={5}>May</option>
                                  <option value={6}>June</option>
                                  <option value={7}>July</option>
                                  <option value={8}>August</option>
                                  <option value={9}>September</option>
                                  <option value={10}>October</option>
                                  <option value={11}>November</option>
                                  <option value={12}>December</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              </div>
                            </div>

                            <div className="w-full">
                              <label className="block text-sm font-medium text-gray-900">
                                Day
                              </label>
                              <div className="mt-1 relative">
                                <select
                                  aria-label="End day"
                                  value={end.getDate()}
                                  onChange={(e) =>
                                    updateDate(
                                      end,
                                      "day",
                                      Number(e.target.value),
                                      false,
                                    )
                                  }
                                  className="block w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-sm text-gray-900 outline outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600"
                                >
                                  {Array.from(
                                    {
                                      length: new Date(
                                        end.getFullYear(),
                                        end.getMonth() + 1,
                                        0,
                                      ).getDate(),
                                    },
                                    (_, i) => i + 1,
                                  ).map((day) => (
                                    <option key={day} value={day}>
                                      {day}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full items-end">
                            <div className="w-full">
                              <label className="block text-sm font-medium text-gray-900">
                                Hour
                              </label>
                              <div className="mt-1 relative">
                                <select
                                  aria-label="End hour"
                                  value={end.getHours()}
                                  onChange={(e) =>
                                    updateDate(
                                      end,
                                      "hour",
                                      Number(e.target.value),
                                      false,
                                    )
                                  }
                                  className="block w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-sm text-gray-900 outline outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600"
                                >
                                  <option value={0}>00</option>
                                  <option value={1}>01</option>
                                  <option value={2}>02</option>
                                  <option value={3}>03</option>
                                  <option value={4}>04</option>
                                  <option value={5}>05</option>
                                  <option value={6}>06</option>
                                  <option value={7}>07</option>
                                  <option value={8}>08</option>
                                  <option value={9}>09</option>
                                  <option value={10}>10</option>
                                  <option value={11}>11</option>
                                  <option value={12}>12</option>
                                  <option value={13}>13</option>
                                  <option value={14}>14</option>
                                  <option value={15}>15</option>
                                  <option value={16}>16</option>
                                  <option value={17}>17</option>
                                  <option value={18}>18</option>
                                  <option value={19}>19</option>
                                  <option value={20}>20</option>
                                  <option value={21}>21</option>
                                  <option value={22}>22</option>
                                  <option value={23}>23</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              </div>
                            </div>

                            <div className="w-full">
                              <label htmlFor="end-minute" className="block text-sm font-medium text-gray-900">
                                Minute
                              </label>
                              <div className="mt-1 relative">
                                <select
                                  id="end-minute"
                                  value={end.getMinutes()}
                                  onChange={(e) =>
                                    updateDate(
                                      end,
                                      "minute",
                                      Number(e.target.value),
                                      false,
                                    )
                                  }
                                  className="block w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-sm text-gray-900 outline outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600"
                                >
                                  <option value={0}>00</option>
                                  <option value={1}>01</option>
                                  <option value={2}>02</option>
                                  <option value={3}>03</option>
                                  <option value={4}>04</option>
                                  <option value={5}>05</option>
                                  <option value={6}>06</option>
                                  <option value={7}>07</option>
                                  <option value={8}>08</option>
                                  <option value={9}>09</option>
                                  <option value={10}>10</option>
                                  <option value={11}>11</option>
                                  <option value={12}>12</option>
                                  <option value={13}>13</option>
                                  <option value={14}>14</option>
                                  <option value={15}>15</option>
                                  <option value={16}>16</option>
                                  <option value={17}>17</option>
                                  <option value={18}>18</option>
                                  <option value={19}>19</option>
                                  <option value={20}>20</option>
                                  <option value={21}>21</option>
                                  <option value={22}>22</option>
                                  <option value={23}>23</option>
                                  <option value={24}>24</option>
                                  <option value={25}>25</option>
                                  <option value={26}>26</option>
                                  <option value={27}>27</option>
                                  <option value={28}>28</option>
                                  <option value={29}>29</option>
                                  <option value={30}>30</option>
                                  <option value={31}>31</option>
                                  <option value={32}>32</option>
                                  <option value={33}>33</option>
                                  <option value={34}>34</option>
                                  <option value={35}>35</option>
                                  <option value={36}>36</option>
                                  <option value={37}>37</option>
                                  <option value={38}>38</option>
                                  <option value={39}>39</option>
                                  <option value={40}>40</option>
                                  <option value={41}>41</option>
                                  <option value={42}>42</option>
                                  <option value={43}>43</option>
                                  <option value={44}>44</option>
                                  <option value={45}>45</option>
                                  <option value={46}>46</option>
                                  <option value={47}>47</option>
                                  <option value={48}>48</option>
                                  <option value={49}>49</option>
                                  <option value={50}>50</option>
                                  <option value={51}>51</option>
                                  <option value={52}>52</option>
                                  <option value={53}>53</option>
                                  <option value={54}>54</option>
                                  <option value={55}>55</option>
                                  <option value={56}>56</option>
                                  <option value={57}>57</option>
                                  <option value={58}>58</option>
                                  <option value={59}>59</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {effectiveSettings?.manualTime?.requireProjectTask && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Project
                      </label>

                      <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2"
                      >
                        <option value="">Select Project</option>

                        {projects.map((project) => (
                          <option
                            key={project._id}
                            value={project._id}
                          >
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Task
                      </label>

                      <select
                        value={selectedTask}
                        onChange={(e) => setSelectedTask(e.target.value)}
                        disabled={!selectedProject}
                        className="w-full rounded-lg border px-3 py-2 disabled:opacity-50"
                      >
                        <option value="">Select Task</option>

                        {tasks.map((task) => (
                          <option
                            key={task._id}
                            value={task._id}
                          >
                            {task.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Reason for Manual Time
                  </label>



                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    required
                    placeholder="Explain why you're requesting manual work or break time..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div>
                  <div className="text-sm text-gray-600 bg-gray-50 p-4 border border-gray-200 flex items-start">
                    <PiInfo className="w-5 h-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      Any existing tracking data for the selected period will be
                      overwritten.
                    </span>
                  </div>
                </div>
              </div>


              {error && (
                <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-red-600 text-sm">
                  {error}
                </div>
              )}
              <div className="flex justify-center sm:justify-center">
                <button className="inline-flex justify-center items-center rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {loading ? (
                    "Saving..."
                  ) : (
                    <>
                      <HiCheck className="h-5 w-5 mr-1.5" />
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditTime;