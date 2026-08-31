import type { ReactNode } from "react";

type Props = {
    title: string;
    description?: string;
    children: ReactNode;
    border?: boolean;
    showConfigure?: boolean;
    onConfigure?: () => void;
};

export default function SettingRow({
    title,
    description,
    children,
    border = true,
    showConfigure = false,
    onConfigure,
}: Props) {
    return (
        <div
            className={`flex items-center justify-between px-12 py-6 ${border ? "border-b border-gray-200" : ""
                }`}
        >
            {/* Left */}
            <div className="flex-1 pr-12">
                <h3 className="text-md font-medium text-gray-900">
                    {title}
                </h3>

                {description && (
                    <p className="mt-2 text-sm text-gray-500">
                        {description}
                    </p>
                )}
            </div>

            {/* Right */}
            <div className="flex w-[520px] items-center justify-between">
                <div className="flex w-[240px] items-center">
                    {children}
                </div>

                {showConfigure && (
                    <button
                        type="button"
                        onClick={onConfigure}
                        className="text-sm font-medium text-indigo-600 hover:underline"
                    >
                        Configure per user
                    </button>
                )}
            </div>
        </div>
    );
}