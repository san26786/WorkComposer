"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "@/api";
import { Clock, Globe2, Mail, MapPin, Navigation, Satellite } from "lucide-react";
import {
    Circle,
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    Tooltip,
    useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

type Coordinates = [number, number];

const createAvatarIcon = (avatar: string) =>
    L.divIcon({
        html: `
            <div class="avatar-marker">
                <img src="${avatar}" />
            </div>
        `,
        className: "",
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -18],
    });

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function RecenterMap({ position }: { position: Coordinates }) {
    const map = useMap();

    useEffect(() => {
        map.invalidateSize();
        map.setView(position, map.getZoom(), {
            animate: true,
        });
    }, [map, position]);

    useEffect(() => {
        const resizeMap = () => map.invalidateSize();
        const timer = window.setTimeout(resizeMap, 250);

        window.addEventListener("resize", resizeMap);

        return () => {
            window.clearTimeout(timer);
            window.removeEventListener("resize", resizeMap);
        };
    }, [map]);

    return null;
}

function FitBounds({ locations }: { locations: any[] }) {
    const map = useMap();
    const prevIdsRef = useRef<string>("");

    const idsKey = useMemo(
        () => locations.map((location) => location._id).sort().join(","),
        [locations]
    );

    useEffect(() => {
        if (locations.length === 0) return;
        if (idsKey === prevIdsRef.current) return; // same users already fitted — don't fight the user's zoom/pan

        const bounds = L.latLngBounds(
            locations.map((location) => [location.latitude, location.longitude])
        );

        map.fitBounds(bounds, {
            padding: [60, 60],
            maxZoom: 17,
            animate: true,
        });

        prevIdsRef.current = idsKey;
    }, [idsKey, map, locations]);

    return null;
}

function DetailRow({
    label,
    value,
}: {
    label: string;
    value: string | number | null | undefined;
}) {
    return (
        <div className="grid grid-cols-[6.75rem_1fr] gap-3 text-sm">
            <span className="font-medium text-gray-500">{label}</span>
            <span className="break-words font-semibold text-gray-900">
                {value || "Not available"}
            </span>
        </div>
    );
}

function formatDateTime(value: string | null) {
    if (!value) {
        return "Not available";
    }

    return new Date(value).toLocaleString();
}

type Props = {
    locations: any[];
};

