import AuthenticatedProviders from "@/app/providers/AuthenticatedProviders";

type Props = {
    children: React.ReactNode;
};

export default function AuthenticatedLayout({
    children,
}: Props) {
    return (
        <AuthenticatedProviders>
            {children}
        </AuthenticatedProviders>
    );
}