import { PublicLayout } from "@/components/layouts/Layout";
import { getGlobalSettings } from "@/lib/settings";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const settings = await getGlobalSettings();
    return <PublicLayout settings={settings}>{children}</PublicLayout>;
}
