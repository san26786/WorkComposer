"use client";

import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { createPortal } from "react-dom";
import { ChevronsUpDown, Check } from "lucide-react";

type Option = {
    label: string;
    value: string | number;
};

type Props = {
    value: string | number;
    options: Option[];
    onChange: (value: string | number) => void;
    width?: string;
};

export default function CustomSelect({
    value,
    options,
    onChange,
    width = "w-24",
}: Props) {
    const [open, setOpen] = useState(false);
    const [openUp, setOpenUp] = useState(false);
    const [menuPosition, setMenuPosition] = useState({
        top: 0,
        left: 0,
        width: 0,
    });
    const ref = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;

            if (
                ref.current?.contains(target) ||
                menuRef.current?.contains(target)
            ) {
                return;
            }

            setOpen(false);
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useLayoutEffect(() => {
        if (!open || !ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        const dropdownHeight = 230;

        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        const shouldOpenUp =
            spaceBelow < dropdownHeight &&
            spaceAbove > dropdownHeight;

        setOpenUp(shouldOpenUp);

        setMenuPosition({
            left: rect.left,
            width: rect.width,
            top: openUp ? rect.top : rect.bottom + 8,
        });
    }, [open, openUp]);

    const selected = options.find((o) => o.value === value);

    return (
        <div className={`relative ${width}`} ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 text-sm"
            >
                <span>{selected?.label}</span>
                <ChevronsUpDown size={16} />
            </button>

            {open &&
                createPortal(
                    <div
                        ref={menuRef}
                        className="fixed z-[9999] max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-xl"
                        style={{
                            left: menuPosition.left,
                            width: menuPosition.width,
                            top: menuPosition.top,
                            transform: openUp
                                ? "translateY(calc(-100% - 8px))"
                                : "translateY(0)",
                        }}
                    >
                        {options.map((option) => {
                            const selected = option.value === value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between px-3 py-2 text-sm transition-colors ${selected
                                        ? "bg-indigo-50 text-indigo-600"
                                        : "text-gray-700 hover:bg-indigo-50"
                                        }`}
                                >
                                    <span>{option.label}</span>

                                    {selected && (
                                        <Check
                                            size={16}
                                            className="text-indigo-600"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>,
                    document.body
                )}
        </div>
    );
}