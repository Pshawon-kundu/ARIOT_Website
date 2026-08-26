'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AdminStatusChip } from '@/components/admin/admin-status-chip';

/**
 * Shared product editor tab navigation — Step 2.4.4.
 *
 * Renders page header and tab strip for both Details and Media tabs.
 * Active tab is derived from the current URL path.
 */

interface ProductEditorHeaderProps {
  productId: string;
  productName: string;
  sku: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  canEdit: boolean;
}

const STATUS_MAP = {
  DRAFT: { label: 'Draft', variant: 'neutral' as const },
  PUBLISHED: { label: 'Published', variant: 'success' as const },
  ARCHIVED: { label: 'Archived', variant: 'inactive' as const },
};

interface TabDef {
  key: string;
  label: string;
  href: string | null;
}

export function ProductEditorHeader({
  productId,
  productName,
  sku,
  status,
  canEdit,
}: ProductEditorHeaderProps) {
  const pathname = usePathname();
  const statusInfo = STATUS_MAP[status];

  const tabs: TabDef[] = [
    { key: 'details', label: 'Details', href: `/admin/products/${productId}` },
    { key: 'media', label: 'Media', href: `/admin/products/${productId}/media` },
    { key: 'variants', label: 'Variants', href: `/admin/products/${productId}/variants` },
    { key: 'specifications', label: 'Specifications', href: null },
    { key: 'inventory', label: 'Inventory', href: null },
    { key: 'seo', label: 'SEO', href: null },
    { key: 'history', label: 'History', href: null },
  ];

  function isActive(tab: TabDef) {
    if (tab.key === 'media') return pathname.endsWith('/media');
    if (tab.key === 'variants') return pathname.endsWith('/variants');
    if (tab.key === 'details') {
      return !pathname.endsWith('/media') && !pathname.endsWith('/variants');
    }
    return false;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/admin/products"
            className="text-steel-400 hover:text-steel-200 mb-2 inline-flex items-center gap-1.5 rounded text-sm focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Products
          </Link>
          <h1 className="font-display text-steel-50 truncate text-2xl font-semibold tracking-tight">
            {productName}
          </h1>
          <p className="text-steel-400 mt-0.5 flex items-center gap-2 text-sm">
            <span className="font-mono text-xs">{sku}</span>
            <AdminStatusChip variant={statusInfo.variant} label={statusInfo.label} size="sm" />
            {!canEdit && (
              <span className="bg-steel-800 text-steel-400 rounded px-2 py-0.5 text-[10px] font-medium">
                Read-only
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <nav aria-label="Product editor tabs" className="overflow-x-auto">
        <div className="border-steel-800 flex min-w-max border-b" role="tablist">
          {tabs.map((tab) => {
            const active = isActive(tab);
            if (tab.href) {
              return (
                <Link
                  key={tab.key}
                  href={tab.href}
                  role="tab"
                  aria-selected={active}
                  className={
                    active
                      ? 'border-b-2 border-cyan-400 px-4 py-2.5 text-sm font-medium text-cyan-300'
                      : 'text-steel-400 hover:text-steel-200 px-4 py-2.5 text-sm'
                  }
                >
                  {tab.label}
                </Link>
              );
            }
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={false}
                aria-disabled
                disabled
                className="text-steel-500 cursor-not-allowed px-4 py-2.5 text-sm"
              >
                {tab.label}
                <span className="bg-steel-800 text-steel-600 ml-1.5 rounded px-1.5 py-px text-[9px] font-medium">
                  Soon
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
