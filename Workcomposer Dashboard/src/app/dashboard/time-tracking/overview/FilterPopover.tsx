"use client";
import React, { useEffect, useState, useRef } from "react";

import { X, Search, Check } from "lucide-react";
import { MdKeyboardArrowDown } from "react-icons/md";

type Props = {
  selectedTeams: any[];
  setSelectedTeams: React.Dispatch<React.SetStateAction<any[]>>;
  teams: any[];

  selectedUsers: any[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<any[]>>;
  users: any[];

  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;

  order: string;
  setOrder: React.Dispatch<React.SetStateAction<string>>;

  setOpen: React.Dispatch<React.SetStateAction<boolean>>;

};

export default function FilterPopover({
  selectedTeams,
  setSelectedTeams,
  teams,
  selectedUsers,
  setSelectedUsers,
  users,
  sortBy,
  setSortBy,
  order,
  setOrder,
  setOpen,
}: Props) {
  const [teamOpen, setTeamOpen] = useState<boolean>(false);

  const [userSearch, setUserSearch] = useState("");

  const [userOpen, setUserOpen] = useState(false);

  const filteredUsers = (users || []).filter(
    (user: any) =>
      `${user.firstName} ${user.lastName} ${user.email}`
        .toLowerCase()
        .includes(userSearch.toLowerCase())
  );



  const toggleTeam = (team: any) => {
    setSelectedTeams((prev) =>
      prev.some((t) => t._id === team._id)
        ? prev.filter((t) => t._id !== team._id)
        : [...prev, team]
    );
  };

  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userRef.current &&
        !userRef.current.contains(e.target as Node)
      ) {
        setUserOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  return (
    <div className="absolute top-full left-0 z-20 w-[calc(100vw-2rem)] max-w-[400px] rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-900">Filter Options</h3>
        <button
          onClick={() => setOpen(false)}
          className="p-1 hover:bg-gray-100 rounded"
          title="Close filter options"
          aria-label="Close filter options"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Select Users */}
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Select Users
      </label>

      <div className="mb-2 flex max-h-24 flex-wrap gap-2 overflow-y-auto">
        {selectedUsers.map((user) => (
          <div
            key={user._id}
            onClick={(e) =>
              e.stopPropagation()
            }
            className="inline-flex max-w-full items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-700"
          >
            {user.firstName} {user.lastName}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();

                setSelectedUsers((prev) =>
                  prev.filter((u) => u._id !== user._id)
                )
              }}
              title={`Remove ${user.firstName} ${user.lastName}`}
              aria-label={`Remove ${user.firstName} ${user.lastName}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <div
        ref={userRef}
        className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
        <input
          type="text"
          value={userSearch}
          onFocus={() => setUserOpen(true)}
          onChange={(e) =>
            setUserSearch(e.target.value)
          }
          placeholder="Search and select users..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {userOpen && (
          <div
            className="
    absolute
    left-0
    right-0
    top-full
    mt-1
    bg-white
    border
    border-gray-200
    rounded-lg
    shadow-lg
    max-h-[250px]
    overflow-y-auto
    z-50
  "
          >
            {filteredUsers.map((user: any) => (
              <div
                key={user._id}
                onClick={() => {
                  setSelectedUsers((prev) =>
                    prev.some((u) => u._id === user._id)
                      ? prev.filter((u) => u._id !== user._id)
                      : [...prev, user]
                  );
                  setUserSearch("");
                }}
                className="mx-2 my-1 flex items-center justify-between rounded-md px-2 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium">
                    {user.firstName?.charAt(0)}
                    {user.lastName?.charAt(0)}
                  </div>

                  <div>
                    <p className="font-medium text-sm text-gray-700">
                      {user.firstName} {user.lastName}
                    </p>

                    <p className="text-xs text-gray-500">
                      {user.team?.name || "Default team"}
                    </p>
                  </div>
                </div>

                {selectedUsers.some(
                  (u) => u._id === user._id
                ) && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Teams */}
      <div className="flex flex-col mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Teams
        </label>

        {/* Selected Chips */}
        {selectedTeams.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTeams([]);
              }}
              className={`px-3 py-2 text-sm cursor-pointer ${selectedTeams.length === 0
                ? "bg-blue-50 text-blue-600 font-medium"
                : "hover:bg-gray-100"
                }`}
            >
              All Teams
            </div>

            {selectedTeams.map((team: any) => (
              <div
                key={team._id}
                className="flex max-w-full items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-700"
              >
                {team.name}
                <button
                  type="button"
                  onClick={() => toggleTeam(team)}
                  aria-label={`Remove ${team.name}`}
                  title={`Remove ${team.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedTeams.length > 0 && (
          <button
            onClick={() => setSelectedTeams([])}
            className="text-sm text-gray-500 hover:text-gray-700"
            title="Clear all selected teams"
            aria-label="Clear all selected teams"
          >
            Clear all
          </button>
        )}

        <div className="relative" onClick={(e) => e.stopPropagation()}>
          {/* Button */}
          <button
            onClick={() => setTeamOpen(!teamOpen)}
            className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <span className="text-gray-700">
              {selectedTeams.length > 0
                ? `${selectedTeams.length} selected`
                : "All Teams"}
            </span>
            <MdKeyboardArrowDown className="w-4 h-4 text-gray-500" />
          </button>

          {/* Dropdown */}
          {teamOpen && (
            <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-md">
              {(teams || []).map((team: any) => (
                <div
                  key={team._id}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTeam(team);
                  }}
                  className="px-3 py-2 text-sm cursor-pointer flex justify-between items-center hover:bg-gray-100"
                >
                  <span>{team.name}</span>

                  {selectedTeams.some((t) => t._id === team._id) && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sort By & Order */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Sort By
          </label>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
              aria-label="Sort By" className="w-full appearance-none pl-3 pr-9 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-white">
              <option value="name">Name</option>
              <option value="team">Team</option>
              <option value="externalId">External ID</option>
              <option value="trackingStatus">Tracking Status</option>
            </select>
            <MdKeyboardArrowDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Order
          </label>
          <div className="relative">
            <select
              value={order}
              onChange={(e) =>
                setOrder(e.target.value)
              }
              aria-label="Order" className="w-full appearance-none pl-3 pr-9 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-white">
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
            <MdKeyboardArrowDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}