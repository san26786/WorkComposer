"use client";

import TrackingHeader from "../tracking/components/TrackingHeader";
import SettingRow from "../tracking/components/SettingRow";
import ToggleRow from "../tracking/components/ToggleRow";
import CustomSelect from "../tracking/components/CustomSelect";
import useManualTimeSettings from "./hooks/useManualTimeSettings";

type Option = {
    label: string;
    value: string | number;
};

export default function ManualTimePage() {
    const {
        loading,
        settings,
        updateSettings,
    } = useManualTimeSettings();


    if (loading || !settings) {
        return <div>Loading...</div>;
    }

    const backdatingOptions: Option[] = Array.from(
        { length: 366 },
        (_, index) => ({
            label: `${index + 1} ${index === 0 ? "Day" : "Days"}`,
            value: index + 1,
        })
    );

    return (
        <div className="py-10 flex-1">
            <div className="mx-auto w-full max-w-[1700px] px-6 sm:px-8 lg:px-10">
                <div className="mx-auto mt-8 w-full max-w-6xl rounded-xl border border-gray-200 bg-white shadow-sm">

                    <TrackingHeader
                        title="Manual Time"
                        description="Configure manual time entry settings for your organization."
                    />

                    {/* Allow Manual Time */}

                    <SettingRow
                        title="Allow users to submit manual time entries"
                    >
                        <ToggleRow
                            checked={settings.allowManualTime}
                            onChange={(checked) =>
                                updateSettings({
                                    ...settings,
                                    allowManualTime: checked,
                                })
                            }
                        />
                    </SettingRow>

                    {/* Require Approval */}

                    <SettingRow
                        title="Require approval for manual time entries"
                    >
                        <ToggleRow
                            checked={settings.requireApproval}
                            onChange={(checked) =>
                                updateSettings({
                                    ...settings,
                                    requireApproval: checked,
                                })
                            }
                        />
                    </SettingRow>

                    {/* Manager Approval */}

                    <SettingRow
                        title="Managers can approve manual time requests for their users"
                    >
                        <ToggleRow
                            checked={settings.managerApproval}
                            onChange={(checked) =>
                                updateSettings({
                                    ...settings,
                                    managerApproval: checked,
                                })
                            }
                        />
                    </SettingRow>

                    {/* Backdating */}

                    <SettingRow
                        title="Time entry backdating limit"
                    >
                        <div className="flex flex-col">
                            <label className="mb-2 text-sm font-medium">
                                Days
                            </label>

                            <CustomSelect
                                width="w-40"
                                value={settings.backdatingLimit}
                                options={backdatingOptions}
                                onChange={(value) =>
                                    updateSettings({
                                        ...settings,
                                        backdatingLimit: Number(value),
                                    })
                                }
                            />
                        </div>
                    </SettingRow>

                    {/* Require Project */}

                    <SettingRow
                        title="Require project/task for manual time entries"
                    >
                        <ToggleRow
                            checked={settings.requireProjectTask}
                            onChange={(checked) =>
                                updateSettings({
                                    ...settings,
                                    requireProjectTask: checked,
                                })
                            }
                        />
                    </SettingRow>

                </div>
            </div>
        </div>
    );
}