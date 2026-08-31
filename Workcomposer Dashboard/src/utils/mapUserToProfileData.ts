import type { UserProfileData } from "@/types/userProfile";

export function mapUserToProfileData(
    user: any,
    trackingStatus?: string
): UserProfileData {
    const lastDevice = user.devices?.length
        ? [...user.devices].sort(
            (a: any, b: any) =>
                new Date(b.lastSync).getTime() -
                new Date(a.lastSync).getTime()
        )[0]
        : null;

    const isTracking =
    trackingStatus === "Tracking running" ||
    trackingStatus === "Tracking" ||
    lastDevice?.isTracking === true;

    return {
        firstName: user.firstName,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),

        avatarUrl: user.avatar || "",

        isOnline:
            isTracking ||
            lastDevice?.isOnline === true,

        team:
            typeof user.team === "object"
                ? user.team?.name || "Default team"
                : user.team || "Default team",

        email: user.email || "",

        role: user.role
            ? user.role.charAt(0).toUpperCase() +
            user.role.slice(1)
            : "User",

        manager:
            typeof user.manager === "object"
                ? `${user.manager?.firstName ?? ""} ${user.manager?.lastName ?? ""
                    }`.trim() || "No manager assigned"
                : user.manager || "No manager assigned",

        trackingStatus:
            isTracking
                ? "Tracking"
                : "Not tracking",

        timezone:
            user.reportTimezone || "Browser timezone",

        lastSynced:
            lastDevice?.lastSync
                ? new Date(
                    lastDevice.lastSync
                ).toLocaleString()
                : "Never",

        appVersion:
            lastDevice?.appVersion || "Unknown",

        id: user._id || user.id || "",
    };
}