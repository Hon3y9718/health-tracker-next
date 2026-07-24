import { getUserSettings } from "@/lib/queries/settings";
import { listMyCollaborators, listAccountsSharedWithMe } from "@/lib/queries/collaborators";
import { getActiveAccountId } from "@/lib/account-context";
import { SettingsForm } from "@/components/forms/SettingsForm";
import { CollaboratorsSection } from "@/components/CollaboratorsSection";
import { TopNav } from "@/components/TopNav";

export default async function SettingsPage() {
  const [settings, collaborators, sharedAccounts, activeAccountId] = await Promise.all([
    getUserSettings(),
    listMyCollaborators(),
    listAccountsSharedWithMe(),
    getActiveAccountId(),
  ]);

  return (
    <div className="flex flex-1 flex-col items-center gap-6 p-8">
      <TopNav current="settings" />
      <h1 className="text-2xl font-semibold">Goals</h1>
      <SettingsForm settings={settings} />

      <hr className="border-[var(--gridline)] w-full max-w-sm" />

      <h1 className="text-2xl font-semibold">Sharing</h1>
      <CollaboratorsSection
        collaborators={collaborators}
        sharedAccounts={sharedAccounts}
        activeAccountId={activeAccountId}
      />
    </div>
  );
}
