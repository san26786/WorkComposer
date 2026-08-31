type Props = {
    value: number | "";
    min?: number;
    max?: number;
    width?: string;
    onChange: (value: number) => void;
};

export default function NumberSettingRow({
    value,
    min,
    max,
    width = "w-20",
    onChange,
}: Props) {
    return (
        <input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className={`${width} rounded-md border border-gray-300 px-2 py-1 text-sm`}
        />
    );
}