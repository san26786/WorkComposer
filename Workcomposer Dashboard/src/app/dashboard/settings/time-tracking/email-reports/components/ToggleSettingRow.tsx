type Props = {
    checked: boolean;
    onChange: (value: boolean) => void;
};

export default function ToggleSettingRow({
    checked,
    onChange,
}: Props) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={`relative h-8 w-14 rounded-full transition ${checked
                    ? "bg-indigo-600"
                    : "bg-gray-300"
                }`}
        >
            <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${checked
                        ? "left-7"
                        : "left-1"
                    }`}
            />
        </button>
    );
}