"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import API from "@/api";
import toast from "react-hot-toast";
import { Search } from 'lucide-react';

interface User {
  _id: string;
  name?: string;
  email: string;
  avatar?: string;
  role?: string;
  team?: string;
  manager?: any;

  managedUsersCount?: number;
  managedTeamsCount?: number;
}

interface UserManagerProps {
  userId: string;
  onClose: () => void;
}

const UserManager = ({
  userId,
  onClose,
}: UserManagerProps) => {
  const [activeTab, setActiveTab] = useState("Users");

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [userTeamFilter, setUserTeamFilter] = useState("");
  const [teams, setTeams] = useState<any[]>([]);


  //  FETCH USERS 

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const res = await API.get("/users/all-users");

      setUsers(Array.isArray(res.data.users) ? res.data.users : []);

    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeams = useCallback(async () => {
    try {
      const res = await API.get("/teams");

      setTeams(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  }, [])


  const fetchManagerAssignments = useCallback(async () => {
    try {
      const { data } = await API.get(
        `/users/${userId}/manager-assignments`
      );

      setSelectedUsers(data.userIds || []);
      setSelectedTeams(data.teams || []);
    } catch (err) {
      toast.error("Failed to load manager assignments");
    }
  }, [userId]);

  useEffect(() => {
    fetchUsers();
    fetchTeams();
    fetchManagerAssignments();
  }, [fetchUsers, fetchTeams, fetchManagerAssignments]);

  // FILTER USERS 

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // const isManager = user.role?.toLowerCase() === "manager" ||
      //   user.role?.toLowerCase() === "owner";

      // if (isManager)
      //   return false;

      const currentUserId = user._id ||
        (user as any).id;

      if (currentUserId === userId)
        return false;

      const fullName =
        `${(user as any).firstName || ""} ${(user as any).lastName || ""}`.toLowerCase();

      const matchesSearch =
        fullName.includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchesTeam =
        userTeamFilter === "" ||
        userTeamFilter === "All Teams" ||
        user.team === userTeamFilter;

      return matchesSearch && matchesTeam;
    });
  }, [users, search, userTeamFilter, userId]);

  const handleUserSelect = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((userId) =>
        userId !== id) : [...prev, id]
    )
  }

  const handleTeamSelect = (team: string) => {
    setSelectedTeams((prev) =>
      prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team]
    )
  }

  const handleSelectAllUsers = () => {
    const allIds = filteredUsers.map((u) => u._id || (u as any).id);

    const allSelected = allIds.every((id) =>
      selectedUsers.includes(id)
    );

    if (allSelected) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(allIds)
    }
  }

  const handleSelectAllTeams = () => {
    const allTeams = filteredTeams;

    const allSelected = allTeams.every((team) =>
      selectedTeams.includes(team)
    );

    if (allSelected) {
      setSelectedTeams([]);
    } else {
      setSelectedTeams(allTeams)
    }
  }

  // ASSIGN MANAGER 

  const assignUsersToManager = async () => {
    try {

      setSaving(true);

      await API.put(`/users/${userId}/assign-manager`, {
        userIds: selectedUsers,
        teams: selectedTeams,
      }
      );

      toast.success("Users assigned successfully");

      setSelectedUsers([]);
      setSelectedTeams([]);

      handleCloseModal();

    } catch (err) {
      toast.error("Failed to assign users");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseModal();

      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    }
  }, [])

  const filteredTeams = useMemo(() => {

    const allTeams = [
      "Default team",
      ...teams.map((team) => team.name),
    ];

    return [...new Set(allTeams)].filter(
      (team): team is string =>
        Boolean(team) &&
        team.toLowerCase().includes(teamSearch.toLowerCase())
    );

  }, [teams, teamSearch]);

  // LOADING

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg font-medium text-gray-600">
          Loading users...
        </div>
      </div>
    );
  }

  const handleCloseModal = () => {
    onClose();

    setSearch("");
    setTeamSearch("");
    setUserTeamFilter("");

    fetchUsers();
  };


  const getAvatar = (avatar?: string) => {
    return avatar?.trim() ? avatar : "";
  };

  const getInitials = (user: User) => {
    if (user.name?.trim()) {
      return user.name
        .trim()
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
    }

    return user.email[0]?.toUpperCase() || "?";
  };


  const manager = users.find((u) =>
    u._id === userId);


  return (
    <>
      {/* MODAL */}
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={handleCloseModal}
        ></div>

        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div onClick={(e) =>
            e.stopPropagation()
          }
            className="w-full max-w-2xl rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            {/* HEADER */}

            <div className="px-8 pt-8 text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Manager - {manager?.name || manager?.email}
              </h2>
            </div>

            {/* CONTENT */}

            <div className="p-6">
              {/* TABS */}

              <div className="border-b border-gray-200 mb-3">
                <nav className="flex gap-8">
                  <button
                    onClick={() => setActiveTab("Teams")}
                    className={`pb-2 border-b-2 text-sm font-medium ${activeTab === "Teams"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500"
                      }`}
                  >
                    Teams
                  </button>

                  <button
                    onClick={() => setActiveTab("Users")}
                    className={`pb-2 border-b-2 text-sm font-medium ${activeTab === "Users"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500"
                      }`}
                  >
                    Users
                  </button>
                </nav>
              </div>

              {/* USERS TAB */}

              {activeTab === "Users" && (
                <div className="space-y-5">
                  {/* Top */}

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2"> Search Users </label>

                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by name or email..."
                          value={search}
                          onChange={(e) =>
                            setSearch(e.target.value)
                          }
                          className="w-full rounded-md border border-gray-300 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        ></input>

                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Filter by Team</label>

                      <select
                        value={userTeamFilter}
                        onChange={(e) =>
                          setUserTeamFilter(e.target.value)
                        }
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">All Teams</option>

                        {filteredTeams.map(
                          (team, index) =>
                            team && (
                              <option
                                key={team}
                                value={team}
                              >
                                {team}
                              </option>
                            )
                        )}
                      </select>
                    </div>
                  </div>

                  {/* SELECTION */}

                  <div className="flex items-center justify-between text-sm">
                    <p className="text-gray-600">{
                      filteredUsers.filter((user) =>
                        selectedUsers.includes(user._id || (user as any).id)
                      ).length
                    } selected
                    </p>

                    <p className="text-gray-600">Total: {filteredUsers.length}{" "}
                      {filteredUsers.length === 1 ? "user" : "users"}
                    </p>
                  </div>

                  {/* TABLE */}

                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <table className="min-w-full">

                      {/* HEADER */}

                      <thead className="bg-white border-b border-gray-200">
                        <tr>

                          <th className="px-4 py-4 text-left w-[70%]">
                            <div className="flex items-center gap-3">

                              <input
                                type="checkbox"

                                checked={
                                  filteredUsers.length > 0 &&
                                  filteredUsers.every((user) =>
                                    selectedUsers.includes(user._id || (user as any).id)
                                  )
                                }
                                onChange={handleSelectAllUsers}
                                className="h-3.5 w-3.5 rounded border-gray-300"
                              ></input>

                              <span className="text-sm font-medium text-gray-900">Select all {filteredUsers.length} on this page</span>
                            </div>
                          </th>

                          <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">Team</th>
                        </tr>
                      </thead>

                      {/* BODY  */}

                      <tbody className="bg-white divide-y divide-gray-100">
                        {filteredUsers.map((user) =>
                        (
                          <tr
                            key={user._id || user.email}

                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-5">
                              <div className="flex items-center gap-4">
                                <input
                                  type="checkbox"
                                  checked={selectedUsers.includes(user._id || (user as any).id)}
                                  onChange={() =>
                                    handleUserSelect(user._id || (user as any).id)
                                  }
                                  className="h-3.5 w-3.5 rounded border-gray-300"
                                ></input>

                                {getAvatar(user.avatar) ? (
                                  <img
                                    src={getAvatar(user.avatar)}
                                    alt={user.name || user.email}
                                    width={44}
                                    height={44}
                                    className="h-11 w-11 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-11 w-11 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">
                                    {getInitials(user)}
                                  </div>
                                )}

                                <div>
                                  <p className="text-sm font-semibold text-gray-900 leading-none">{user.name || user.email}</p>

                                  <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                                </div>
                              </div>
                            </td>


                            {/* TEAM */}


                            <td className="px-4 py-5 text-gray-500 text-sm">{user.team || "Default team"}</td>
                          </tr>
                        )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TEAMS TAB */}

              {activeTab === "Teams" && (
                <div className="space-y-5">
                  <span className="text-gray-700 text-sm font-semibold">Search Teams</span>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search teams..."
                      value={teamSearch}
                      onChange={(e) => setTeamSearch(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>

                  {/* Selection Row */}

                  <div className="flex items-center justify-between mb-3 text-sm">
                    <p className="text-gray-600 "> {selectedTeams.length} selected</p>

                    <p className="text-gray-600">Total: {filteredTeams.length}{" "}
                      {filteredTeams.length === 1 ? "team" : "teams"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">

                      <thead className="bg-gray-50">
                        <tr className="border-b border-gray-200">
                          <th className="px-3.5 py-3.5 text-left">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"

                                checked={
                                  filteredTeams.length > 0 &&
                                  filteredTeams.every((team) =>
                                    selectedTeams.includes(team)
                                  )
                                }
                                onChange={handleSelectAllTeams}
                                className="h-3.5 w-3.5 rounded border-gray-300"
                              />

                              <span className="text-sm font-medium text-gray-900">
                                Select all {filteredTeams.length} on this page
                              </span>
                            </div>
                          </th>
                        </tr>
                      </thead>

                      <tbody className="bg-white">
                        {filteredTeams.map(
                          (team, index) =>
                            team && (
                              <tr
                                key={team}
                                className="border-b border-gray-100"
                              >
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedTeams.includes(team)}
                                      onChange={() =>
                                        handleTeamSelect(team)
                                      }
                                      className="h-3.5 w-3.5 rounded border-gray-300"
                                    />

                                    <span className="text-sm text-gray-900">
                                      {team}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            )
                        )}
                      </tbody>

                    </table>
                  </div>
                </div>
              )}

              {/* FOOTER */}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
                >
                  Close
                </button>

                <button
                  onClick={assignUsersToManager}
                  disabled={saving}
                  className={`rounded-md px-4 py-2 text-sm font-medium text-white
                     ${saving ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`
                  }
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div >

    </>
  );
};

export default UserManager;