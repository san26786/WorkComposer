import { redirect } from "next/navigation";

export default function SecurityPage() {
    redirect("/dashboard/settings/account/security/two-factor");
}
