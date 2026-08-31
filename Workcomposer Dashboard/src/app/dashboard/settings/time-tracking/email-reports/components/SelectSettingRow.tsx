type Props = {
    value: string | number;
    options: {
        label: string;
        value: string | number;
    }[];
    onChange: (value: string | number) => void;
};

import CustomSelect from "@/app/dashboard/settings/time-tracking/tracking/components/CustomSelect";

export default function SelectSettingRow({
    value,
    options,
    onChange,
}: Props) {
    return (
        <CustomSelect
            width="w-24"
            value={value}
            options={options}
            onChange={onChange}
        />
    );
}