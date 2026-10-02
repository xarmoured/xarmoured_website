import { requireUser, listRecords, isDemo } from '@/lib/server';
import { modules, can } from '@/lib/modules';
import { AdminShell } from '@/components/admin-shell';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Workspace — Xarmoured', robots: { index: false, follow: false } };
export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const groups = await Promise.all(
    ['leads', 'applications', 'jobs', 'research', 'services', 'pages', 'notifications']
      .filter((m) => can(user.role, `${m}:read`))
      .map(async (module) => ({ module, records: await listRecords(module) }))
  );
  return (
    <AdminShell
      user={user}
      demo={isDemo}
      searchRecords={groups.flatMap((g) =>
        g.records.map((record) => ({ module: g.module, record }))
      )}
      notificationCount={
        groups
          .find((g) => g.module === 'notifications')
          ?.records.filter((r) => r.status === 'unread').length || 0
      }
    >
      {children}
    </AdminShell>
  );
}
