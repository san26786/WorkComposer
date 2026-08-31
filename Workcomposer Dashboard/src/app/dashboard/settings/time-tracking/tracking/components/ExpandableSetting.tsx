import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

export default function ExpandableSetting({
    children,
}: Props) {
    return (
        <div className="border-b border-gray-200 px-12 py-6">            
            <div className="ml-8 border-l-2 border-gray-200 pl-8">
                {children}
            </div>
        </div>

        
    );
}