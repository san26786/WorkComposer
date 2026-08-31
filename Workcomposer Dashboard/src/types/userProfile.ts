export type UserProfileData = {
    firstName?: string;
    name: string;
    avatarUrl: string;
    isOnline?: boolean;
    team: string;
    email: string;
    role: string;
    manager?: string;
    trackingStatus: "Tracking" | "Not tracking";
    timezone: string;
    lastSynced: string;
    appVersion: string;
    id: string;
};