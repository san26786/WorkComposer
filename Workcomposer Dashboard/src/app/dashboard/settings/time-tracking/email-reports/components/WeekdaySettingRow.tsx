type Props = {
    value: number[];
    onToggle: (updated: number[]) => void;
    disabled?: boolean;
};

const weekDays = [
    { label: "Mon", value: 0 },
    { label: "Tue", value: 1 },
    { label: "Wed", value: 2 },
    { label: "Thu", value: 3 },
    { label: "Fri", value: 4 },
    { label: "Sat", value: 5 },
    { label: "Sun", value: 6 },
];

export default function WeekdaySettingRow({
    value,
    onToggle,
    disabled,
}: Props) {
    return (
        <div className="flex flex-wrap gap-2">
            {weekDays.map((day) => {
                const normalized = value.map(Number);

const active = normalized.includes(day.value);

                return (
                    <button
                        key={day.value}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                            if (disabled) return;

                           const updated = normalized.includes(day.value)
    ? normalized.filter((d) => d !== day.value)
    : [...normalized, day.value].sort((a, b) => a - b);

onToggle(updated);
                        }}
                        className={`rounded-md px-1.5 py-1 text-sm font-medium transition ${active
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        {day.label}
                    </button>
                );
            })}
        </div>
    );
}