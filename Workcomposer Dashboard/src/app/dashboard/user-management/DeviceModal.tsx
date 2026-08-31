"use client";

import API from "@/api";
import { CiDesktop } from "react-icons/ci";
import { TbLogout } from "react-icons/tb";
import { X } from 'lucide-react';
import { useEffect, useState } from "react";

interface DeviceModalProps {
    user: any;
    setShowDeviceModal: React.Dispatch<React.SetStateAction<boolean>
    >;
}


const DeviceModal = ({
    user,
    setShowDeviceModal,
}: DeviceModalProps) => {

    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const formatLocalDateTime = (value: string | Date) => {
    if (!value) return "-";

    return new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
};

    useEffect(() => {
        const fetchDevices = async () => {

            try {
                const res = await API.get(`/users/${user._id || user.id}/devices`);

               setDevices(res.data.devices || []);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDevices();
        }
    }, [user])

    const handleLogoutDevice = async (deviceId: string) => {
        try {
            if (!deviceId) {
                console.error("Device ID is missing");
                return;
            }

            const userId = user._id || user.id;

            await API.post(
                `/users/${userId}/devices/${deviceId}/logout`
            );

            // Remove the signed-out device from the displayed list
            setDevices((prev) =>
                prev.filter(
                    (device) => device.deviceId !== deviceId
                )
            );

        } catch (err: any) {
            console.error(
                "DEVICE LOGOUT ERROR:",
                err.response?.data || err
            );
        }
    };
    return (
        <>
            <div role='dialog' className='relative z-50'>
                <div
                    onClick={() =>
                        setShowDeviceModal(false)
                    }
                    className='fixed inset-0 bg-gray-500/75 transition-opacity'></div>
                <div className='fixed inset-0 z-50 overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4 text-center sm:p-6'>
                        <div className='w-full max-w-3xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all'>
                            <div className="flex items-center justify-between">
                                <h2 className='text-lg font-semibold leading-6 text-gray-900'> Device - {user?.email}</h2>

                                <button
                                    onClick={() =>
                                        setShowDeviceModal(false)
                                    }
                                    className='text-gray-400 hover:text-gray-600'
                                >
                                    <X className='h-5 w-5' />
                                </button>
                            </div>
                            <div className='mt-4 space-y-4'>
                                {loading ? (

                                    <p className="text-sm text-gray-500">
                                        Loading devices...
                                    </p>

                                ) : devices.length === 0 ? (

                                    <p className="text-sm text-gray-500">
                                        No devices found
                                    </p>

                                ) : (

                                    devices.map((device: any) => (
                                        <div
                                            key={device.deviceId}
                                            className='rounded-md border border-gray-200 p-4 shadow-sm'>
                                            <div className='flex justify-between items-center mb-3'>
                                                <div className='text-sm font-medium text-gray-800 flex items-center gap-2'>
                                                    <CiDesktop className="h-5 w-5 text-indigo-500" />
                                                    {device.ip} | {device.location}
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        handleLogoutDevice(device.deviceId)
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-md border border-red-600 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                                                    <TbLogout className="h-5 w-5" />
                                                    Sign out now
                                                </button>
                                            </div>

                                            <p className="text-sm text-gray-600">
                                                <b>Hostname:</b>{" "}
                                                {device.hostname} |
                                                <b className="ml-2">Platform:</b>{" "}
                                                {device.platform} |
                                                <b className="ml-2">App Version:</b> {" "}
                                                {device.appVersion}
                                            </p>

                                            <p className="text-sm text-gray-600 mt-2">
                                                <b>Login Time:</b>{" "}
                                                {formatLocalDateTime(device.loginTime)} |
                                                <b className="ml-2">Last Sync:</b>{" "}
                                               {formatLocalDateTime(device.lastSync)}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DeviceModal
