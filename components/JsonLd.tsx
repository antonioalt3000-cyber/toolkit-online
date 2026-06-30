import type { Thing, WithContext } from 'schema-dts';

/**
 * Renders a JSON-LD structured-data block.
 *
 * `data` is always a typed schema object built in lib/schema.ts (never user
 * input), so dangerouslySetInnerHTML here is the standard, safe JSON-LD pattern
 * — JSON.stringify escapes the payload. Server component (no client JS).
 */
export default function JsonLd<T extends Thing>({ data }: { data: WithContext<T> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
