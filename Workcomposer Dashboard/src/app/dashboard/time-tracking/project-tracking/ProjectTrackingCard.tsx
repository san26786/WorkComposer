"use client"

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react';
import { HiFolder } from "react-icons/hi2";
import ViewTaskModal from "./ViewTaskModal";
import API from "@/api";
import ReportsModal from '../attendance/reports/ReportsModal';

type ProjectTrackingCardProps = {
    trackingData: any[];
    reportRange: any;
};

const ProjectTrackingCard = ({
    trackingData,
    reportRange,
}: ProjectTrackingCardProps) => {

    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [showReportsModal, setShowReportsModal] = useState(false);
    const [reportType, setReportType] = useState<"user" | "project" | null>(null);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours === 0 && minutes === 0) {
            return "< 1m";
        }

        return `${hours}h ${minutes}m`;
    };

    const handleExportUserReport = async () => {
        try {
            await API.post("/reports/project-user", {
                startDate: reportRange?.startDate,
                endDate: reportRange?.endDate,
                selectedUsers: reportRange?.selectedUsers || [],
                selectedTeams: reportRange?.selectedTeams || [],
            });
        } catch (error) {
            console.error("Failed to generate user report:", error);
        }
    };

    const handleExportProjectReport = async () => {
        try {
            await API.post("/reports/project", {
                startDate: reportRange?.startDate,
                endDate: reportRange?.endDate,
                selectedUsers: reportRange?.selectedUsers || [],
                selectedTeams: reportRange?.selectedTeams || [],
            });
        } catch (error) {
            console.error("Failed to generate project report:", error);
        }
    };

    const handleGenerateReport = async () => {
        if (reportType === "user") {
            await handleExportUserReport();
            return;
        }

        if (reportType === "project") {
            await handleExportProjectReport();
        }
    };

    return (
        <>
            <div className='min-h-[calc(100vh-250px)] rounded-b-lg bg-white shadow-sm border-l border-r border-b border-gray-200'>
                <div className='divide-y divide-gray-200 overflow-hidden bg-white'>
                    <div className='px-3 py-2 sm:px-5 bg-white shadow-sm border-b border-gray-200'>
                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                            <h2 className='text-lg font-bold text-gray-800'>Task Report</h2>
                            <div className='flex items-center gap-2'>
                                <button
                                    onClick={() => {
                                        setReportType("user");
                                        setShowReportsModal(true);
                                    }}
                                    className='inline-flex cursor-pointer items-center font-semibold px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none transition border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                                >
                                    <Download className='w-5 h-5 mr-2' />
                                    Export User Report
                                </button>
                                <button
                                    onClick={() => {
                                        setReportType("project");
                                        setShowReportsModal(true);
                                    }}
                                    className='inline-flex cursor-pointer items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none transition bg-indigo-600 text-white hover:bg-indigo-700'>
                                    <Download className='w-5 h-5 mr-2' />
                                    Export Project Report
                                </button>
                            </div>
                        </div>
                    </div>


                    {selectedProject ? (
                        <ViewTaskModal
                            project={selectedProject}
                            reportRange={reportRange}
                            onBack={() => setSelectedProject(null)}
                        />
                    ) : (

                        <div className='px-6 py-6 sm:px-8'>
                            <div className='divide-y divide-gray-200 overflow-hidden bg-white'>
                                <div className='px-3 py-2 sm:px-5 bg-white shadow-sm border-b border-gray-200'>
                                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                                        <h2 className='text-lg font-bold text-gray-800'>Projects</h2>
                                    </div>
                                </div>

                                <div className='px-2 py-4 sm:px-4'>
                                    <table className='min-w-full divide-y divide-gray-200'>
                                        <thead className='bg-white'>
                                            <tr>
                                                <th scope='col' className='py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6'>Project name</th>
                                                <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>Users</th>
                                                <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>Duration</th>
                                                <th scope='col' className='px-3 py-3.5 text-right text-sm font-semibold text-gray-900 pr-6'>Action</th>
                                            </tr>
                                        </thead>

                                        <tbody className='divide-y divide-gray-200 bg-white'>

                                            {trackingData.map((project: any) => (
                                                <tr
                                                    key={project._id}
                                                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                                >
                                                    <td className="py-4 pr-3 pl-6 text-sm font-medium whitespace-nowrap text-gray-900">
                                                        <div className="flex items-center gap-2">
                                                            <HiFolder className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                                                            <span className="truncate max-w-xs">
                                                                {project.name}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-3 py-4">
                                                        <div className="flex items-center gap-2 flex-wrap">

                                                            {project.users.length > 0 ? (
                                                                project.users.map((user: any) => (
                                                                    <span
                                                                        key={user._id}
                                                                        className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium"
                                                                    >
                                                                        {user.firstName} {user.lastName}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-sm text-gray-400">
                                                                    No users
                                                                </span>
                                                            )}

                                                        </div>
                                                    </td>

                                                    <td className="px-3 py-4 text-sm whitespace-nowrap">
                                                        <span className="font-medium text-gray-900">
                                                            {formatTime(project.totalSeconds)}
                                                        </span>
                                                    </td>

                                                    <td className="px-3 py-4 text-sm whitespace-nowrap text-right pr-6">
                                                        <button
                                                            onClick={() => setSelectedProject(project)}
                                                            className="inline-flex items-center px-3 py-1.5 border border-indigo-500 text-indigo-600 bg-white hover:bg-indigo-50 rounded-md cursor-pointer font-medium text-sm transition-colors duration-150 shadow-sm"
                                                        >
                                                            <span>View Tasks</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ReportsModal
                open={showReportsModal}
                onClose={() => {
                    setShowReportsModal(false);
                    setReportType(null);
                }}
                autoGenerate={true}
                onGenerate={handleGenerateReport}
            />
        </>
    )
}

export default ProjectTrackingCard
