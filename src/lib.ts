import type { Category, Product } from './types';

// Public browser configuration (publish injects the VITE_ variables; the
// fallback values are the project's public Supabase URL and publishable key).
const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ??
  'https://supabase-api-prod.verdent.ai/p/pa39cf51a78a3616976da';
const SUPABASE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoyMTA2MzA4MDg2LCJpYXQiOjE3OTA2ODg4ODYsImlzcyI6InN1cGFiYXNlIiwicHJvamVjdF9yZWYiOiJwYTM5Y2Y1MWE3OGEzNjE2OTc2ZGEiLCJyb2xlIjoiYW5vbiJ9.HF_ycuoX4SEkqJ0t0fXqNnQLcQzMbAAKUCsNvDe3APQ';

const anonHeaders = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
};

export const CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'Ver Todos' },
  { id: 'infantil', label: 'Linha Infantil' },
  { id: 'jovem', label: 'Linha Jovem' },
  { id: 'adulto', label: 'Linha Adulto' },
  { id: 'uv', label: 'UV Manga Longa' },
];

export const CATEGORY_LABELS: Record<Category, string> = {
  infantil: 'Linha Infantil',
  jovem: 'Linha Jovem',
  adulto: 'Linha Adulto',
  uv: 'UV Manga Longa',
};

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function normalizeProduct(raw: any): Product {
  return {
    id: String(raw.id),
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    price: Number(raw.price ?? 0),
    category: raw.category as Category,
    images: Array.isArray(raw.images) ? raw.images.map(String) : JSON.parse(raw.images ?? '[]'),
    sizes: Array.isArray(raw.sizes) ? raw.sizes.map(String) : JSON.parse(raw.sizes ?? '[]'),
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`, {
    headers: anonHeaders,
  });
  if (!res.ok) throw new Error('Erro ao carregar produtos');
  return ((await res.json()) as any[]).map(normalizeProduct);
}

export async function fetchWhatsappNumber(): Promise<string> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/settings?select=key,value&key=eq.whatsapp_number`,
    { headers: anonHeaders },
  );
  if (!res.ok) return '5500999999999';
  const rows = (await res.json()) as { key: string; value: string }[];
  return rows[0]?.value || '5500999999999';
}

export function buildWhatsappLink(
  number: string,
  items: { qty: number; title: string; size: string; color: string; estampa: string; note: string; price: number }[],
): string {
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  const lines = items.map((i) => {
    let line = `- ${i.qty}x ${i.title} (Tamanho: ${i.size} · Cor: ${i.color}${i.estampa ? ` · Estampa: ${i.estampa}` : ''}) - ${formatBRL(i.qty * i.price)}`;
    if (i.note) line += `\n   Obs: ${i.note}`;
    return line;
  });
  const message = [
    'Olá! Gostaria de fazer o seguinte pedido no catálogo DZAMP:',
    '',
    ...lines,
    '',
    `Total do Pedido: ${formatBRL(total)}`,
  ].join('\n');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
