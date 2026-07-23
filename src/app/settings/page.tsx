import { getUserSettings } from "@/lib/queries/settings";
import { SettingsForm } from "@/components/forms/SettingsForm";

export default async function SettingsPage() {
  const settings = await getUserSettings();

  return (
    <div className="flex flex-1 flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Goals</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
