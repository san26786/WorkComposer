type Props = {
    icon: React.ReactNode;
    title: string;
    description: string;
    connected?: boolean;
    selected?: boolean;
    onClick?: () => void;
};

export default function IntegrationCard({
    icon,
    title,
    description,
    connected = false,
    selected = false,
    onClick,
}: Props) {
    return (
        <div
            onClick={onClick}
            className={`cursor-pointer rounded-3xl border bg-white p-6 shadow-sm transition-all hover:shadow-md ${selected
                    ? "border-blue-500"
                    : "border-gray-200"
                }`}
        >
            <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-white">
                        {icon}
                    </div>

                    <div>

                        <div className="flex items-center gap-3">

                            <h3 className="text-xl font-semibold text-gray-900">
                                {title}
                            </h3>

                            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-500">
                                {connected ? "Connected" : "Not connected"}
                            </span>

                        </div>

                        <p className="mt-2 text-gray-500">
                            {description}
                        </p>

                    </div>

                </div>

                <span className="text-3xl text-gray-400">
                    ›
                </span>

            </div>
        </div>
    );
}