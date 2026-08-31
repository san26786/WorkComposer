"use client";

import BackgroundTasksReports from "./BackgroundTasksReports";
import API from "@/api";
import { useState, useEffect } from "react";
import { HiOutlineTrash } from "react-icons/hi2";
import { IoCalendarClearOutline } from "react-icons/io5";
import { Clock3, ChevronDown, Eye } from "lucide-react";
import { PiInfo } from "react-icons/pi";
import { AiOutlineFileText } from "react-icons/ai";
import toast from "react-hot-toast";
import { useRef } from "react";

//  TYPES 
type Props = {
    onClose: () => void;
    onDelete?: () => void;
};

type UpdateField = "year" | "month" | "day" | "hour" | "minute";

// COMPONENT
const RemoveTime = ({ onClose, onDelete }: Props) => {
    const [start, setStart] = useState<Date>(new Date());
    const [end, setEnd] = useState<Date>(new Date());
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const [showReport, setShowReport] = useState<boolean>(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleMouseDown);

        return () =>
            document.removeEventListener(
                "mousedown",
                handleMouseDown
            );
    }, [onClose]);

    const handleDelete = async () => {
        try {
            setLoading(true);

            const res = await API.delete("/sessions/delete-range", {
                data: {
                    startTime: start.toISOString(),
                    endTime: end.toISOString(),
                }
            });

            setReportData(res.data);
            setShowReport(true);

            onDelete?.();

        } catch (err: any) {
            toast.error(
                err.response?.data?.error ||
                "Delete failed."
            );
        } finally {
            setLoading(false);
        }
    };

    //   UPDATE DATE 

    const updateDate = (
        date: Date,
        field: UpdateField,
        value: number,
        isStart: boolean
    ) => {
        const newDate = new Date(date);

        if (field === "year") newDate.setFullYear(value);
        if (field === "month") newDate.setMonth(value - 1);
        if (field === "day") newDate.setDate(value);
        if (field === "hour") newDate.setHours(value);
        if (field === "minute") newDate.setMinutes(value);

        if (isStart) {
            setStart(newDate);
        } else {
            setEnd(newDate);
        }
    };


    const totalSeconds = Math.max(
        0,
        Math.floor((end.getTime() - start.getTime()) / 1000)
    );

    const hours = (totalSeconds / 3600).toFixed(1);



    const fetchPreview = async () => {
        try {
            setPreviewLoading(true);

            const res = await API.get("/sessions/preview-range", {
                params: {
                    startTime: start.toISOString(),
                    endTime: end.toISOString(),
                },
            });


            setPreviewData(res.data);
        } catch (err) {
            toast.error("Preview failed");
        } finally {
            setPreviewLoading(false);
        }
    };


    useEffect(() => {
        setPreviewData(null);
    }, [start, end]);

    useEffect(() => {
        const now = new Date();

        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        setStart(startOfDay);
        setEnd(now)
    }, []);



    return (
        <>
            <div>
                <div
                    role="dialog"
                    className="relative z-50"
                    aria-modal="true"
                >
                    <div
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"></div>

                    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto p-2 sm:p-4">
                        <div
                            ref={modalRef}
                            className="w-full max-w-4xl transform overflow-hidden rounded-xl bg-white p-4 sm:p-6 shadow-xl transition-all">

                            {/* HEADER */}
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <HiOutlineTrash className="h-6 w-6 text-red-600 mr-2" />
                                Delete Tracking Records
                            </h2>

                            <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6 shadow-sm">
                                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                                    <IoCalendarClearOutline className="h-5 w-5 text-indigo-500 mr-2" />
                                    Time Range Selection
                                </h3>

                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                                    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center">
                                            <Clock3 className="h-5 w-5 text-indigo-500 mr-2" />
                                            <span className="text-sm font-medium text-gray-700">Select Time Range to Delete</span>
                                        </div>

                                        <div className="flex items-center bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium ">
                                            <Clock3 className="h-4 w-4 mr-1.5" />
                                            {Math.floor(totalSeconds / 3600)}h {Math.floor((totalSeconds % 3600) / 60)}m
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
                                                                title="Start year"
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


                                <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-md border border-gray-200 flex items-start ">
                                    <PiInfo className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                                    <span>All tracking data for the selected period will be permanently deleted. This action cannot be undone.</span>
                                </div>
                            </div>

                            <div className="text-center mb-6">
                                <button
                                    disabled={previewLoading}
                                    onClick={() => {
                                        if (!showPreview) {
                                            fetchPreview();
                                        }
                                        setShowPreview(prev => !prev);
                                    }}
                                    className="inline-flex items-center justify-center rounded-md bg-indigo-100 px-5 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors">
                                    <Eye className="h-5 w-5 mr-1.5" />
                                    {previewLoading ? "Loading..." : "Preview Deletion"}
                                </button>
                            </div>
                            {showPreview && (
                                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                                    <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                                        <AiOutlineFileText className="w-5 h-5 text-indigo-500 mr-2" />
                                        Deletion Preview
                                    </h3>

                                    <div className="bg-red-50 rounded-lg p-4 border border-red-100 mb-4">
                                        <h5 className="text-base font-medium text-gray-900 mb-3 flex items-center"> You&apos;re about to delete: </h5>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-white rounded-md p-3 border border-gray-200 shadow-sm text-center">
                                                <div className="text-sm text-gray-500 mb-1">Work Time</div>
                                                <div className="text-lg font-semibold text-indigo-600">{previewData ? (previewData.workTime / 3600).toFixed(1) : "0.0"} hours</div>
                                            </div>

                                            <div className="bg-white rounded-md p-3 border border-gray-200 shadow-sm text-center">
                                                <div className="text-sm text-gray-500 mb-1">Break time</div>
                                                <div className="text-lg font-semibold text-indigo-600">{previewData ? (previewData.breakTime / 3600).toFixed(1) : "0.0"} hours</div>
                                            </div>

                                            <div className="bg-white rounded-md p-3 border border-gray-200 shadow-sm text-center">
                                                <div className="text-sm text-gray-500 mb-1">ScreenShots</div>
                                                <div className="text-lg font-semibold text-indigo-600">{previewData ? previewData.screenshots : 0}</div>
                                            </div>

                                        </div>
                                    </div>



                                    <div className="flex justify-center">
                                        <button
                                            onClick={handleDelete}
                                            disabled={loading || !previewData || previewData.sessionsCount === 0}
                                            className="inline-flex items-center justify-center rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                                        >
                                            <HiOutlineTrash className="h-5 w-5 mr-1.5" />
                                            {loading ? "Deleting..." : "Confirm Deletion"}
                                        </button>

                                        {previewData && previewData.workTime === 0 && previewData.breakTime === 0 && (
                                            <div className="text-red-500 text-sm mt-3 text-center">No sessions found in selected time range</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showReport && (
                <BackgroundTasksReports
                    data={reportData}
                    onClose={() => {
                        setShowReport(false);
                        onClose();
                    }}
                />
            )}

        </>
    )
}

export default RemoveTime
