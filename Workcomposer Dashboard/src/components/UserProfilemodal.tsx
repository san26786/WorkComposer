"use client";

import {
  Mail,
  ShieldCheck,
  User,
  CheckCircle2,
  Clock,
  UploadCloud,
  Monitor,
  Fingerprint,
  Users,
} from "lucide-react";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

import type { UserProfileData } from "@/types/userProfile";

export interface UserProfileModalProps {
    open: boolean;
    onClose: () => void;
    user: UserProfileData | undefined;
    loading?: boolean;
}

function DetailRow({
  icon,
  label,
  value,
  valueClassName = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0 text-blue-600">
        {icon}
      </div>

      <div className="min-w-0">
        <div className="text-[11px] font-medium tracking-wide text-gray-400">
          {label}
        </div>

        <div
          className={`text-[15px] text-gray-800 ${valueClassName}`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export default function UserProfileModal({
  open,
  onClose,
  user,
  loading = false,
}: UserProfileModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open) return null;

  const isTracking = user?.trackingStatus === "Tracking";

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-4 border-gray-100" />

              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600 border-r-indigo-400" />

              <div className="absolute inset-2 rounded-full bg-white" />

              <div className="absolute inset-[14px] rounded-full bg-indigo-600" />
            </div>

            <p className="mt-5 text-sm font-semibold text-gray-700">
              Loading profile...
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Fetching user information
            </p>
          </div>
        ) : user ? (
          <>
            {/* Avatar + Name */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-20 w-20 rounded-full border-2 border-white object-cover shadow"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white bg-indigo-500 text-2xl font-semibold text-white shadow">
                    {user.firstName?.charAt(0).toUpperCase() ||
                      user.name?.charAt(0).toUpperCase() ||
                      "U"}
                  </div>
                )}

                <span
                  className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${
                    isTracking ? "bg-green-500" : "bg-red-500"
                  }`}
                />
              </div>

              <h2 className="mt-3 text-xl font-semibold text-gray-900">
                {user.name}
              </h2>

              <button
                type="button"
                className="mt-3 flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
              >
                <Users className="h-4 w-4" />
                {user.team}
              </button>
            </div>

            {/* Profile Details */}
            <div className="mt-6">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200" />

                <span className="relative bg-white px-3 text-sm font-medium text-gray-500">
                  Profile Details
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
                <DetailRow
                  icon={<Mail className="h-5 w-5" />}
                  label="EMAIL"
                  value={user.email || "Not available"}
                />

                <DetailRow
                  icon={<ShieldCheck className="h-5 w-5" />}
                  label="ROLE"
                  value={user.role || "User"}
                />

                <DetailRow
                  icon={<User className="h-5 w-5" />}
                  label="MANAGER"
                  value={user.manager || "No manager assigned"}
                />

                <DetailRow
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  label="TRACKING STATUS"
                  value={
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isTracking
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />

                      <span
                        className={
                          isTracking
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {user.trackingStatus}
                      </span>
                    </span>
                  }
                />
              </div>
            </div>

            {/* Technical Details */}
            <div className="mt-6">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200" />

                <span className="relative bg-white px-3 text-sm font-medium text-gray-500">
                  Technical Details
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
                <DetailRow
                  icon={<Clock className="h-5 w-5" />}
                  label="TIMEZONE"
                  value={user.timezone || "Not available"}
                />

                <DetailRow
                  icon={<UploadCloud className="h-5 w-5" />}
                  label="LAST SYNCED"
                  value={user.lastSynced || "Never"}
                />

                <DetailRow
                  icon={<Monitor className="h-5 w-5" />}
                  label="APP VERSION"
                  value={user.appVersion || "Unknown"}
                />

                <DetailRow
                  icon={<Fingerprint className="h-5 w-5" />}
                  label="ID"
                  value={user.id}
                  valueClassName="break-all text-[13px]"
                />
              </div>
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="mt-8 w-full rounded-lg bg-indigo-50 py-3 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-100"
            >
              Close
            </button>
          </>
        ) : null}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}