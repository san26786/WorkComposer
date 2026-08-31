import type { ReactNode } from "react";

type Props = {
    title: string;
    children: ReactNode;
    configure?: boolean;
    onConfigure?: () => void;
};

export default function GroupRow({
    title,
    children,
    configure = false,
    onConfigure,
}: Props) {
    return (
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[280px_1fr_180px]">

            {/* Left */}
            <div>
                <h4 className="text-base font-medium text-gray-900">
                    {title}
                </h4>
            </div>

            {/* Middle */}
            <div className="flex items-center">
                {children}
            </div>

            {/* Right */}
            <div className="flex justify-start lg:justify-end">
                {configure && (
                    <button
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