import type { Metadata } from 'next';
import Link from 'next/link';
import { Package, Receipt, LifeBuoy, FileText, Users, Settings, ShieldCheck } from 'lucide-react';
import type { RoleKey } from '@/lib/generated/prisma/client';
import { AdminStatusChip } from '@/components/admin/admin-status-chip';

export const metadata: Metadata = {
  title: 'Overview',
  robots: { index: false, follow: false },
};

const MODULES: {
  label: string;
  icon: typeof Package;
  description: string;
}[] = [
  {
    label: 'Catalog',
    icon: Package,
    description: 'Products and categories — the ecommerce backbone.',
  },
  {
    label: 'Sales',
    icon: Receipt,
    description: 'Orders, quotes, and customer accounts.',
  },
  {
    label: 'Support',
    icon: LifeBuoy,
    description: 'Tickets and self-service support articles.',
  },
  {
    label: 'Content',
    icon: FileText,
    description: 'Blog posts, media library, and editorial workflow.',
  },
  {
    label: 'Operations',
    icon: Users,
    description: 'Users, roles, and the audit log.',
  },
  {
    label: 'Settings',
    icon: Settings,
    description: 'Console preferences and system configuration.',
  },
];

export default async function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-steel-50 text-2xl font-semibold tracking-tight">
            Overview
          </h1>
          <p className="text-steel-400 mt-1 text-sm">
            ARIOT internal operations console. Module areas are being brought online incrementally.
          </p>
        </div>
        <AdminStatusChip variant="info" label="Console active" dot />
      </div>

      <section
        aria-label="Access"
        className="border-steel-800 bg-bg-raised flex items-start gap-3 rounded-lg border p-4"
      >
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
        <div className="text-steel-300 flex-1 text-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-steel-100 font-medium">Access verified</p>
            <AdminStatusChip variant="success" label="Authenticated" size="sm" dot />
          </div>
          <p className="text-steel-400 mt-0.5">
            This console is gated server-side. Each module and action checks your role before
            rendering or writing.
          </p>
        </div>
      </section>

      <section
        aria-label="Modules"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {MODULES.map((module) => {
          const Icon = module.icon;
          return (
            <div
              key={module.label}
              className="border-steel-800 bg-bg-raised flex flex-col rounded-lg border p-5"
            >
              <Icon className="h-5 w-5 text-cyan-400" />
              <h2 className="font-display text-steel-100 mt-3 text-base font-semibold">
                {module.label}
              </h2>
              <p className="text-steel-400 mt-1 flex-1 text-sm">{module.description}</p>
              <div className="mt-4">
                <AdminStatusChip variant="neutral" label="Coming soon" size="sm" />
              </div>
            </div>
          );
        })}
      </section>

      <section
        aria-label="Getting started"
        className="border-steel-800 bg-bg-elevated rounded-lg border p-5"
      >
        <h2 className="font-display text-steel-100 text-base font-semibold">Getting started</h2>
        <ol className="text-steel-300 mt-3 list-decimal space-y-2 pl-5 text-sm">
          <li>
            Set <code className="text-cyan-300">GOOGLE_CLIENT_ID</code> and{' '}
            <code className="text-cyan-300">GOOGLE_CLIENT_SECRET</code> in your environment.
          </li>
          <li>
            Run <code className="text-cyan-300">pnpm admin:bootstrap --apply</code> with the
            administrator&apos;s email to provision the first <RoleTag role="SUPER_ADMIN" />.
          </li>
          <li>
            Sign in with that Google account — it links automatically to the pre-provisioned user.
          </li>
        </ol>
        <Link
          href="/sign-in"
          className="mt-4 inline-flex items-center text-sm text-cyan-400 underline-offset-4 hover:text-cyan-300 hover:underline focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
        >
          Go to sign in →
        </Link>
      </section>
    </div>
  );
}

function RoleTag({ role }: { role: RoleKey }) {
  return (
    <span className="border-steel-700 bg-bg-raised text-steel-300 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase">
      {role.replace(/_/g, ' ').toLowerCase()}
    </span>
  );
}
