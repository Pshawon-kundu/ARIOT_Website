import {
  Children,
  cloneElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils/cn';

interface FeatureGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Column count at the largest breakpoint. Mobile is always 1-up. */
  columns?: 2 | 3 | 4;
}

const columnClass = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
} as const;

/**
 * FeatureGrid — responsive CSS grid wrapper for FeatureCards.
 * Mobile-first: 1 column on phones, 2 on small tablets, then the
 * configured count on desktop.
 *
 * Use the `auto-rows-fr` rule to let cards in a row stretch to a
 * uniform height even when descriptions vary in length.
 */
export function FeatureGrid({ className, columns = 3, children, ...props }: FeatureGridProps) {
  const items = Children.toArray(children);
  return (
    <div
      className={cn(
        'grid auto-rows-fr grid-cols-1 gap-4 md:gap-6',
        columnClass[columns],
        className,
      )}
      {...props}
    >
      {Children.map(items, (child, index) =>
        isValidCard(child)
          ? cloneElement(child as ReactElement<Record<string, unknown>>, {
              index: Math.min(index, 6),
            })
          : child,
      )}
    </div>
  );
}

function isValidCard(child: ReactNode): child is ReactElement {
  return typeof child === 'object' && child !== null && 'props' in child && 'type' in child;
}
