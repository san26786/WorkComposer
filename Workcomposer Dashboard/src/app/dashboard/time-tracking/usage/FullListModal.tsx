"use client";

import { useEffect, useRef } from "react";
import { HiMiniCommandLine } from "react-icons/hi2";
import { X, Monitor } from "lucide-react";

type Props = {
    open: boolean;
    onClose: () => void;
    user: any;
};

export default function FullListModal({
    open,
    onClose,
    user,
}: Props) {

    const modalRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {

        if (!open) return;

        const handleClickOutside = (e: MouseEvent) => {

            if (
                modalRef.current &&
                !modalRef.current.contains(e.target as Node)
            ) {
                onClose();
            }

        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

    }, [open, onClose]);

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours === 0 && minutes === 0) {
            return "<1m";
        }

        return `${hours}h ${minutes}m`;
    };

    useEffect(() => {

        if (!open) return;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "auto";
        };

    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">

            <div
                ref={modalRef}
                className="
  bg-white
  w-[95%]
  max-w-6xl
  max-h-[90vh]
  rounded-xl
  shadow-xl
  flex
  flex-col
"
            >

                <div className="flex items-center justify-between p-6 border-b border-gray-200">

                    <h2 className="flex items-center text-lg font-semibold text-gray-800">
                        <HiMiniCommandLine className="h-7 w-7 text-blue-600 mr-4" />
                        All apps used by {user?.name}
                    </h2>

                    <button
                        onClick={onClose}
                        className="
    rounded-full
    p-2.5
    text-gray-400
    hover:bg-gray-100
    hover:text-gray-600
    transition-all
    duration-200
    border
    border-blue-200
  "
                    >
                        <X className="h-6 w-6" />
                    </button>

                </div>

                <div className="p-6 overflow-y-auto flex-1">

                    {user?.apps?.length === 0 ? (

                        <div className="text-center py-16 text-gray-500">
                            No apps found
                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="sticky top-0 bg-gray-50 z-10">

                                    <tr className="border-b border-gray-300 bg-gray-50">

                                        <th className="text-left px-6 py-4 text-xs text-gray-600 font-medium">
                                            APP
                                        </th>

                                        <th className="text-right px-6 py-4 text-xs text-gray-600 font-medium">
                                            DURATION
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {user.apps.map((app: any, index: number) => (

                                        <tr
                                            key={index}
                                            className="border-b border-gray-200 hover:bg-gray-50"
                                        >

                                            <td className="px-6 py-5">

                                                <div className="flex items-center gap-3">

                                                    <Monitor className="h-6 w-6 text-gray-800" />

                                                    <span className="font-medium text-sm text-gray-800">
                                                        {app.name}
                                                    </span>

                                                </div>

                                            </td>

                                            <td className="px-6 py-5 text-right text-sm font-semibold text-gray-700">
                                                {formatDuration(app.duration)}
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}