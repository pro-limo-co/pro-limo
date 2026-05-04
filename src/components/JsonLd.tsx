type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data);
  return (
    <script
      type="application/ld+json"
      // Schema.org JSON-LD must be inlined raw
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
