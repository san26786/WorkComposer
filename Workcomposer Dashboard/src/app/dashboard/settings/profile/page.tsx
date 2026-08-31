"use client"

import { ChevronsUpDown, Check } from 'lucide-react';
import { MdRemoveRedEye } from "react-icons/md";
import { MdCheckBoxOutlineBlank } from "react-icons/md";
import { useEffect, useMemo, useRef, useState } from "react";
import API from "@/api";
import toast from "react-hot-toast";
import { useDashboard } from "@/context/DashboardContext";
import SettingsLoading from '@/components/settings/SettingsLoading';

export default function ProfilePage() {

    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        avatar: "",
    });

    const [passwordData, setPasswordData] = useState({
        newPassword: "",
        confirmPassword: "",
        signOutAllDevices: false,
    });

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    type Team = {
        _id: string;
        name: string;
    };

    const [teams, setTeams] = useState<Team[]>([]);

    const [loading, setLoading] = useState(true);

    const [preferences, setPreferences] = useState({
        weeklyReport: true,
        dailyReport: false,
        reportTeam: null as string | null,
        reportTimezone: "Browser timezone",
    });

    const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
    const teamDropdownRef = useRef<HTMLDivElement>(null);

    const [timezoneDropdownOpen, setTimezoneDropdownOpen] = useState(false);
    const timezoneDropdownRef = useRef<HTMLDivElement>(null);
    const [timezoneSearch, setTimezoneSearch] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const { refreshUser } = useDashboard();

    const browserTimezone = useMemo(
        () => Intl.DateTimeFormat().resolvedOptions().timeZone,
        []
    );

    const timezones = useMemo(
        () =>
            Intl.supportedValuesOf("timeZone").filter(
                (tz) => tz !== "Asia/Calcutta"
            ),
        []
    );

    const filteredTimezones = useMemo(() => {
        return timezones.filter((timezone) =>
            timezone
                .toLowerCase()
                .replaceAll("_", " ")
                .includes(
                    timezoneSearch
                        .toLowerCase()
                        .replaceAll("_", " ")
                )
        );
    }, [timezoneSearch, timezones]);

    const timezoneDisplay =
        preferences.reportTimezone === browserTimezone
            ? `Browser timezone (${browserTimezone})`
            : preferences.reportTimezone;

    useEffect(() => {
        setPreferences((prev) => ({
            ...prev,
            reportTimezone:
                prev.reportTimezone === "Browser timezone"
                    ? browserTimezone
                    : prev.reportTimezone,
        }));
    }, [browserTimezone]);

    const fetchProfile = async () => {
        try {
            const { data } = await API.get("/auth/me");

            setProfile({
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                email: data.email || "",
                avatar: data.avatar || "",
            });

            setPreferences({
                weeklyReport: data.weeklyReport ?? true,
                dailyReport: data.dailyReport ?? false,
                reportTeam: data.reportTeam?._id || null,
                reportTimezone: data.reportTimezone || browserTimezone,
            });

        } catch (err: any) {
            console.error("PROFILE FETCH ERROR:", err);

            toast.error(
                err.response?.data?.message ||
                "Failed to load your profile."
            );
        }
    };

    const fetchTeams = async () => {
        try {
            const { data } = await API.get("/teams");

            setTeams(data);

        } catch (err: any) {
            console.error("TEAMS FETCH ERROR:", err);

            toast.error(
                err.response?.data?.message ||
                "Failed to load teams."
            );
        }
    };

    useEffect(() => {
        (async () => {
            setLoading(true);

            await Promise.all([fetchProfile(), fetchTeams()]);

            setLoading(false);
        })();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { data } = await API.put("/settings/profile", {
                firstName: profile.firstName,
                lastName: profile.lastName,
            });

            if (avatarFile) {
                const formData = new FormData();

                formData.append("avatar", avatarFile);

                const { data: avatarData } = await API.post(
                    "/settings/avatar",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                if (profile.avatar.startsWith("blob:")) {
                    URL.revokeObjectURL(profile.avatar);
                }

                setAvatarFile(null);
            }

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            await Promise.all([
                fetchProfile(),
                refreshUser(),
            ]);

            toast.success("Profile updated successfully");
        } catch (err: any) {
            console.error("PROFILE UPDATE ERROR:", err);

            toast.error(
                err.response?.data?.message ||
                "Failed to update profile."
            );
        }
    };

    const handlePasswordChange = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        try {
            await API.put("/settings/change-password", passwordData);

            toast.success("Password changed successfully");

            setPasswordData({
                newPassword: "",
                confirmPassword: "",
                signOutAllDevices: false,
            });

        } catch (err: any) {
            toast.error(
                err.response?.data?.message ||
                "Failed to change password"
            );
        }
    };

    const handleSavePreferences = async () => {
        try {
            const { data } = await API.put("/settings/preferences", {
                weeklyReport: preferences.weeklyReport,
                dailyReport: preferences.dailyReport,
                reportTeam: preferences.reportTeam,
                reportTimezone: preferences.reportTimezone,
            });

            setPreferences({
                weeklyReport: data.weeklyReport,
                dailyReport: data.dailyReport,
                reportTeam: data.reportTeam?._id || null,
                reportTimezone: data.reportTimezone,
            });

            toast.success("Preferences updated successfully");
        } catch (err: any) {
            toast.error(
                err.response?.data?.message ||
                "Failed to update preferences"
            );
        }
    };

    const handleAvatarChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (profile.avatar.startsWith("blob:")) {
            URL.revokeObjectURL(profile.avatar);
        }

        const previewUrl = URL.createObjectURL(file);

        setAvatarFile(file);

        setProfile((prev) => ({
            ...prev,
            avatar: previewUrl,
        }));
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                teamDropdownRef.current &&
                !teamDropdownRef.current.contains(e.target as Node)
            ) {
                setTeamDropdownOpen(false);
            }

            if (
                timezoneDropdownRef.current &&
                !timezoneDropdownRef.current.contains(e.target as Node)
            ) {
                setTimezoneDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
    }, []);

    const selectedTeam = teams.find(
        (team) => team._id === preferences.reportTeam
    );

    if (loading) {
        return (
            <div className="py-10 flex-1">
                <div className="mx-auto w-full max-w-[1700px] px-4 sm:px-6 lg:px-8">
                    <SettingsLoading />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="py-10 flex-1">
                <div className="mx-auto w-full max-w-[1700px] px-4 sm:px-6 lg:px-8">
                    <div className="my-2 min-h-[calc(100vh-250px)] rounded-lg bg-white shadow-sm px-2 py-4 sm:px-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">User Profile</h3>
                            <div className="text-center mb-6">
                                <img
                                    onClick={() => fileInputRef.current?.click()}
                                    src={profile.avatar || "/default-avatar.png"}
                                    alt="Profile Picture"
                                    className="w-14 h-14 rounded-full mx-auto cursor-pointer object-cover"
                                />

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </div>

                            <form
                                onSubmit={handleSave}
                                className="space-y-4 max-w-xl mx-auto"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-900">First name</label>
                                    <input
                                        type="text"
                                        required
                                        value={profile.firstName}
                                        onChange={(e) =>
                                            setProfile({
                                                ...profile,
                                                firstName: e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600"></input>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900">Last name</label>
                                    <input
                                        type="text"
                                        required
                                        value={profile.lastName}
                                        onChange={(e) =>
                                            setProfile({
                                                ...profile,
                                                lastName: e.target.value,
                                            })
                                        }
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600"></input>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900">Email</label>
                                    <input
                                        type="email"
                                        readOnly
                                        required
                                        value={profile.email}
                                        className="block w-full rounded-md bg-gray-100 px-3 py-1.5 text-base text-gray-500 outline outline-1 outline-gray-300 sm:text-sm"></input>
                                </div>

                                <div className="text-center pt-4">
                                    <button type="submit" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm cursor-pointer font-semibold rounded hover:bg-indigo-500">Save</button>
                                </div>
                            </form>

                            <div className="my-6 border-t border-gray-200"></div>
                            <div className="space-y-6 max-w-xl mx-auto">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900">Receive Weekly Report</span>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPreferences({
                                                    ...preferences,
                                                    weeklyReport: !preferences.weeklyReport,
                                                })
                                            }
                                            className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${preferences.weeklyReport
                                                ? "bg-indigo-600"
                                                : "bg-gray-200"
                                                }`}
                                        >
                                            <span className="sr-only">Toggle setting</span>
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ${preferences.weeklyReport
                                                    ? "translate-x-6"
                                                    : "translate-x-0"
                                                    }`}
                                            />
                                        </button>
                                        <span className={`text-sm font-medium ${preferences.weeklyReport
                                            ? "text-indigo-700"
                                            : "text-gray-500"
                                            }`}>{preferences.weeklyReport ? "On" : "Off"}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900">Receive Daily Report</span>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPreferences({
                                                    ...preferences,
                                                    dailyReport: !preferences.dailyReport,
                                                })
                                            }
                                            className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${preferences.dailyReport
                                                ? "bg-indigo-600"
                                                : "bg-gray-200"
                                                }`}
                                        >
                                            <span className="sr-only">Toggle setting</span>

                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ${preferences.dailyReport
                                                    ? "translate-x-6"
                                                    : "translate-x-0"
                                                    }`}
                                            />
                                        </button>
                                        <span className={`text-sm font-medium ${preferences.dailyReport
                                            ? "text-indigo-700"
                                            : "text-gray-500"
                                            }`}>{preferences.dailyReport ? "On" : "Off"}</span>
                                    </div>
                                </div>

                                <div>
                                    <div>
                                        <label className="block text-sm/6 font-medium text-gray-900 mb-1">Email reports for managing teams</label>
                                        <div
                                            ref={teamDropdownRef}
                                            className="relative mt-2"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
                                                aria-haspopup="listbox"
                                                aria-expanded={teamDropdownOpen}
                                                className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                            >
                                                <span className="col-start-1 row-start-1 truncate pr-6">
                                                    {selectedTeam ? selectedTeam.name : "All Teams"}
                                                </span>
                                                <ChevronsUpDown className='col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4' />
                                            </button>

                                            {teamDropdownOpen && (
                                                <ul
                                                    aria-orientation="vertical"
                                                    role="listbox"
                                                    className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
                                                >
                                                    <li
                                                        role="option"
                                                        aria-selected={preferences.reportTeam === null}
                                                        onClick={() => {
                                                            setPreferences({
                                                                ...preferences,
                                                                reportTeam: null,
                                                            });

                                                            setTeamDropdownOpen(false);
                                                        }}
                                                        className="relative cursor-pointer py-2 pr-9 pl-3 select-none text-gray-900 hover:bg-gray-100"
                                                    >
                                                        <span className="block truncate">All Teams</span>

                                                        {preferences.reportTeam === null && (
                                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                                                                <Check className="h-5 w-5" />
                                                            </span>
                                                        )}
                                                    </li>

                                                    {teams.map((team) => (
                                                        <li
                                                            key={team._id}
                                                            role="option"
                                                            aria-selected={preferences.reportTeam === team._id}
                                                            onClick={() => {
                                                                setPreferences({
                                                                    ...preferences,
                                                                    reportTeam: team._id,
                                                                });

                                                                setTeamDropdownOpen(false);
                                                            }}
                                                            className="relative cursor-pointer py-2 pr-9 pl-3 select-none text-gray-900 hover:bg-gray-100"
                                                        >
                                                            <span
                                                                className={`block truncate ${preferences.reportTeam === team._id
                                                                    ? "font-semibold"
                                                                    : "font-normal"
                                                                    }`}
                                                            >
                                                                {team.name}
                                                            </span>

                                                            {preferences.reportTeam === team._id && (
                                                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                                                                    <Check className="h-5 w-5" />
                                                                </span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div>
                                        <label className='block text-sm/6 font-medium text-gray-900'>Reports timezone</label>
                                        <div
                                            ref={timezoneDropdownRef}
                                            className="relative mt-2"
                                        >
                                            <input
                                                type="text"
                                                value={
                                                    timezoneDropdownOpen
                                                        ? timezoneSearch
                                                        : timezoneDisplay
                                                }
                                                onFocus={() => {
                                                    setTimezoneDropdownOpen(true);
                                                    setTimezoneSearch("");
                                                }}
                                                onChange={(e) => {
                                                    setTimezoneSearch(e.target.value);
                                                    setTimezoneDropdownOpen(true);
                                                }}
                                                placeholder="Select timezone"
                                                className="block w-full rounded-md bg-white py-1.5 pr-12 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setTimezoneDropdownOpen(!timezoneDropdownOpen);

                                                    if (!timezoneDropdownOpen) {
                                                        setTimezoneSearch("");
                                                    }
                                                }}
                                                className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2"
                                            >
                                                <ChevronsUpDown className="size-5 text-gray-400" />
                                            </button>

                                            {timezoneDropdownOpen && (
                                                <ul
                                                    role="listbox"
                                                    className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 sm:text-sm"
                                                >
                                                    {/* Browser Timezone */}
                                                    <li
                                                        role="option"
                                                        aria-selected={preferences.reportTimezone === browserTimezone ? "true" : "false"}
                                                        onClick={() => {
                                                            setPreferences({
                                                                ...preferences,
                                                                reportTimezone: browserTimezone,
                                                            });

                                                            setTimezoneSearch("");
                                                            setTimezoneDropdownOpen(false);
                                                        }}
                                                        className="relative cursor-pointer py-2 pr-9 pl-3 select-none text-gray-900 hover:bg-gray-100"
                                                    >
                                                        <span
                                                            className={`block truncate ${preferences.reportTimezone === browserTimezone
                                                                ? "font-semibold"
                                                                : "font-normal"
                                                                }`}
                                                        >
                                                            Browser timezone ({browserTimezone})
                                                        </span>

                                                        {preferences.reportTimezone === browserTimezone && (
                                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                                                                <Check className="size-5" />
                                                            </span>
                                                        )}
                                                    </li>

                                                    <div className="my-1 border-t border-gray-200" />

                                                    {filteredTimezones.map((timezone) => (
                                                        <li
                                                            key={timezone}
                                                            role="option"
                                                            aria-selected={preferences.reportTimezone === timezone ? "true" : "false"}
                                                            onClick={() => {
                                                                setPreferences({
                                                                    ...preferences,
                                                                    reportTimezone: timezone,
                                                                });

                                                                setTimezoneSearch("");
                                                                setTimezoneDropdownOpen(false);
                                                            }}
                                                            className="relative cursor-pointer py-2 pr-9 pl-3 select-none text-gray-900 hover:bg-gray-100"
                                                        >
                                                            <span
                                                                className={`block truncate ${preferences.reportTimezone === timezone
                                                                    ? "font-semibold"
                                                                    : "font-normal"
                                                                    }`}
                                                            >
                                                                {timezone}
                                                            </span>

                                                            {preferences.reportTimezone === timezone && (
                                                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                                                                    <Check className="size-5" />
                                                                </span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 text-center">
                                        <button
                                            type="button"
                                            onClick={handleSavePreferences}
                                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded hover:bg-indigo-500 cursor-pointer"
                                        >
                                            Save Preferences
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className='my-6 border-t border-gray-200'></div>
                            <div className='max-w-xl mx-auto'>
                                <h4 className='text-base font-semibold text-gray-900 mb-4'>Change account password</h4>

                                <form
                                    onSubmit={handlePasswordChange}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className='block text-sm font-medium text-gray-900 mb-2'>New password</label>
                                        <div className='relative'>
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={passwordData.newPassword}
                                                onChange={(e) =>
                                                    setPasswordData({
                                                        ...passwordData,
                                                        newPassword: e.target.value,
                                                    })
                                                }
                                                required
                                                className='block w-full rounded-md bg-white px-3 py-1.5 pr-10 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600'>
                                            </input>
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600'>
                                                <MdRemoveRedEye className='h-5 w-5' />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-900 mb-2'>Repeat new password</label>
                                        <div className='relative'>
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={passwordData.confirmPassword}
                                                onChange={(e) =>
                                                    setPasswordData({
                                                        ...passwordData,
                                                        confirmPassword: e.target.value,
                                                    })
                                                }
                                                required
                                                className='block w-full rounded-md bg-white px-3 py-1.5 pr-10 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600'></input>
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600'>
                                                <MdRemoveRedEye className='w-5 h-5' />
                                            </button>
                                        </div>
                                    </div>
                                    <div className='flex gap-3'>
                                        <div className='flex h-6 shrink-0 items-center'>
                                            <div className='group grid size-4 grid-cols-1'>
                                                <input
                                                    id="signOutAllDevices"
                                                    type="checkbox"
                                                    checked={passwordData.signOutAllDevices}
                                                    onChange={(e) =>
                                                        setPasswordData({
                                                            ...passwordData,
                                                            signOutAllDevices: e.target.checked,
                                                        })
                                                    }
                                                    className='col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto cursor-pointer'></input>
                                                <Check
                                                    className={`pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center text-white transition-opacity duration-100 ${passwordData.signOutAllDevices ? "opacity-100" : "opacity-0"
                                                        }`}
                                                />
                                            </div>
                                        </div>

                                        <div className='text-sm'>
                                            <label htmlFor="signOutAllDevices" className='font-medium text-gray-900 cursor-pointer'>Sign out from all devices</label>
                                        </div>
                                    </div>
                                    <div className='pt-4 text-center'>
                                        <button type='submit' className='inline-flex items-center cursor-pointer px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded hover:bg-red-500'>
                                            Change Password
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}