import axios from "axios";
import type {
    AxiosError,
    InternalAxiosRequestConfig,
} from "axios";

const API = axios.create({
    baseURL:
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5000/api",
    withCredentials: true,
});

let isRefreshing = false;

let refreshSubscribers: Array<{
    resolve: () => void;
    reject: (error: any) => void;
}> = [];

const subscribeTokenRefresh = (
    resolve: () => void,
    reject: (error: any) => void
) => {
    refreshSubscribers.push({
        resolve,
        reject,
    });
};

const notifySubscribersSuccess = () => {
    refreshSubscribers.forEach(({ resolve }) => resolve());
    refreshSubscribers = [];
};

const notifySubscribersFailure = (error: any) => {
    refreshSubscribers.forEach(({ reject }) => reject(error));
    refreshSubscribers = [];
};

const isElectron = () => {
    return (
        typeof window !== "undefined" &&
        !!window.electronAPI
    );
};

API.interceptors.request.use(
    async (config) => {
        /*
         * Electron:
         * Get the CURRENT access token from the
         * Electron main process.
         */
        if (isElectron()) {
            try {
                const token = await window.electronAPI.getToken();

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.error(
                    "FAILED TO GET ELECTRON ACCESS TOKEN:",
                    error
                );
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

API.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        const originalRequest =
            error.config as InternalAxiosRequestConfig & {
                _retry?: boolean;
            };

        if (!originalRequest) {
            return Promise.reject(error);
        }

        /*
         * Never intercept the refresh request.
         */
        if (originalRequest.url?.includes("/auth/refresh")) {
            return Promise.reject(error);
        }

        /*
         * Only handle 401.
         */
        if (error.response?.status !== 401) {
            return Promise.reject(error);
        }

        /*
         * Prevent infinite retry.
         */
        if (originalRequest._retry) {
            console.error(
                "REQUEST FAILED AFTER TOKEN REFRESH"
            );

            return Promise.reject(error);
        }

        originalRequest._retry = true;

        /*
         * Another request is already refreshing.
         * Wait for it.
         */
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                subscribeTokenRefresh(
                    () => {
                        resolve(API(originalRequest));
                    },
                    reject
                );
            });
        }

        isRefreshing = true;

        try {

            /*
             * ============================
             * ELECTRON
             * ============================
             */
            if (isElectron()) {

                const result =
                    await window.electronAPI.refreshToken();

                if (!result?.success || !result?.accessToken) {
                    throw new Error(
                        "Electron token refresh failed"
                    );
                }

                notifySubscribersSuccess();

                /*
                 * Retry request.
                 *
                 * The request interceptor will automatically
                 * fetch the NEW token from Electron.
                 */
                return API(originalRequest);
            }

            /*
             * ============================
             * WEB
             * ============================
             */

            await API.post(
                "/auth/refresh",
                {},
                {
                    withCredentials: true,
                }
            );

            notifySubscribersSuccess();

            return API(originalRequest);
        } catch (refreshError) {
            console.error(
                "REFRESH TOKEN FAILED:",
                refreshError
            );

            notifySubscribersFailure(refreshError);

            /*
             * IMPORTANT:
             *
             * Do NOT redirect Electron to the
             * browser login page.
             */
            if (!isElectron()) {
                if (typeof window !== "undefined") {
                    window.location.href =
                        "/authenticate/login";
                }
            }

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default API;