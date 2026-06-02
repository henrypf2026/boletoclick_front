const unsplash = (id: string) => `https://images.unsplash.com/${id}?w=800&q=70`;

/**
 * Imagenes tematicas por categoria. Las usadas por categorias con datos reales
 * (partidos, conciertos, mma, otros) son URLs ya confirmadas en la DB de venues.
 * Si alguna falla, EventCard cae a la imagen del venue y luego al gradiente.
 */
const CATEGORY_IMAGE_POOLS: Record<string, string[]> = {
  partidos: [
    unsplash('photo-1574629810360-7efbbe195018'),
    unsplash('photo-1508098682722-e99c43a406b2'),
    unsplash('photo-1624806941196-857cbbf040b2'),
    unsplash('photo-1540747737956-37872e7e5292'),
    unsplash('photo-1522771739844-6a9f6d5f14af'),
  ],
  conciertos: [
    unsplash('photo-1470225620780-dba8ba36b745'),
    unsplash('photo-1465847899084-d164df4dedc6'),
    unsplash('photo-1516450360452-9312f5e86fc7'),
  ],
  'festivales-de-musica': [
    unsplash('photo-1470225620780-dba8ba36b745'),
    unsplash('photo-1465847899084-d164df4dedc6'),
    unsplash('photo-1459749411175-04bf5292ceea'),
  ],
  'fiestas-y-vida-nocturna': [
    unsplash('photo-1516450360452-9312f5e86fc7'),
    unsplash('photo-1566737236500-c8ac43014a67'),
  ],
  mma: [
    unsplash('photo-1514525253161-7a46d19cd819'),
    unsplash('photo-1599058917212-d750089bc07e'),
  ],
  'teatro-y-opera': [
    unsplash('photo-1503095396549-807759245b35'),
    unsplash('photo-1501281668745-f7f57925c3b4'),
  ],
  'cine-y-documentales': [
    unsplash('photo-1501281668745-f7f57925c3b4'),
    unsplash('photo-1517604931442-7e0c8ed2963c'),
  ],
  'stand-up-comedy': [
    unsplash('photo-1507676184212-d03ab07a01bf'),
    unsplash('photo-1585699324551-f6c309eedeca'),
  ],
  'e-sports-y-gaming': [
    unsplash('photo-1542751371-adc38448a05e'),
    unsplash('photo-1511512578047-dfb367046420'),
  ],
  'conferencias-y-negocios': [
    unsplash('photo-1501281668745-f7f57925c3b4'),
    unsplash('photo-1505373877841-8d25f7d46678'),
  ],
  'gastronomia-y-catas': [
    unsplash('photo-1414235077428-338989a2e8c0'),
    unsplash('photo-1517248135467-4c7edcad34c4'),
  ],
  'cursos-y-talleres': [
    unsplash('photo-1524178232363-1fb2b075b655'),
    unsplash('photo-1531482615713-2afd69097998'),
  ],
  'ferias-y-exposiciones': [
    unsplash('photo-1540575467063-178a50c2df87'),
    unsplash('photo-1492684223066-81342ee5ff30'),
  ],
  otros: [
    unsplash('photo-1470225620780-dba8ba36b745'),
    unsplash('photo-1507676184212-d03ab07a01bf'),
  ],
};

function hashString(value = ''): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Devuelve una imagen acorde a la categoria. El `seed` (id del evento) garantiza
 * que cada evento reciba siempre la misma imagen, con variedad dentro de la categoria.
 */
export function getCategoryImage(categorySlug: string, seed = ''): string | null {
  const pool = CATEGORY_IMAGE_POOLS[categorySlug] ?? CATEGORY_IMAGE_POOLS.otros;
  if (!pool.length) return null;
  return pool[hashString(seed) % pool.length];
}
