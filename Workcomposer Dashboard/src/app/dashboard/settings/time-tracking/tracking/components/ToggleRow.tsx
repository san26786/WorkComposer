"use client";

type Props = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
};

export default function ToggleRow({
    checked,
    onChange,
    disabled = false,
}: Props) {
    return (
        <div className="flex items-center gap-4">
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={`relative flex h-7 w-14 items-center rounded-full transition-colors duration-200 ${checked ? "bg-[#4F46E5]" : "bg-gray-200"
                    }`}
            >
                <span
                    className={`absolute h-6 w-6 rounded-full bg-white shadow-md transition-all duration-200 ${checked ? "left-7" : "left-0.5"
                        }`}
                />
            </button>

            <span
                className={`min-w-[28px] text-base font-medium ${checked
                        ? "text-[#4F46E5]"
                        : "text-gray-500"
                    }`}
            >
                {checked ? "On" : "Off"}
            </span>
        </div>
    );
}