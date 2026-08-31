"'use client"

import { useEffect, useState } from "react";
import API from "@/api";
import { useRouter } from "next/navigation";

import { HiMiniUsers } from "react-icons/hi2";

import {
    Plus,
    EllipsisVertical,
    Pencil,
} from "lucide-react";

import { HiOutlineTrash } from "react-icons/hi2";

import CreateTeamModal from "@/app/dashboard/user-management/CreateTeamModal";
import EditTeamModal from "@/app/dashboard/user-management/EditTeamModal";
import DeleteTeamModal from "@/app/dashboard/user-management/DeleteTeamModal";
import useDesktopNavigation from "@/hooks/useDesktopNavigation";
import DesktopModuleHeader from "../common/DesktopModuleHeader";

type UsersSidebarProps = {
    activeTeam?: string;
    setActiveTeam?: React.Dispatch<React.SetStateAction<string>>;
    desktop?: boolean;
};
export default function UsersSidebar({
    activeTeam,
    setActiveTeam,
    desktop = false,
}: UsersSidebarProps) {

    const [openTeamMenu, setOpenTeamMenu] = useState<string | null>(null);

    const [showTeamModal, setShowTeamModal] = useState(false);

    const [teams, setTeams] = useState<any[]>([]);

    const [editingTeam, setEditingTeam] = useState<any>(null);

    const [showEditModal, setShowEditModal] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [selectedTeamForModal, setSelectedTeamForModal] = useState<any>(null);

    const { closeSidebar } = useDesktopNavigation(desktop);

    const router = useRouter();


    const navigate = (team: string, path: string) => {

        closeSidebar();

        if (setActiveTeam) {
            setActiveTeam(team);
            return;
        }

        router.push(path);
    };

    const fetchTeams = async () => {
        try {
            const res = await API.get("/teams");

            setTeams(res.data || []);
        } catch (err) {
            console.error(err);

            setTeams([]);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    useEffect(() => {
        const handleClickOutside = () => {
            setOpenTeamMenu(null);
        };

        window.addEventListener("click", handleClickOutside);

        return () => {
            window.removeEventListener("click", handleClickOutside);
        };
    }, [])

    return (
        <>
            {desktop && (
                <DesktopModuleHeader />
            )}

            <div className="flex items-center justify-between *:mb-3 mt-2 px-6"></div>
            <div className="flex items-center justify-between *:mb-3 mt-2 px-6">
                <h2 className="text-white font-semibold text-lg">Teams</h2>
                <button
                    onClick={() => setShowTeamModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-gray-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 transition shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    <span>Create</span>
                </button>
            </div>
            <div className="flex flex-col flex-1">
                <div className="shrink-0 border-b border-gray-700">
                    <li
                        onClick={() => {
                            navigate(
                                "All Teams",
                                "/dashboard/user-management"
                            );
                        }}
                        className={`flex items-center py-2 cursor-pointer transition-all duration-200 ease-in-out px-3 ${activeTeam === "All Teams"
                            ? "bg-gradient-to-r from-indigo-900/70 to-gray-800 text-white border-l-3 border-indigo-500"
                            : "text-gray-300 hover:bg-gray-800/50"
                            }`}>
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8">
                            <HiMiniUsers className="h-5 w-5 shrink-0 text-indigo-300" />
                        </div>
                        <span className="ml-2 truncate text-sm font-semibold">
                            - All Teams -
                        </span>
                    </li>
                </div>

                <ul className="divide-y divide-gray-700 ">

                    {Array.isArray(teams) &&
                        teams.map((team: any) => (
                            <li
                                key={team._id}
                                onClick={() => {
                                    navigate(
                                        team.name,
                                        `/dashboard/user-management?team=${encodeURIComponent(team.name)}`
                                    );
                                }}
                                className={`relative flex items-center justify-between py-2 cursor-pointer transition-all duration-200 ease-in-out px-3 text-gray-300 hover:bg-gray-800/50 ${activeTeam === team.name ?
                                    "bg-gradient-to-r from-indigo-900/70 to-gray-800 text-white border-l-3 border-indigo-500" : "text-gray-300"
                                    }`}
                            >
                                <div className="flex items-center gap-x-2">
                                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8">
                                        <HiMiniUsers className="h-5 w-5 shrink-0 text-indigo-300" />
                                    </div>

                                    <span className="truncate text-sm font-bold">
                                        {team.name}
                                    </span>
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();

                                            setOpenTeamMenu(
                                                openTeamMenu === team._id ? null : team._id
                                            )
                                        }}
                                        type="button"
                                        title="Team options"
                                        className="cursor-pointer p-1 hover:bg-gray-700 rounded-md"
                                    >
                                        <EllipsisVertical className="h-5 w-5 text-gray-400 hover:text-white" />
                                    </button>

                                    {openTeamMenu === team._id && (
                                        <div
                                            role="menu"
                                            className="absolute right-0 mt-1 w-32 origin-top-right bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-20"
                                        >
                                            <button
                                                onClick={() => {
                                                    setEditingTeam(team);
                                                    setShowEditModal(true);
                                                    setOpenTeamMenu(null);
                                                }}
                                                className="flex items-center w-full px-3 py-2 text-sm font-semibold text-gray-300 cursor-pointer hover:bg-gray-600 hover:rounded-2xl"
                                                role="menuitem"
                                            >
                                                <Pencil className="h-5 w-5 mr-2" />
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setSelectedTeamForModal(team);
                                                    setShowDeleteModal(true);
                                                    setOpenTeamMenu(null);
                                                }}
                                                className="flex items-center w-full px-3 py-2 text-sm font-semibold text-red-400 cursor-pointer hover:bg-gray-600 hover:rounded-2xl"
                                                role="menuitem"
                                            >
                                                <HiOutlineTrash className="h-5 w-5 mr-2" />
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                </ul>
            </div>

            {showTeamModal && (
                <CreateTeamModal
                    setShowTeamModal={setShowTeamModal}
                    fetchTeams={fetchTeams}
                    editingTeam={editingTeam}
                    setEditingTeam={setEditingTeam}
                />
            )}

            {showDeleteModal && (
                <DeleteTeamModal
                    selectedTeam={selectedTeamForModal}
                    setShowDeleteModal={setShowDeleteModal}
                    fetchTeams={fetchTeams}
                />
            )}

            {showEditModal && (
                <EditTeamModal
                    editingTeam={editingTeam}

                    setShowEditModal={setShowEditModal}
                    fetchTeams={fetchTeams}
                />
            )}
        </>
    );
}