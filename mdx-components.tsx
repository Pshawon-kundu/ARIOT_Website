import type { MDXComponents } from 'mdx/types';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { slugify } from '@/lib/utils/slugify';

/**
 * mdx-components.tsx — required by Next.js App Router when using @next/mdx.
 *
 * Provides custom component mappings for all MDX content across the site.
 * Design tokens from DESIGN_SYSTEM.md are applied here so prose sections
 * (blog posts, support articles, legal pages) render consistently without
 * raw tailwind classes in every MDX file.
 *
 * Typography scale follows DESIGN_SYSTEM.md §3. All colours use CSS
 * custom-property tokens (never raw hex).
 *
 * ### Heading IDs
 * `rehype-slug` cannot be used with Turbopack (plugin functions are not
 * JSON-serializable). Instead, IDs are computed from the heading text
 * using the same `slugify` function that generates the TOC item IDs —
 * so anchor links will always resolve correctly.
 */

/** Extract plain text from React children for ID generation. */
function headingText(children: ReactNode): string {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(headingText).join('');
  return '';
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Headings — IDs computed from text to match TOC item IDs
    h1: ({ children }) => {
      const id = slugify(headingText(children));
      return (
        <h1
          id={id}
          className="text-steel-100 font-display mt-10 scroll-mt-28 text-3xl font-semibold tracking-tight first:mt-0 sm:text-4xl"
        >
          {children}
        </h1>
      );
    },
    h2: ({ children }) => {
      const id = slugify(headingText(children));
      return (
        <h2
          id={id}
          className="text-steel-100 font-display mt-10 scroll-mt-28 text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const id = slugify(headingText(children));
      return (
        <h3
          id={id}
          className="text-steel-100 font-display mt-8 scroll-mt-28 text-xl font-semibold tracking-tight"
        >
          {children}
        </h3>
      );
    },
    h4: ({ children }) => {
      const id = slugify(headingText(children));
      return (
        <h4 id={id} className="text-steel-100 mt-6 scroll-mt-28 text-lg font-semibold">
          {children}
        </h4>
      );
    },

    // Prose
    p: ({ children }) => (
      <p className="text-steel-300 mt-4 text-base leading-relaxed first:mt-0">{children}</p>
    ),

    // Lists
    ul: ({ children }) => (
      <ul className="text-steel-300 mt-4 flex flex-col gap-2 pl-5">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="text-steel-300 mt-4 flex flex-col gap-2 pl-5 [counter-reset:list]">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="relative text-sm leading-relaxed marker:text-cyan-400">{children}</li>
    ),

    // Callout / blockquote
    blockquote: ({ children }) => (
      <blockquote className="bg-cyan-faint my-6 rounded-r-md border-l-4 border-cyan-400 py-4 pr-4 pl-5">
        <div className="text-steel-100 text-sm [&>p]:mt-0">{children}</div>
      </blockquote>
    ),

    // Inline code
    code: ({ children }) => (
      <code className="bg-bg-elevated border-steel-700 rounded border px-1.5 py-0.5 font-mono text-[0.875em] text-cyan-300">
        {children}
      </code>
    ),

    // Code block (pre wraps code)
    pre: ({ children }) => (
      <pre className="bg-bg-elevated border-steel-700 mt-6 overflow-x-auto rounded-lg border p-5 font-mono text-sm leading-relaxed">
        {children}
      </pre>
    ),

    // Horizontal rule
    hr: () => <hr className="border-steel-800 my-10" />,

    // Strong / emphasis
    strong: ({ children }) => <strong className="text-steel-100 font-semibold">{children}</strong>,
    em: ({ children }) => <em className="text-steel-200 italic">{children}</em>,

    // Links — internal use Link, external get target=_blank
    a: ({ href, children }) => {
      const isInternal = href && (href.startsWith('/') || href.startsWith('#'));
      if (isInternal) {
        return (
          <Link
            href={href}
            className="text-cyan-400 underline underline-offset-2 transition-colors duration-200 hover:text-cyan-300"
          >
            {children}
          </Link>
        );
      }
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 underline underline-offset-2 transition-colors duration-200 hover:text-cyan-300"
        >
          {children}
        </a>
      );
    },

    // Table — use JSX table syntax in MDX files (no remark-gfm needed)
    table: ({ children }) => (
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="border-steel-700 border-b">{children}</thead>,
    tbody: ({ children }) => <tbody className="divide-steel-800 divide-y">{children}</tbody>,
    th: ({ children }) => (
      <th className="text-steel-400 px-4 py-2 text-left font-mono text-[11px] tracking-[0.14em] uppercase">
        {children}
      </th>
    ),
    td: ({ children }) => <td className="text-steel-300 px-4 py-3">{children}</td>,

    // Spread caller-supplied overrides last
    ...components,
  };
}
