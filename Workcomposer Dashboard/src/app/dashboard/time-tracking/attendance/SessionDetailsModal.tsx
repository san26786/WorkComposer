"use client";
import { useState } from "react";
import Image from "next/image";
import AttendanceActivityChart from "./AttendanceActivityChart";
import ScreenshotDetailsModal from "../screenshots/ScreenshotDetailsModal";
import { HiClock } from "react-icons/hi2";
import { HiBriefcase } from "react-icons/hi2";
import { BsFillBarChartFill } from "react-icons/bs";

type Props = {
    open: boolean;
    onClose: () => void;
    detailsData: any;
};

export default function SessionDetailsModal({
    open,
    onClose,
    detailsData,
}: Props) {

    const [selectedScreenshot, setSelectedScreenshot] =
        useState<any>(null);

    const [selectedIndex, setSelectedIndex] =
        useState(0);

    const screenshots = detailsData?.screenshots || [];

    const highActivity = screenshots.filter(
        (s: any) => s.activityScore >= 70
    ).length;

    const mediumActivity = screenshots.filter(
        (s: any) =>
            s.activityScore >= 40 &&
            s.activityScore < 70
    ).length;

    const lowActivity = screenshots.filter(
        (s: any) => s.activityScore < 40
    ).length;

    const totalShots = screenshots.length;

    const highPercent =
        totalShots > 0
            ? Math.round((highActivity / totalShots) * 100)
            : 0;

    const mediumPercent =
        totalShots > 0
            ? Math.round((mediumActivity / totalShots) * 100)
            : 0;

    const lowPercent =
        totalShots > 0
            ? Math.round((lowActivity / totalShots) * 100)
            : 0;



    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

            <div className="bg-white rounded-2xl w-[90vw] max-w-6xl h-[90vh] overflow-y-auto">

                <div className="flex items-center justify-between px-4 py-3 border-b">

                    <div className="flex items-center gap-2">
                        <HiClock className="w-5 h-5 text-indigo-700" />

                        <h2 className="text-lg font-semibold text-black">
                            Work Details
                        </h2>

                    </div>

                    <div className="flex items-center gap-6">

                        <span className="text-sm text-slate-600 font-semibold">
                            {detailsData?.startTime &&
                                detailsData?.endTime
                                ? `${new Date(
                                    detailsData.startTime
                                ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })} - ${new Date(
                                    detailsData.endTime
                                ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}`
                                : "--"}
                        </span>

                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full border-3 border-indigo-500 flex items-center justify-center text-indigo-500 hover:bg-indigo-50"
                        >
                            ✕
                        </button>

                    </div>

                </div>

                <div className="grid grid-cols-2 gap-6 p-4">

                    {/* Left Side */}
                    <div className="bg-white border rounded-2xl p-4">

                        <div className="grid grid-cols-2 gap-6">

                            {/* Work Time */}
                            <div className="flex items-start gap-4">

                                <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                                    <HiBriefcase className="h-5.5 w-5.5 text-indigo-600" />
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase">
                                        Work Time
                                    </p>

                                    <p className="text-lg font-bold text-indigo-500 mt-1">
                                        {detailsData?.workTime || "0h 0m"}
                                    </p>
                                </div>

                            </div>

                            {/* Activity */}
                            <div>



                                <div className=" flex text-sm font-medium text-slate-600 mb-3 gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                                        <BsFillBarChartFill className="h-4.5 w-4.5 text-blue-400" />
                                    </div>
                                    Activity Levels
                                </div>

                                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className={
                                            detailsData?.activityScore >= 70
                                                ? "h-full bg-green-500"
                                                : detailsData?.activityScore >= 40
                                                    ? "h-full bg-amber-500"
                                                    : "h-full bg-red-500"
                                        }
                                        style={{
                                            width: `${detailsData?.activityScore || 0}%`,
                                        }}
                                    />

                                </div>

                                <div className="flex justify-between mt-1 text-xs font-semibold">

                                    <span
                                        className={
                                            detailsData?.activityScore >= 70
                                                ? "text-green-600 font-medium"
                                                : detailsData?.activityScore >= 40
                                                    ? "text-amber-600 font-medium"
                                                    : "text-red-600 font-medium"
                                        }
                                    >
                                        {detailsData?.activityScore || 0}% active
                                    </span>

                                    <span className="text-slate-500">
                                        {detailsData?.idleTime || 0}% idle
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* Right Side */}
                    <div className="bg-white border rounded-2xl p-4">

                        <h3 className="text-xl font-medium text-slate-700 mb-4">
                            Application Usage
                        </h3>

                        <div className="grid grid-cols-3 gap-4 mt-4">

                            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
                                <p className="text-xs text-gray-500">Productive</p>
                                <p className="mt-1 text-xl font-semibold text-green-600">
                                    {detailsData?.productivePercent ?? 0}%
                                </p>
                            </div>

                            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-center">
                                <p className="text-xs text-gray-500">Neutral</p>
                                <p className="mt-1 text-xl font-semibold text-gray-700">
                                    {detailsData?.neutralPercent ?? 0}%
                                </p>
                            </div>

                            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-center">
                                <p className="text-xs text-gray-500">Unproductive</p>
                                <p className="mt-1 text-xl font-semibold text-red-600">
                                    {detailsData?.unproductivePercent ?? 0}%
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 px-6">

                    {/* Activity Chart */}
                    <div className="border rounded-2xl p-6 min-h-[250px]">

                        <h3 className="text-xl font-semibold text-slate-700 mb-4">
                            Activity Timeline
                        </h3>

                        <div className="h-[240px] overflow-y-auto">

                            <AttendanceActivityChart
                                data={detailsData?.chartData || []}
                            />

                        </div>

                    </div>

                    {/* Empty Right Panel */}
                    <div className="border rounded-2xl p-6 min-h-[250px]">

                        <h3 className="text-xl font-semibold text-slate-700 mb-4">
                            Activity Details
                        </h3>

                        <div className="space-y-4">

                            <div className="flex items-center justify-between p-4 rounded-xl bg-green-50">

                                <div className="flex items-center gap-3">

                                    <div className="w-3 h-3 rounded-full bg-green-500" />

                                    <span className="font-medium text-sm text-slate-700">
                                        High Activity
                                    </span>

                                </div>

                                <span className="font-bold text-sm text-green-600">
                                    {highActivity} - ({highPercent}%)
                                </span>

                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50">

                                <div className="flex items-center gap-3">

                                    <div className="w-3 h-3 rounded-full bg-amber-500" />

                                    <span className="font-medium text-sm text-slate-700">
                                        Medium Activity
                                    </span>

                                </div>

                                <span className="font-bold text-sm text-amber-600">
                                    {mediumActivity} - ({mediumPercent}%)
                                </span>

                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-red-50">

                                <div className="flex items-center gap-3">

                                    <div className="w-3 h-3 rounded-full bg-red-500" />

                                    <span className="font-medium text-sm text-slate-700">
                                        Low Activity
                                    </span>

                                </div>

                                <span className="font-bold text-sm text-red-600">
                                    {lowActivity} - ({lowPercent}%)
                                </span>

                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">

                                <span className="font-medium text-slate-700">
                                    Total Screenshots
                                </span>

                                <span className="font-bold text-indigo-600">
                                    {screenshots.length}
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

                <div className="px-6 pb-6">

                    <h3 className="text-xl font-semibold text-slate-700 mb-4">
                        Screenshots ({detailsData?.screenshots?.length || 0})
                    </h3>

                    <div className="flex gap-4 overflow-x-auto pb-2">

                        {detailsData?.screenshots?.map((shot: any, index: number) => (

                            <div
                                key={shot._id}
                                className="

group
border
rounded-xl
overflow-hidden
bg-white
flex-shrink-0
w-64
cursor-pointer
transition-all
duration-200
hover:shadow-lg
hover:-translate-y-1
"
                            >

                                <Image
                                    src={shot.imageUrl}
                                    alt="Screenshot"
                                    width={600}
                                    height={240}
                                    className="w-full h-33 object-cover cursor-pointer hover:opacity-90"
                                    onClick={() => {
                                        setSelectedScreenshot(shot);
                                        setSelectedIndex(index);
                                    }}
                                />

                                <div className="p-3">

                                    <div className="flex justify-between text-xs font-semibold mb-2">

                                        <div className="flex items-center gap-2">

                                            <div
                                                className={`
    w-2.5
    h-2.5
    rounded-full
    transition-transform
    group-hover:scale-125
    ${shot.activityScore >= 70
                                                        ? "bg-green-500 animate-pulse"
                                                        : shot.activityScore >= 40
                                                            ? "bg-amber-500"
                                                            : "bg-red-500"
                                                    }
`}
                                            />

                                            <span>
                                                {new Date(
                                                    shot.capturedAt
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>

                                        </div>

                                        <span
                                            className={
                                                shot.activityScore >= 70
                                                    ? "text-green-600"
                                                    : shot.activityScore >= 40
                                                        ? "text-amber-500"
                                                        : "text-red-500"
                                            }
                                        >
                                            {shot.activityScore}%
                                        </span>

                                    </div>

                                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">

                                        <div
                                            className={
                                                shot.activityScore >= 70
                                                    ? "h-full bg-green-500"
                                                    : shot.activityScore >= 40
                                                        ? "h-full bg-amber-500"
                                                        : "h-full bg-red-500"
                                            }
                                            style={{
                                                width: `${shot.activityScore}%`,
                                            }}
                                        />

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            </div>


            {
                selectedScreenshot && (
                    <ScreenshotDetailsModal
                        screenshot={selectedScreenshot}
                        currentIndex={selectedIndex}
                        total={
                            detailsData?.screenshots?.length || 0
                        }
                        onClose={() =>
                            setSelectedScreenshot(null)
                        }
                        onPrevious={() => {
                            const newIndex =
                                selectedIndex - 1;

                            if (newIndex < 0) return;

                            setSelectedIndex(newIndex);

                            setSelectedScreenshot(
                                detailsData.screenshots[newIndex]
                            );
                        }}
                        onNext={() => {
                            const newIndex =
                                selectedIndex + 1;

                            if (
                                newIndex >=
                                detailsData.screenshots.length
                            )
                                return;

                            setSelectedIndex(newIndex);

                            setSelectedScreenshot(
                                detailsData.screenshots[newIndex]
                            );
                        }}
                    />
                )
            }
        </div>
    );
}