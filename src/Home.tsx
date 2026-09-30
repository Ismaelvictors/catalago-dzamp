import { useEffect, useRef, useState } from 'react';
import type { CartItem, Product } from './types';
import { ProductCard } from './Catalog';

const CAROUSEL_IMAGES = [
  '/images/carousel/carousel-1.jpg',
  '/images/carousel/carousel-2.jpg',
  '/images/carousel/carousel-3.jpg',
  '/images/carousel/carousel-4.jpg',
];

function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (paused) return;
    timer.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % CAROUSEL_IMAGES.length);
    }, 4000);
    return () => {
      if (timer.current !== null) window.clearInterval(timer.current);
    };
  }, [paused]);

  return (
    <div
      className="hero-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="hc-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {CAROUSEL_IMAGES.map((src, i) => (
          <div className="hc-slide" key={src} aria-hidden={i !== index}>
            <img src={src} alt={`DZAMP coleção ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} />
          </div>
        ))}
      </div>
      <div className="hc-dots" role="tablist" aria-label="Slides do carrossel">
        {CAROUSEL_IMAGES.map((src, i) => (
          <button
            key={src}
            className={`hc-dot ${i === index ? 'hc-dot-active' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`Ir para o slide ${i + 1}`}
            aria-selected={i === index}
            role="tab"
          />
        ))}
      </div>
    </div>
  );
}

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

  return (
    <main className="catalog">
      <section className="hero">
        <p className="hero-eyebrow">Moda Masculina</p>
        <h1>Estilo, conforto e elegância</h1>
        <p className="hero-copy">
          Para os pequenos passos e as grandes conquistas.
          <br />
          Confira nosso catálogo completo e à pronta entrega.
        </p>
        <a className="btn btn-primary hero-cta" href="#/catalogo">
          Ver catálogo completo
        </a>
      </section>

      <section className="hero-carousel-wrap">
        <HeroCarousel />
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
              onAdd={onAdd}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
