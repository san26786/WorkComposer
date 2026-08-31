"use client";

import { BsBarChart } from "react-icons/bs";
import { HiOutlineClock } from "react-icons/hi";
import { PiInfo } from "react-icons/pi";
import ActivityDetailsChart from "./ActivityDetailsChart";
import { useEffect, useRef } from "react";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date;
    workTime: string;
    userName: string;
    activityData: {
        time: string;
        value: number;
        color?: string;
    }[];
};

const ActivityDetailsModal = ({
    isOpen,
    onClose,
    activityData,
    selectedDate,
    workTime,
    userName,
}: Props) => {

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);


    if (!isOpen) return null;

    return (
        <>
            <div role='dialog' className='relative z-50'>
                <div
                    className='fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity'
                    onClick={onClose}
                ></div>
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto'>
                    <div
                        ref={modalRef}
                        className='relative w-full max-w-4xl transform overflow-hidden rounded-xl bg-white p-6 shadow-xl transition-all max-h-[95vh] flex flex-col overflow-y-auto'>
                        <div className='flex items-center justify-center mb-4'>
                            <div className='text-center'>
                                <h2 className='text-lg font-semibold text-gray-900 flex items-center justify-center'>
                                    <BsBarChart className="h-6 w-6 mr-2 text-indigo-600" />
                                    Keyboard and Mouse Activity Levels
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {userName} - {selectedDate.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-5 shadow-sm">

                            <div className="h-[320px]">
                                <div className="flex items-center gap-6 mb-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                        <span>High Activity</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <span>Medium Activity</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <span>Low Activity</span>
                                    </div>
                                </div>
                                <ActivityDetailsChart data={activityData} />
                            </div>
                        </div>


                        <div className="border-t border-gray-200 pt-5 mb-5">
                            <div className="flex items-center justify-between">

                                <div className="flex items-center">
                                    <HiOutlineClock className="h-5 w-5 mr-2 text-indigo-600" />

                                    <span className="text-base font-medium text-gray-800">
                                        Total work time:{" "}
                                        <span className="font-semibold text-indigo-700">
                                            {workTime || "0h 0m"}
                                        </span>
                                    </span>
                                </div>

                                <a
                                    href="https://www.workcomposer.com/wc/idle-time-tracking-software/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-indigo-600 text-sm hover:text-indigo-800 transition-colors"
                                >
                                    <PiInfo className="h-4 w-4 mr-1" />
                                    Read more about Idle Time Tracking
                                </a>

                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 mb-5">
                            <div className="flex items-start mb-4">
                                <PiInfo className="h-5 w-5 mr-2 text-gray-700 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Understanding Activity Levels</h4>
                                    <p className="text-sm text-gray-700 leading-relaxed"> This chart visualizes the activity levels per 30-minute interval throughout the day, presented in percentages. Each point on the chart represents the measured activity level for a specific half-hour segment, offering insights into productivity patterns and intensity of work. </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ActivityDetailsModal
