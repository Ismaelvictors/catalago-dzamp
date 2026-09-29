insert into public.products (title, description, price, category, images, sizes) values
(
  'Camiseta Infantil DZAMP Classic',
  'Camiseta infantil em malha premium com acabamento reforçado. Conforto e estilo para o dia a dia.',
  49.90,
  'infantil',
  '["/images/infantil-1.jpg"]'::jsonb,
  '["PP"]'::jsonb
),
(
  'Moletom Infantil DZAMP Navy',
  'Moletom infantil macio e aquecido, ideal para os dias mais frescos com a atitude DZAMP.',
  89.90,
  'infantil',
  '["/images/infantil-2.jpg"]'::jsonb,
  '["PP"]'::jsonb
),
(
  'Camiseta Adulto Premium Preta',
  'Camiseta em algodão premium, modelagem moderna e toque suave. Um clássico DZAMP.',
  69.90,
  'jovem_adulto',
  '["/images/adulto-1.jpg"]'::jsonb,
  '["P","M","G","GG"]'::jsonb
),
(
  'Polo DZAMP Vermelha',
  'Polo clássica em piquet premium, com detalhes bordados. Elegância esportiva.',
  99.90,
  'jovem_adulto',
  '["/images/adulto-2.jpg"]'::jsonb,
  '["P","M","G","GG"]'::jsonb
),
(
  'Manga Longa Proteção UV Branca',
  'Camiseta manga longa com proteção UV, tecido leve e de secagem rápida. Unissex.',
  89.90,
  'protecao_uv',
  '["/images/uv-1.jpg"]'::jsonb,
  '["P","M","G","GG"]'::jsonb
),
(
  'Manga Longa Proteção UV Cinza (Unissex)',
  'Proteção solar com estilo: tecido técnico leve, ideal para esportes ao ar livre. Unissex.',
  89.90,
  'protecao_uv',
  '["/images/uv-2.jpg"]'::jsonb,
  '["P","M","G","GG"]'::jsonb
);
