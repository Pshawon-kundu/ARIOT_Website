interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Renders a `<script type="application/ld+json">` tag for structured data.
 * Used by all JSON-LD schema components to inject schema.org markup into
 * the page `<head>` without touching the layout tree.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
