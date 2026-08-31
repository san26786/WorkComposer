type Props = {
    hours: number;
    minutes: number;
    onHoursChange: (value: number) => void;
    onMinutesChange: (value: number) => void;
};

export default function TimeSettingRow({
    hours,
    minutes,
    onHoursChange,
    onMinutesChange,
}: Props) {
    return (
        <div className="flex items-end gap-6">

            <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                    Hours
                </label>

                <input
                    type="number"
                    min={0}
                    max={23}
                    value={hours}
                    onChange={(e) =>
                        onHoursChange(Number(e.target.value))
                    }
                    className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                    Minutes
                </label>

                <input
                    type="number"
                    min={0}
                    max={59}
                    value={minutes}
                    onChange={(e) =>
                        onMinutesChange(Number(e.target.value))
                    }
                    className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
            </div>

        </div>
    );
}