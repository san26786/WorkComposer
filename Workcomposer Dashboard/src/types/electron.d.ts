export { };

declare global {
    interface Window {
        electronAPI: {
            // Authentication
            saveToken: (
                accessToken: string,
                refreshToken: string
            ) => void;

            getToken: () => Promise<string | null>;

            refreshToken: () => Promise<{
                success: boolean;
                accessToken: string | null;
                invalid?: boolean;
            }>;

            logoutElectron: () => Promise<{
                success: boolean;
                message?: string;
            }>;

            onTokenRefreshed: (
                callback: (accessToken: string) => void
            ) => () => void;

            onDeviceSignedOut: (
                callback: () => void
            ) => () => void;

            onElectronLoggedOut: (
                callback: () => void
            ) => () => void;

            // Device
            getDeviceId: () => Promise<string>;

            getDeviceInfo: () => Promise<any>;

            // Tracking
            startTracking: (
                projectId?: string | null,
                taskId?: string | null
            ) => void;

            switchTask: (
                projectId?: string | null,
                taskId?: string | null
            ) => void;

            stopTracking: () => void;

            openMainWindow: () => void;

            showSystemNotification: (
                title: string,
                body: string,
            ) => void;

            // Auto tracking
            onAutoStartTracking: (
                callback: () => void
            ) => (() => void) | void;

            onAutoStopTracking: (
                callback: () => void
            ) => (() => void) | void;

            rendererReadyForAutoStart: () => void;

            reloadTrackingSettings: () => void;

            // Tracking bar
            updateTrackingBar: (data: any) => void;

            onTrackingUpdate: (
                callback: (data: any) => void
            ) => (() => void) | void;

            onTrackingBarStop: (
                callback: () => void
            ) => (() => void) | void;

            stopTrackingFromBar: () => void;

            // Idle
            onIdleWarning: (
                callback: () => void
            ) => (() => void) | void;

            onIdleStart: (
                callback: (data: {
                    countdown: number;
                }) => void
            ) => (() => void) | void;

            onIdleCountdown: (
                callback: (data: {
                    countdown: number;
                }) => void
            ) => (() => void) | void;

            onIdleResumed: (
                callback: () => void
            ) => (() => void) | void;

            onIdleTimeout: (
                callback: () => void
            ) => (() => void) | void;

            resetIdle: () => void;

            getLastSleep: () => Promise<{
                sleptMinutes: number;
                resumedAt: number;
            } | null>;
        };
    }
}