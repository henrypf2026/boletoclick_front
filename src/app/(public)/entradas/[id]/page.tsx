import EntradaContent from './EntradaContent';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ d?: string | string[] }>;
};

export default async function EntradaPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const raw = query.d;
  const encoded = Array.isArray(raw) ? raw[0] ?? null : raw ?? null;

  return <EntradaContent ticketId={id} encoded={encoded} />;
}
