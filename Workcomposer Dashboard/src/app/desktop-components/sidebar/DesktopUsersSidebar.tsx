"use client";

import UsersSidebar from "@/app/modules/users-management/UsersSidebar";

type Props = {
    activeTeam: string;
    setActiveTeam: React.Dispatch<React.SetStateAction<string>>;
};

export default function DesktopUsersSidebar(props: Props) {
    return <UsersSidebar {...props} desktop />;
}