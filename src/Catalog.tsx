import { useMemo, useState } from 'react';
import type { Category, CartItem, Product } from './types';
import { CATEGORIES, CATEGORY_LABELS, formatBRL, sizesFor } from './lib';

function CategoryChips({ active, onChange }: { active: Category | 'all'; onChange: (c: Category | 'all') => void }) {
  return (
    <div className="chips">
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          className={`chip ${active === c.id ? 'chip-active' : ''}`}
          onClick={() => onChange(c.id)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

function ProductCard({ product, onDetails, onQuickAdd }: { product: Product; onDetails: () => void; onQuickAdd: () => void }) {
  return (
    <article className="card">
      <button className="card-media" onClick={onDetails} aria-label={`Ver detalhes de ${product.title}`}>
        <img src={product.images[0] ?? ''} alt={product.title} loading="lazy" />
        <span className={`cat-tag cat-${product.category}`}>{CATEGORY_LABELS[product.category]}</span>
      </button>
      <div className="card-body">
        <h3>{product.title}</h3>
        <p className="card-price">{formatBRL(product.price)}</p>
        <div className="card-actions">
          <button className="btn btn-outline" onClick={onDetails}>Ver detalhes</button>
          <button className="btn btn-primary" onClick={onQuickAdd}>Adicionar à Sacola</button>
        </div>
      </div>
    </article>
  );
}

function ProductModal({
  product,
  onClose,
  onAdd,
}: {
  product: Product;
  onClose: () => void;
  onAdd: (item: Omit<CartItem, 'key'>) => void;
}) {
  const [imageIndex, setImageIndex] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const sizes = product.sizes.length > 0 ? product.sizes : sizesFor(product.category);

  const handleAdd = () => {
    if (!size) {
      setSizeError(true);
      return;
    }
    onAdd({
      productId: product.id,
      title: product.title,
      price: product.price,
      size,
      note: note.trim(),
      qty: 1,
      image: product.images[0] ?? '',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal product-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="icon-btn modal-close" onClick={onClose} aria-label="Fechar">✕</button>
        <div className="pm-gallery">
          <div className="pm-main">
            <img src={product.images[imageIndex] ?? ''} alt={product.title} />
            {product.images.length > 1 && (
              <>
                <button
                  className="pm-arrow pm-prev"
                  onClick={() => setImageIndex((imageIndex - 1 + product.images.length) % product.images.length)}
                  aria-label="Imagem anterior"
                >
                  ‹
                </button>
                <button
                  className="pm-arrow pm-next"
                  onClick={() => setImageIndex((imageIndex + 1) % product.images.length)}
                  aria-label="Próxima imagem"
                >
                  ›
                </button>
              </>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="pm-thumbs">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  className={`pm-thumb ${idx === imageIndex ? 'pm-thumb-active' : ''}`}
                  onClick={() => setImageIndex(idx)}
                  aria-label={`Imagem ${idx + 1}`}
                >
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pm-info">
          <span className={`cat-tag cat-${product.category}`}>{CATEGORY_LABELS[product.category]}</span>
          <h2>{product.title}</h2>
          <p className="pm-price">{formatBRL(product.price)}</p>
          {product.description && <p className="pm-desc">{product.description}</p>}

          <div className="pm-sizes">
            <label>
              Tamanho <span className="required">*</span>
            </label>
            <div className="size-pills">
              {sizes.map((s) => (
                <button
                  key={s}
                  className={`size-pill ${size === s ? 'size-active' : ''}`}
                  onClick={() => {
                    setSize(s);
                    setSizeError(false);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            {sizeError && <p className="field-error">Selecione um tamanho para continuar.</p>}
          </div>

          <div className="pm-note">
            <label htmlFor="pm-note-input">Observação (opcional)</label>
            <textarea
              id="pm-note-input"
              rows={2}
              placeholder="Ex.: preferência de cor, detalhes de entrega..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button className="btn btn-primary btn-block" onClick={handleAdd}>
            Adicionar à Sacola
          </button>
        </div>
      </div>
    </div>
  );
}

export function Catalog({
  products,
  loadError,
  onAdd,
}: {
  products: Product[] | null;
  loadError: string | null;
  onAdd: (item: Omit<CartItem, 'key'>) => void;
}) {
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [selected, setSelected] = useState<Product | null>(null);

  const filtered = useMemo(
    () => (products ?? []).filter((p) => category === 'all' || p.category === category),
    [products, category],
  );

  const quickAdd = (product: Product) => {
    const sizes = product.sizes.length > 0 ? product.sizes : sizesFor(product.category);
    // Quick add uses the first available size; the customer can adjust it in the modal.
    onAdd({
      productId: product.id,
      title: product.title,
      price: product.price,
      size: sizes[0] ?? 'P',
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
      </section>

      <div className="chips-bar">
        <div className="chips-inner">
          <CategoryChips active={category} onChange={setCategory} />
        </div>
      </div>

      {loadError && <p className="catalog-error">{loadError}</p>}
      {!loadError && products === null && <div className="catalog-loading">Carregando catálogo...</div>}
      {!loadError && products !== null && filtered.length === 0 && (
        <div className="catalog-empty">
          <p>Nenhum produto nesta categoria ainda.</p>
          <p className="muted">Novidades chegam em breve — volte logo!</p>
        </div>
      )}

      <div className="grid">
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onDetails={() => setSelected(p)}
            onQuickAdd={() => quickAdd(p)}
          />
        ))}
      </div>

      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} onAdd={onAdd} />}
    </main>
  );
}