export default function LiveMap({
    locations = [],
}: Props) {

    const [mapType, setMapType] = useState<"street" | "satellite">("street");
    const [selectedLocation, setSelectedLocation] = useState<any>(null);
    const [attendanceSummary, setAttendanceSummary] = useState({
        workTime: "00:00:00",
        breakTime: "00:00:00",
    });
    const [loadingAttendance, setLoadingAttendance] = useState(false);

    const iconCache = useRef<Map<string, L.DivIcon>>(new Map());

    const getAvatarIcon = (avatar: string) => {
        if (!iconCache.current.has(avatar)) {
            iconCache.current.set(avatar, createAvatarIcon(avatar));
        }
        return iconCache.current.get(avatar)!;
    };

    const [popupMaxWidth, setPopupMaxWidth] = useState(340);
    const [popupMinWidth, setPopupMinWidth] = useState(300);

    useEffect(() => {
        const updatePopupSize = () => {
            const isSmall = window.innerWidth < 480;
            setPopupMaxWidth(isSmall ? window.innerWidth - 64 : 340);
            setPopupMinWidth(isSmall ? window.innerWidth - 64 : 300);
        };

        updatePopupSize();
        window.addEventListener("resize", updatePopupSize);
        return () => window.removeEventListener("resize", updatePopupSize);
    }, []);

    return (
        <section className="bg-gray-100 px-4 pt-7 pb-6 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Location Tracking</p>
                            <h1 className="mt-1 text-lg font-semibold text-gray-900">
                                {locations.length > 0
                                    ? `${locations[0]?.user?.firstName} ${locations[0]?.user?.lastName}`
                                    : "No Active Users"}
                            </h1>
                        </div>

                        <span
                            className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                        >
                            Live
                        </span>
                    </div>
                </div>

                <div className="border-b border-gray-200 px-5 py-4">
                    <div className="grid gap-3 lg:grid-cols-3">
                        <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                            Each marker represents a user&apos;s location
                        </div>

                        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            Click on a marker to see detailed information
                        </div>

                        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                            Full details are visible inside the marker popup
                        </div>
                    </div>
                </div>

                <div className="px-2 py-2">
                    <div className="relative h-[calc(100vh-20rem)] min-h-[30rem] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                        <div className="absolute top-4 right-4 z-[1000]">
                            <div className="inline-flex rounded-lg border border-gray-200 bg-white overflow-hidden shadow-md">
                                <button
                                    onClick={() => setMapType("street")}
                                    className={`px-4 py-2 text-sm font-medium ${mapType === "street"
                                        ? "bg-blue-600 text-white"
                                        : "bg-white hover:bg-gray-50"
                                        }`}
                                >
                                    Street
                                </button>

                                <button
                                    onClick={() => setMapType("satellite")}
                                    className={`px-4 py-2 text-sm font-medium ${mapType === "satellite"
                                        ? "bg-blue-600 text-white"
                                        : "bg-white hover:bg-gray-50"
                                        }`}
                                >
                                    Satellite
                                </button>
                            </div>
                        </div>

                        <MapContainer
                            center={
                                locations.length
                                    ? [locations[0].latitude, locations[0].longitude]
                                    : [20.5937, 78.9629]
                            }
                            zoom={16}
                            minZoom={3}
                            maxZoom={22}
                            zoomControl={true}
                            scrollWheelZoom={true}
                            doubleClickZoom={true}
                            touchZoom={true}
                            dragging={true}
                            className="h-full w-full"
                        >
                            <FitBounds locations={locations} />

                            <TileLayer
                                attribution={
                                    mapType === "street"
                                        ? '&copy; OpenStreetMap contributors'
                                        : '&copy; Esri'
                                }
                                url={
                                    mapType === "street"
                                        ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                }
                            />

                            {locations.length > 0 && locations[0].accuracy ? (
                                <Circle
                                    center={[
                                        locations[0].latitude,
                                        locations[0].longitude,
                                    ]}
                                    radius={locations[0].accuracy}
                                    pathOptions={{
                                        color: "#2563eb",
                                        fillColor: "#60a5fa",
                                        fillOpacity: 0.2,
                                        weight: 1,
                                    }}
                                />
                            ) : null}


                            <MarkerClusterGroup>
                                {locations.map((location: any) => (
                                    <Marker
                                        key={location.user._id}
                                        position={[location.latitude, location.longitude]}
                                        icon={getAvatarIcon(location.user.avatar)}

                                        eventHandlers={{
                                            click: async () => {
                                                setSelectedLocation(location);
                                                setLoadingAttendance(true);

                                                try {
                                                    const { data } = await API.get(
                                                        `/attendance/summary/${location.user._id}`
                                                    );

                                                    setAttendanceSummary(data);
                                                }
                                                catch (err) {
                                                    console.error(err);

                                                    setAttendanceSummary({
                                                        workTime: "00:00:00",
                                                        breakTime: "00:00:00",
                                                    });
                                                } finally {
                                                    setLoadingAttendance(false);
                                                }
                                            },
                                        }}
                                    >
                                        {/* <Tooltip
                                        permanent
                                        direction="top"
                                        offset={[0, -40]}
                                        opacity={1}
                                        className="live-map-avatar-tooltip"
                                    >
                                        <img
                                            src={location.user.avatar}
                                            alt={`${location.user.firstName} ${location.user.lastName}`}
                                            className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-lg"
                                        />
                                    </Tooltip> */}

                                        <Popup
                                            maxWidth={popupMaxWidth}
                                            minWidth={popupMinWidth}
                                            autoPan
                                            keepInView
                                            closeButton={false}
                                            className="employee-popup"
                                        >
                                            <div className="max-h-[240px] overflow-y-auto bg-white rounded-2xl">

                                                {/* Header */}
                                                <div className="flex items-center gap-2.5 px-2.5 py-1.5 border-b">
                                                    <img
                                                        src={location.user.avatar}
                                                        alt={`${location.user.firstName} ${location.user.lastName}`}
                                                        className="w-7 h-7 rounded-full object-cover"
                                                    />

                                                    <div className="flex flex-col justify-center min-w-0">
                                                        <h3 className="text-sm font-semibold leading-none text-gray-900 truncate">
                                                            {location.user.firstName} {location.user.lastName}
                                                        </h3>

                                                        <p className="mt-0.5 text-[11px] text-gray-500 truncate">
                                                            {location.user.email}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Body */}
                                                <div className="px-2.5 py-1.5">

                                                    <div className="grid grid-cols-2 gap-2 border-b border-gray-200 py-1.5">
                                                        <div className="border-l-2 border-blue-600 pl-1.5">
                                                            <p className="text-[10px] uppercase tracking-wide text-gray-500">
                                                                Work Time
                                                            </p>
                                                            <p className="mt-0.5 text-sm font-bold leading-none text-gray-900">
                                                                {loadingAttendance ? "Loading..." : attendanceSummary.workTime}
                                                            </p>
                                                        </div>

                                                        <div className="border-l-2 border-amber-500 pl-1.5">
                                                            <p className="text-[10px] uppercase tracking-wide text-gray-500">
                                                                Break Time
                                                            </p>
                                                            <p className="mt-0.5 text-sm font-bold leading-none text-gray-900">
                                                                {loadingAttendance ? "Loading..." : attendanceSummary.breakTime}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <h4 className="text-sm font-semibold text-gray-900 mb-1.5 mt-1.5">
                                                        📍 Location Details
                                                    </h4>

                                                    <div className="space-y-1 text-xs">
                                                        <div className="flex justify-between gap-2">
                                                            <span className="font-medium text-gray-500">Country</span>
                                                            <span className="text-right font-semibold text-gray-900">{location.country || "-"}</span>
                                                        </div>
                                                        <div className="flex justify-between gap-4">
                                                            <span className="font-medium text-gray-500">State</span>
                                                            <span className="text-right font-semibold text-gray-900">{location.state || "-"}</span>
                                                        </div>
                                                        <div className="flex justify-between gap-4">
                                                            <span className="font-medium text-gray-500">City</span>
                                                            <span className="text-right font-semibold text-gray-900">{location.city || "-"}</span>
                                                        </div>
                                                        <div className="flex justify-between gap-4">
                                                            <span className="font-medium text-gray-500">ZIP Code</span>
                                                            <span className="text-right font-semibold text-gray-900">{location.postalCode || "-"}</span>
                                                        </div>
                                                        <div className="flex justify-between gap-4">
                                                            <span className="font-medium text-gray-500">IP Address</span>
                                                            <span className="text-right font-semibold text-gray-900">{location.ipAddress || "-"}</span>
                                                        </div>
                                                        <div className="flex justify-between gap-4 min-w-0">
                                                            <span className="font-medium text-gray-500 shrink-0">Service Provider</span>
                                                            <span className="text-right font-semibold text-gray-900 break-words min-w-0">{location.serviceProvider || "-"}</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-1.5 border-t border-gray-200 pt-1.5">
                                                        <p className="text-xs font-semibold text-gray-500 mb-0.5">Address</p>
                                                        <p className="text-xs leading-5 text-gray-900">{location.address || "-"}</p>
                                                    </div>

                                                    <div className="mt-1.5 border-t border-gray-200 pt-1.5 space-y-1">
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-500 font-medium">Accuracy</span>
                                                            <span className="font-semibold">{location.accuracy} m</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-500 font-medium">Last Updated</span>
                                                            <span className="font-semibold">{new Date(location.trackedAt).toLocaleString()}</span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() =>
                                                            window.open(
                                                                `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
                                                                "_blank"
                                                            )
                                                        }
                                                        className="mt-1.5 w-full rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                                                    >
                                                        📍 Open in Google Maps
                                                    </button>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MarkerClusterGroup>


                        </MapContainer>

                        {/* {selectedLocation && (
                            <div className="absolute top-6 right-6 z-[1000] w-[380px] max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gray-200">

                              
                            </div>
                        )} */}
                    </div>
                </div>
            </div>
        </section>
    );
}