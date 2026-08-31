type Props = {
    title: string;
    description?: string;
    checked: boolean;
    onToggle: () => void;
    showConfigure?: boolean;
    onConfigure?: () => void;
};

export default function ToggleRow({
    title,
    description,
    checked,
    onToggle,
    showConfigure = false,
    onConfigure,
}: Props) {
    return (
        <div className="border-b border-gray-200 px-6 py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                        {title}
                    </h3>

                    {description && (
                        <p className="mt-1 text-sm text-gray-500">
                            {description}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-8">

                    {showConfigure && (
                        <button
                            onClick={onConfigure}
                            className="text-sm font-medium text-indigo-600 hover:underline"
                        >
                            Configure per user
                        </button>
                    )}

                    <div className="flex items-center gap-3">

                        <button
                            onClick={onToggle}
                            className={`relative h-7 w-14 rounded-full transition ${checked
                                ? "bg-indigo-600"
                                : "bg-gray-300"
                                }`}
                        >
                            <span
                                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${checked
                                    ? "left-8"
                                    : "left-1"
                                    }`}
                            />
                        </button>

                        <span
                            className={`text-sm font-medium ${checked
                                ? "text-indigo-600"
                                : "text-gray-500"
                                }`}
                        >
                            {checked ? "On" : "Off"}
                        </span>

                    </div>

                </div>

            </div>
        </div>
    );
}