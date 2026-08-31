"use client";

import { io, Socket } from "socket.io-client";

const socket: Socket = io(
    process.env.NEXT_PUBLIC_SOCKET_URL ||
        "http://localhost:5000",
    {
        withCredentials: true,
        autoConnect: false,
    }
);

const initializeSocket = async () => {
    if (typeof window === "undefined") {
        return;
    }

    let token: string | null = null;

    /*
     * Electron
     */
    if (window.electronAPI?.getToken) {
        try {
            token = await window.electronAPI.getToken();

            console.info(
                "SOCKET: ELECTRON TOKEN AVAILABLE:",
                !!token
            );

            if (token) {
                socket.auth = {
                    token,
                };
            }
        } catch (error) {
            console.error(
                "FAILED TO GET ELECTRON TOKEN:",
                error
            );
        }
    }

    /*
     * Web fallback
     */
    if (!token && !window.electronAPI) {
        const webToken =
            localStorage.getItem("accessToken");

        if (webToken) {
            token = webToken;

            socket.auth = {
                token: webToken,
            };
        }
    }

    if (!token) {
        console.warn(
            "SOCKET: NO AUTH TOKEN AVAILABLE"
        );

        return;
    }

    socket.connect();
};

/*
 * Socket connected
 */
socket.on("connect", () => {
    console.info(
        "FRONTEND SOCKET CONNECTED:",
        socket.id
    );
});

/*
 * Socket disconnected
 */
socket.on("disconnect", (reason) => {
    console.info(
        "FRONTEND SOCKET DISCONNECTED:",
        reason
    );
});

/*
 * Socket connection error
 */
socket.on("connect_error", (error) => {
    if (
        error.message === "TOKEN_EXPIRED" ||
        error.message === "Unauthorized"
    ) {
        console.warn(
            "SOCKET AUTH FAILED:",
            error.message
        );

        /*
         * Stop Socket.IO from repeatedly
         * reconnecting with the expired token.
         */
        socket.disconnect();

        return;
    }

    console.error(
        "SOCKET CONNECT ERROR:",
        error.message
    );
});

/*
 * Electron token refresh
 *
 * When Electron refreshes the access token,
 * update the existing socket authentication
 * and reconnect.
 */
if (
    typeof window !== "undefined" &&
    window.electronAPI?.onTokenRefreshed
) {
    window.electronAPI.onTokenRefreshed((newToken) => {
        if (!newToken) {
            console.warn(
                "SOCKET: TOKEN REFRESH FAILED"
            );

            return;
        }

        console.info(
            "SOCKET: TOKEN REFRESHED"
        );

        socket.auth = {
            token: newToken,
        };

        if (socket.connected) {
            socket.disconnect();
        }

        socket.connect();
    });
}

/*
 * Initialize after the browser/Electron window exists.
 */
if (typeof window !== "undefined") {
    void initializeSocket();
}

export default socket;