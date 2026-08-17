import { serializeJsonLd } from '@/lib/schema';

/**
 * Renders a JSON-LD graph. Content is serialised from real objects with `<`
 * escaped, so malformed or entity-encoded markup can never reach the output.
 */
export function JsonLd({ data, id }: { data: unknown; id?: string }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      // Serialised from a plain object; `<` is escaped in serializeJsonLd.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
