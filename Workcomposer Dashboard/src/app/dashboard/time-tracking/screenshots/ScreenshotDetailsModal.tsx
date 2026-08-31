"use client";

import Image from "next/image";
import { PiImage } from "react-icons/pi";
import { LiaExternalLinkAltSolid } from "react-icons/lia";
import { HiArrowUturnRight } from "react-icons/hi2";
import { HiOutlineCalendar } from "react-icons/hi";
import { HiOutlineLightningBolt } from "react-icons/hi";
import { GoCpu } from "react-icons/go";
import { MdOutlineSubtitles } from "react-icons/md";
import { X, ChevronLeft, Clock, ChevronRight } from 'lucide-react';
import { useEffect, useState } from "react";

type Props = {
    screenshot: any;
    currentIndex: number;
    total: number;
    onPrevious?: () => void;
    onNext?: () => void;
    onClose: () => void;
};

export default function ScreenshotDetailsModal({
    screenshot,
    currentIndex = 0,
    total = 1,
    onPrevious = () => { },
    onNext = () => { },
    onClose,
}: Props) {

    const [zoomed, setZoomed] = useState(false);
    const [position, setPosition] = useState({
        x: 50,
        y: 50,
    });

    const handleMouseMove = (
        e: React.MouseEvent<HTMLDivElement>
    ) => {
        const { left, top, width, height } =
            e.currentTarget.getBoundingClientRect();

        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;

        setPosition({ x, y });
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft" && currentIndex > 0) {
                onPrevious();
            }

            if (e.key === "ArrowRight" && currentIndex < total - 1) {
                onNext();
            }

            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [currentIndex, total, onPrevious, onNext, onClose]);

    useEffect(() => {
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "auto";
        }
    }, [])

    const getActivityColor = (score: number) => {
        if (score < 40) return "#EF4444";
        if (score < 70) return "#F59E0B";
        return "#22C55E";
    };

    return (
        <>
            <div role="dialog" className="relative z-50">
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                ></div>
                <div
                    onClick={onClose}
                    className="fixed inset-0 z-50 flex items-center justify-center p-2 overflow-y-auto">
                    <div
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                        className="w-full max-w-5xl transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all max-h-[98vh] flex flex-col">
                        <div className="relative bg-gray-50 border-b border-gray-200 px-4 py-2 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <PiImage className="h-5 w-5 mr-2 text-indigo-600" />
                                Screenshot Details
                            </h2>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() =>
                                        window.open(screenshot.imageUrl, "_blank")
                                    }
                                    className="inline-flex items-center px-2 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors" title="Open in new tab">
                                    <LiaExternalLinkAltSolid className="w-4 h-4 mr-1.5" />
                                    Open in new tab
                                </button>

                                <button
                                    onClick={onClose}
                                    className="inline-flex items-center px-2 py-1 border border-transparent text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors" title="Close">
                                    <X className="w-4 h-4 mr-1.5" />
                                    Close
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row">
                            <div className="md:w-2/3 flex flex-col">
                                <div className="relative bg-gray-100 border-b md:border-b-0 md:border-r border-gray-200 overflow-hidden">
                                    <div
                                        className="overflow-hidden cursor-zoom-in max-h-[85vh]"
                                        onMouseEnter={() => setZoomed(true)}
                                        onMouseLeave={() => setZoomed(false)}
                                        onMouseMove={handleMouseMove}
                                    >
                                        <Image
                                            src={screenshot.imageUrl}
                                            alt="Screenshot"
                                            width={1200}
                                            height={800}
                                            unoptimized
                                            className="w-full h-auto object-contain transition-transform duration-75"
                                            style={{
                                                transformOrigin: `${position.x}% ${position.y}%`,
                                                transform: zoomed ? "scale(2)" : "scale(1)",
                                            }}
                                        />
                                    </div>
                                </div>

                                {total > 1 && (
                                    <div className="flex justify-center items-center py-1.5 bg-gray-50 border-b border-gray-200">
                                        <div className="flex items-center space-x-4">

                                            {currentIndex > 0 && (
                                                <button
                                                    onClick={onPrevious}
                                                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    <ChevronLeft className="w-5 h-5 mr-2" />
                                                    Previous
                                                </button>
                                            )}

                                            <div className="text-xs text-gray-500 flex items-center">
                                                <HiArrowUturnRight className="w-4 h-4 mr-1 text-indigo-500" />
                                                Use arrow keys to navigate
                                            </div>

                                            {currentIndex < total - 1 && (
                                                <button
                                                    onClick={onNext}
                                                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    Next
                                                    <ChevronRight className="w-5 h-5 ml-2" />
                                                </button>
                                            )}

                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="md:w-1/3 p-3 bg-white overflow-y-auto">
                                <div className="mb-3 pb-2 border-b border-gray-200">
                                    <div className="flex items-center mb-1">
                                        <HiOutlineCalendar className="h-4 w-4 text-gray-500 mr-1.5" />
                                        <h3 className="text-base font-semibold text-gray-900">
                                            {new Date(
                                                screenshot.capturedAt
                                            ).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </h3>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 text-gray-500 mr-1.5" />
                                        <p className="text-sm text-gray-600">
                                            {new Date(
                                                screenshot.capturedAt
                                            ).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-3 pb-2 border-b border-gray-200">
                                    <div className="flex items-center mb-2">
                                        <HiOutlineLightningBolt className="h-4 w-4 mr-1.5 text-green-600"
                                            style={{
                                                color: getActivityColor(
                                                    screenshot.activityScore || 0
                                                ),
                                            }}
                                        />
                                        <div
                                            className="text-sm font-medium"
                                            style={{
                                                color: getActivityColor(
                                                    screenshot.activityScore || 0
                                                ),
                                            }}
                                        >
                                            Activity Level:
                                            <span className="font-bold">
                                                {" "}
                                                {screenshot.activityScore || 0}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner cursor-pointer">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${screenshot.activityScore || 0}%`,
                                                    backgroundColor: getActivityColor(
                                                        screenshot.activityScore || 0
                                                    ),
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="text-xs text-gray-500 mt-1">
                                        {screenshot.activityScore < 40
                                            ? "Low activity level"
                                            : screenshot.activityScore < 70
                                                ? "Medium activity level"
                                                : "High activity level"}
                                    </div>
                                </div>
                                <div className="mb-3 pb-2 border-b border-gray-200">
                                    <div className="flex items-center mb-2">
                                        <GoCpu className="h-4 w-4 text-indigo-500 mr-1.5" />
                                        <h3 className="text-sm font-semibold text-gray-900">Application Used</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center p-2 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-2" style={{ backgroundColor: "rgba(79, 70, 229, 0.125)" }}>
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "rgb(79, 70, 229)" }}></div>
                                            </div>

                                            <div className="flex-grow min-w-0">
                                                <span className="text-xs font-medium text-gray-800 truncate block">
                                                    {screenshot.appName || "Unknown App"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Window Title */}
                                <div className="mb-3 pb-2 border-b border-gray-200">
                                    <div className="flex items-center mb-2">
                                        <MdOutlineSubtitles className="h-4 w-4 text-indigo-500 mr-1.5" />
                                        <h3 className="text-sm font-semibold text-gray-900 mb-2">
                                            Window Title
                                        </h3>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center p-2 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-2" style={{ backgroundColor: "rgba(79, 70, 229, 0.125)" }}>
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "rgb(79, 70, 229)" }}></div>
                                            </div>
                                            <p className="text-xs text-gray-600 break-words">
                                                {screenshot.windowTitle || "No title"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
}