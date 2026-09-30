import { useMemo, useState } from 'react';
import type { Category, CartItem, Product } from './types';
import { CATEGORIES, CATEGORY_LABELS, formatBRL } from './lib';
import { lineFor, sizesFor } from './lines';

export function CategoryChips({ active, onChange }: { active: Category | 'all'; onChange: (c: Category | 'all') => void }) {
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

function ColorSelect({ value, colors, onChange, id }: { value: string; colors: { name: string; hex: string }[]; onChange: (v: string) => void; id: string }) {
  const active = colors.find((c) => c.name === value);
  return (
    <div className="select-field">
      <label htmlFor={id}>Cor</label>
      <div className="select-wrap">
        {active && <span className="select-dot" style={{ background: active.hex }} aria-hidden="true" />}
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
          {colors.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function EstampaSelect({ value, estampas, onChange, id }: { value: string; estampas: string[]; onChange: (v: string) => void; id: string }) {
  return (
    <div className="select-field">
      <label htmlFor={id}>Estampa</label>
      <div className="select-wrap">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
          {estampas.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function SizePills({ sizes, value, onChange, error, note }: { sizes: string[]; value: string | null; onChange: (s: string) => void; error?: boolean; note?: string }) {
  return (
    <div className={`size-block ${error ? 'size-block-error' : ''}`}>
      <div className="size-pills">
        {sizes.map((s) => (
          <button key={s} className={`size-pill ${value === s ? 'size-active' : ''}`} onClick={() => onChange(s)}>
            {s}
          </button>
        ))}
      </div>
      {note && <p className="size-note">{note}</p>}
    </div>
  );
}

function QtyStepper({ value, onChange, small }: { value: number; onChange: (q: number) => void; small?: boolean }) {
  return (
    <div className={`qty-stepper ${small ? 'qty-stepper-sm' : ''}`}>
      <button onClick={() => onChange(Math.max(1, value - 1))} aria-label="Diminuir quantidade">−</button>
      <span>{value}</span>
      <button onClick={() => onChange(Math.min(99, value + 1))} aria-label="Aumentar quantidade">+</button>
    </div>
  );
}

export function ProductCard({ product, onDetails, onAdd }: { product: Product; onDetails: () => void; onAdd: (item: Omit<CartItem, 'key'>) => void }) {
  const line = lineFor(product.category);
  const [color, setColor] = useState(line.colors[0].name);
  const [estampa, setEstampa] = useState(line.estampas[0] ?? '');
  const [size, setSize] = useState<string | null>(line.sizes.length === 1 ? line.sizes[0] : null);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const sizes = sizesFor(product.category);

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
      color,
      estampa: line.hasEstampa ? estampa : '',
      note: '',
      qty,
      image: product.images[0] ?? '',
    });
    setSize(line.sizes.length === 1 ? line.sizes[0] : null);
    setQty(1);
    setSizeError(false);
  };

  return (
    <article className="card">
      <button className="card-media" onClick={onDetails} aria-label={`Ver detalhes de ${product.title}`}>
        <img src={product.images[0] ?? ''} alt={product.title} loading="lazy" />
        <span className={`cat-tag cat-${product.category}`}>{CATEGORY_LABELS[product.category]}</span>
      </button>
      <div className="card-body">
        <h3>{product.title}</h3>
        <p className="card-price">{formatBRL(product.price)}</p>

        <div className="card-selects">
          <ColorSelect id={`card-color-${product.id}`} value={color} colors={line.colors} onChange={setColor} />
          {line.hasEstampa && (
            <EstampaSelect id={`card-estampa-${product.id}`} value={estampa} estampas={line.estampas} onChange={setEstampa} />
          )}
          <SizePills
            sizes={sizes}
            value={size}
            onChange={(s) => {
              setSize(s);
              setSizeError(false);
            }}
            error={sizeError}
            note={sizeError ? 'Selecione um tamanho.' : undefined}
          />
          <div className="card-buy-row">
            <QtyStepper value={qty} onChange={setQty} small />
            <button className="btn btn-primary card-add" onClick={handleAdd}>
              Adicionar
            </button>
          </div>
          <button className="card-details-link" onClick={onDetails}>
            Ver detalhes
          </button>
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
  const line = lineFor(product.category);
  const [imageIndex, setImageIndex] = useState(0);
  const [color, setColor] = useState(line.colors[0].name);
  const [estampa, setEstampa] = useState(line.estampas[0] ?? '');
  const [size, setSize] = useState<string | null>(line.sizes.length === 1 ? line.sizes[0] : null);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const sizes = sizesFor(product.category);

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
      color,
      estampa: line.hasEstampa ? estampa : '',
      note: note.trim(),
      qty,
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

          <div className="pm-options">
            <ColorSelect id={`pm-color`} value={color} colors={line.colors} onChange={setColor} />
            {line.hasEstampa && (
              <EstampaSelect id={`pm-estampa`} value={estampa} estampas={line.estampas} onChange={setEstampa} />
            )}
          </div>

          <div className="pm-sizes">
            <label>
              Tamanho <span className="required">*</span>
            </label>
            <SizePills
              sizes={sizes}
              value={size}
              onChange={(s) => {
                setSize(s);
                setSizeError(false);
              }}
              error={sizeError}
              note={line.sizesNote ?? (sizeError ? 'Selecione um tamanho para continuar.' : undefined)}
            />
            {sizeError && !line.sizesNote && <p className="field-error">Selecione um tamanho para continuar.</p>}
          </div>

          <div className="pm-qty">
            <label>Quantidade</label>
            <QtyStepper value={qty} onChange={setQty} />
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

export function CatalogPage({
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
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(
    () => (products ?? []).filter((p) => category === 'all' || p.category === category),
    [products, category],
  );

  return (
    <main className="catalog">
      <div className="chips-bar">
        <CategoryChips active={category} onChange={setCategory} />
      </div>

      <button className="filter-btn" onClick={() => setFilterOpen(true)}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 5h18l-7 8v5l-4 2v-7L3 5Z" />
        </svg>
        Filtrar{category !== 'all' ? ` · ${CATEGORY_LABELS[category]}` : ''}
      </button>

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
            onAdd={onAdd}
          />
        ))}
      </div>

      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} onAdd={onAdd} />}

      <div className={`overlay ${filterOpen ? 'show' : ''}`} onClick={() => setFilterOpen(false)} />
      <aside className={`filter-sheet ${filterOpen ? 'open' : ''}`} aria-hidden={!filterOpen}>
        <div className="cart-head">
          <h2>Filtrar por</h2>
          <button className="icon-btn" onClick={() => setFilterOpen(false)} aria-label="Fechar filtros">✕</button>
        </div>
        <div className="filter-sheet-body">
          <CategoryChips
            active={category}
            onChange={(c) => {
              setCategory(c);
              setFilterOpen(false);
            }}
          />
        </div>
        <div className="filter-sheet-foot">
          <button className="apply-btn" onClick={() => setFilterOpen(false)}>Aplicar</button>
        </div>
      </aside>
    </main>
  );
}
