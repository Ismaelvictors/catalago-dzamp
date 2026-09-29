import type { CartItem, Product } from './types';
import { ProductCard } from './Catalog';

export function HomePage({
  products,
  loadError,
  onAdd,
}: {
  products: Product[] | null;
  loadError: string | null;
  onAdd: (item: Omit<CartItem, 'key'>) => void;
}) {
  const featured = (products ?? []).slice(0, 4);

  const quickAdd = (product: Product) => {
    onAdd({
      productId: product.id,
      title: product.title,
      price: product.price,
      size: (product.sizes[0] ?? 'P') as string,
      note: '',
      qty: 1,
      image: product.images[0] ?? '',
    });
  };

  return (
    <main className="catalog">
      <section className="hero">
        <p className="hero-eyebrow">Vestuário Esportivo Premium</p>
        <h1>
          Estilo, performance
          <br />e proteção para todos.
        </h1>
        <p className="hero-copy">
          Explore as coleções DZAMP: linha infantil, jovem/adulto e camisetas com proteção UV.
          Escolha, monte sua sacola e finalize pelo WhatsApp.
        </p>
        <a className="btn btn-primary hero-cta" href="#/catalogo">
          Ver catálogo completo
        </a>
      </section>

      <section className="home-featured">
        <div className="section-head">
          <h2>Destaques DZAMP</h2>
          <a className="see-all" href="#/catalogo">Ver todos →</a>
        </div>

        {loadError && <p className="catalog-error">{loadError}</p>}
        {!loadError && products === null && <div className="catalog-loading">Carregando destaques...</div>}
        {!loadError && products !== null && featured.length === 0 && (
          <p className="muted">Nenhuma peça cadastrada ainda — em breve novidades por aqui.</p>
        )}

        <div className="grid">
          {featured.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onDetails={() => (window.location.hash = '#/catalogo')}
              onQuickAdd={() => quickAdd(p)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
