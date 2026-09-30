import { useEffect, useMemo, useState } from 'react';
import type { CartItem, Product } from './types';
import { buildWhatsappLink, fetchProducts, fetchWhatsappNumber, formatBRL } from './lib';
import { HomePage } from './Home';
import { CatalogPage } from './Catalog';
import { ContactsPage } from './Contacts';

const CART_KEY = 'dzamp_cart';

type Route = 'home' | 'catalogo' | 'contatos';

function parseRoute(): Route {
  const hash = window.location.hash;
  if (hash.startsWith('#/catalogo')) return 'catalogo';
  if (hash.startsWith('#/contatos')) return 'contatos';
  return 'home';
}

function loadCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]') as CartItem[];
  } catch {
    return [];
  }
}

function Header({ route, cartCount, onCartClick }: { route: Route; cartCount: number; onCartClick: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links: { to: string; label: string; key: Route }[] = [
    { to: '#/', label: 'Home', key: 'home' },
    { to: '#/catalogo', label: 'Catálogo', key: 'catalogo' },
    { to: '#/contatos', label: 'Contatos', key: 'contatos' },
  ];

  return (
    <header className="header">
      <div className="header-card">
        <div className="header-left">
          <a
            href="#/"
            className="header-logo"
            onClick={() => {
              if (route !== 'home') window.location.hash = '#/';
            }}
          >
            <img src="/images/logo.png" alt="DZAMP" />
          </a>
          <nav className="header-nav">
            {links.map((l) => (
              <a key={l.key} href={l.to} className={route === l.key ? 'active' : ''}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="header-actions">
          <button className="sacola-btn" onClick={onCartClick} aria-label="Abrir sacola">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 7h12l-1.2 12.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 7Z" />
              <path d="M9 7V5a3 3 0 0 1 6 0v2" />
            </svg>
            {cartCount > 0 && <span className="sacola-badge">{cartCount}</span>}
          </button>
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className={`overlay ${menuOpen ? 'show' : ''}`} onClick={() => setMenuOpen(false)} />
      <aside className={`mobile-menu ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <div className="cart-head">
          <h2>Menu</h2>
          <button className="icon-btn" onClick={() => setMenuOpen(false)} aria-label="Fechar menu">✕</button>
        </div>
        <nav className="mobile-menu-nav">
          {links.map((l) => (
            <a
              key={l.key}
              href={l.to}
              className={route === l.key ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </nav>
      </aside>
    </header>
  );
}

function CartDrawer({
  open,
  items,
  whatsappNumber,
  onClose,
  onUpdateQty,
  onRemove,
}: {
  open: boolean;
  items: CartItem[];
  whatsappNumber: string;
  onClose: () => void;
  onUpdateQty: (key: string, delta: number) => void;
  onRemove: (key: string) => void;
}) {
  const total = useMemo(() => items.reduce((s, i) => s + i.qty * i.price, 0), [items]);

  return (
    <>
      <div className={`overlay ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`cart-drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="cart-head">
          <h2>Sua Sacola</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar sacola">✕</button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Sua sacola está vazia.</p>
            <p className="muted">Explore o catálogo e adicione seus produtos favoritos.</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div className="cart-item" key={item.key}>
                  <img src={item.image} alt={item.title} className="cart-thumb" />
                  <div className="cart-item-info">
                    <strong>{item.title}</strong>
                    <span className="muted">
                      Tamanho: {item.size} · Cor: {item.color}
                      {item.estampa ? ` · Estampa: ${item.estampa}` : ''}
                    </span>
                    {item.note && <span className="muted cart-note">Obs: {item.note}</span>}
                    <div className="qty-row">
                      <button className="qty-btn" onClick={() => onUpdateQty(item.key, -1)} aria-label="Diminuir">−</button>
                      <span>{item.qty}</span>
                      <button className="qty-btn" onClick={() => onUpdateQty(item.key, 1)} aria-label="Aumentar">+</button>
                      <button className="link-danger" onClick={() => onRemove(item.key)}>Remover</button>
                    </div>
                  </div>
                  <div className="cart-item-price">{formatBRL(item.qty * item.price)}</div>
                </div>
              ))}
            </div>
            <div className="cart-foot">
              <div className="subtotal">
                <span>Subtotal</span>
                <strong>{formatBRL(total)}</strong>
              </div>
              <a
                className="btn-whatsapp"
                href={buildWhatsappLink(whatsappNumber, items)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Finalizar Pedido via WhatsApp
              </a>
              <p className="muted cart-hint">Você será direcionado ao WhatsApp para confirmar seu pedido.</p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

export function App() {
  const [route, setRoute] = useState<Route>(parseRoute);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('5500999999999');

  useEffect(() => {
    const onHash = () => {
      setRoute(parseRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setLoadError('Não foi possível carregar o catálogo. Tente recarregar a página.'));
    fetchWhatsappNumber().then(setWhatsappNumber).catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'key'>) => {
    const key = `${item.productId}|${item.size}|${item.color}|${item.estampa}|${item.note}`;
    setCart((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, key }];
    });
    setCartOpen(true);
  };

  const updateQty = (key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.key === key ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0),
    );
  };

  const removeItem = (key: string) => setCart((prev) => prev.filter((i) => i.key !== key));

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="app">
      <Header route={route} cartCount={cartCount} onCartClick={() => setCartOpen(true)} />

      {route === 'home' && (
        <HomePage products={products} loadError={loadError} onAdd={addToCart} />
      )}
      {route === 'catalogo' && (
        <CatalogPage products={products} loadError={loadError} onAdd={addToCart} />
      )}
      {route === 'contatos' && <ContactsPage whatsappNumber={whatsappNumber} />}

      <CartDrawer
        open={cartOpen}
        items={cart}
        whatsappNumber={whatsappNumber}
        onClose={() => setCartOpen(false)}
        onUpdateQty={updateQty}
        onRemove={removeItem}
      />

      <footer className="footer">
        <span className="brand-footer">
          D<span className="brand-z">Z</span>AMP
        </span>
        <span className="muted">Catálogo digital · Estilo e atitude em cada detalhe.</span>
      </footer>
    </div>
  );
}
