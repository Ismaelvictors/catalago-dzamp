import { useEffect, useState } from 'react';
import type { Category, Product } from './types';
import {
  adminCall,
  adminLogin,
  CATEGORY_LABELS,
  fileToDataUrl,
  fetchWhatsappNumber,
  formatBRL,
  getAdminPassword,
  logoutAdmin,
  normalizeProduct,
  sizesFor,
} from './lib';

type AdminTab = 'products' | 'settings';

interface DraftProduct {
  id: string | null;
  title: string;
  price: string;
  description: string;
  category: Category;
  images: string[];
  sizes: string[];
}

function emptyDraft(category: Category = 'infantil'): DraftProduct {
  return {
    id: null,
    title: '',
    price: '',
    description: '',
    category,
    images: [],
    sizes: sizesFor(category),
  };
}

function ProductForm({
  draft,
  onClose,
  onSaved,
}: {
  draft: DraftProduct;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<DraftProduct>(draft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const set = (patch: Partial<DraftProduct>) => setForm((f) => ({ ...f, ...patch }));

  const onCategoryChange = (category: Category) => {
    set({ category, sizes: sizesFor(category) });
  };

  const addImageUrl = () => {
    const url = imageUrl.trim();
    if (!url) return;
    set({ images: [...form.images, url] });
    setImageUrl('');
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const dataUrl = await fileToDataUrl(file);
        const res = await adminCall('upload_image', { data: dataUrl });
        urls.push(res.url as string);
      }
      set({ images: [...form.images, ...urls] });
    } catch (e) {
      setError(`Falha no upload: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setError(null);
    const price = Number(form.price.replace(',', '.'));
    if (!form.title.trim() || !Number.isFinite(price) || price <= 0 || form.sizes.length === 0) {
      setError('Preencha título, preço válido e ao menos um tamanho.');
      return;
    }
    setSaving(true);
    try {
      const product = {
        title: form.title.trim(),
        description: form.description.trim(),
        price,
        category: form.category,
        images: form.images,
        sizes: form.sizes,
      };
      if (form.id) {
        await adminCall('update_product', { id: form.id, product });
      } else {
        await adminCall('create_product', { product });
      }
      onSaved();
    } catch (e) {
      setError(`Erro ao salvar: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const allSizes = ['PP', 'P', 'M', 'G', 'GG'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal admin-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="icon-btn modal-close" onClick={onClose} aria-label="Fechar">✕</button>
        <h2>{form.id ? 'Editar produto' : 'Novo produto'}</h2>

        <div className="form-grid">
          <label className="field">
            Título *
            <input value={form.title} onChange={(e) => set({ title: e.target.value })} />
          </label>
          <label className="field">
            Preço (R$) *
            <input
              value={form.price}
              onChange={(e) => set({ price: e.target.value })}
              inputMode="decimal"
              placeholder="0,00"
            />
          </label>
          <label className="field">
            Categoria *
            <select value={form.category} onChange={(e) => onCategoryChange(e.target.value as Category)}>
              <option value="infantil">Linha Infantil</option>
              <option value="jovem_adulto">Linha Jovem / Adulto</option>
              <option value="protecao_uv">Proteção UV (Unissex)</option>
            </select>
          </label>
          <div className="field">
            Tamanhos disponíveis *
            <div className="size-pills">
              {allSizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`size-pill ${form.sizes.includes(s) ? 'size-active' : ''}`}
                  onClick={() =>
                    set({
                      sizes: form.sizes.includes(s)
                        ? form.sizes.filter((x) => x !== s)
                        : [...form.sizes, s],
                    })
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <label className="field field-wide">
            Descrição
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
            />
          </label>
          <div className="field field-wide">
            Imagens
            <div className="image-add-row">
              <input
                placeholder="Cole a URL de uma imagem..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <button type="button" className="btn btn-outline" onClick={addImageUrl}>
                Adicionar URL
              </button>
              <label className="btn btn-outline file-btn">
                {uploading ? 'Enviando...' : 'Enviar arquivos'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  hidden
                  onChange={(e) => onFiles(e.target.files)}
                />
              </label>
            </div>
            {form.images.length > 0 && (
              <div className="image-list">
                {form.images.map((img, idx) => (
                  <div className="image-item" key={idx}>
                    <img src={img} alt={`Imagem ${idx + 1}`} />
                    <button
                      type="button"
                      className="image-remove"
                      onClick={() => set({ images: form.images.filter((_, i) => i !== idx) })}
                      aria-label="Remover imagem"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && <p className="field-error">{error}</p>}
        <div className="form-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar produto'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Admin({
  onProductsChanged,
  onWhatsappChanged,
}: {
  onProductsChanged: () => void;
  onWhatsappChanged: (n: string) => void;
}) {
  const [authed, setAuthed] = useState<boolean>(() => getAdminPassword() !== null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [tab, setTab] = useState<AdminTab>('products');
  const [products, setProducts] = useState<Product[] | null>(null);
  const [editing, setEditing] = useState<DraftProduct | null>(null);
  const [whatsapp, setWhatsapp] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    if (!authed) return;
    adminCall('list_products')
      .then((rows: any[]) => setProducts(rows.map(normalizeProduct)))
      .catch(() => setProducts([]));
  }, [authed]);

  useEffect(() => {
    if (!authed) return;
    fetchWhatsappNumber()
      .then(setWhatsapp)
      .catch(() => {});
  }, [authed]);

  const tryLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const ok = await adminLogin(password);
    if (ok) {
      setAuthed(true);
      setPassword('');
    } else {
      setLoginError('Senha incorreta. Tente novamente.');
    }
  };

  const removeProduct = async (p: Product) => {
    if (!window.confirm(`Excluir "${p.title}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await adminCall('delete_product', { id: p.id });
      setProducts((prev) => prev?.filter((x) => x.id !== p.id) ?? null);
      onProductsChanged();
    } catch (e) {
      window.alert(`Erro ao excluir: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const saveSettings = async () => {
    setSettingsSaved(false);
    setSettingsError(null);
    try {
      await adminCall('set_whatsapp', { value: whatsapp });
      setSettingsSaved(true);
      onWhatsappChanged(whatsapp.replace(/\D/g, ''));
    } catch (e) {
      setSettingsError(`Erro ao salvar: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  if (!authed) {
    return (
      <main className="admin-login-wrap">
        <form className="admin-login" onSubmit={tryLogin}>
          <p className="brand-small">
            D<span className="brand-z">Z</span>AMP <span className="muted">· Área Administrativa</span>
          </p>
          <h1>Acesso restrito</h1>
          <input
            type="password"
            placeholder="Senha do administrador"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {loginError && <p className="field-error">{loginError}</p>}
          <button className="btn btn-primary btn-block" type="submit">Entrar</button>
          <a className="muted back-link" href="#/">← Voltar ao catálogo</a>
        </form>
      </main>
    );
  }

  return (
    <main className="admin">
      <div className="admin-head">
        <h1>Painel Administrativo</h1>
        <button
          className="btn btn-outline"
          onClick={() => {
            logoutAdmin();
            setAuthed(false);
          }}
        >
          Sair
        </button>
      </div>

      <div className="admin-tabs">
        <button className={tab === 'products' ? 'tab-active' : ''} onClick={() => setTab('products')}>
          Produtos
        </button>
        <button className={tab === 'settings' ? 'tab-active' : ''} onClick={() => setTab('settings')}>
          Configurações
        </button>
      </div>

      {tab === 'products' && (
        <section className="admin-products">
          <div className="admin-products-head">
            <span className="muted">{products ? `${products.length} produto(s)` : 'Carregando...'}</span>
            <button className="btn btn-primary" onClick={() => setEditing(emptyDraft())}>
              + Novo produto
            </button>
          </div>
          {products && products.length === 0 && <p className="muted">Nenhum produto cadastrado ainda.</p>}
          <div className="admin-list">
            {(products ?? []).map((p) => (
              <div className="admin-row" key={p.id}>
                <img src={p.images[0] ?? ''} alt="" className="admin-thumb" />
                <div className="admin-row-info">
                  <strong>{p.title}</strong>
                  <span className="muted">
                    {CATEGORY_LABELS[p.category]} · {formatBRL(p.price)} · Tamanhos: {p.sizes.join(', ')}
                  </span>
                </div>
                <div className="admin-row-actions">
                  <button
                    className="btn btn-outline"
                    onClick={() =>
                      setEditing({
                        id: p.id,
                        title: p.title,
                        price: String(p.price),
                        description: p.description,
                        category: p.category,
                        images: [...p.images],
                        sizes: [...p.sizes],
                      })
                    }
                  >
                    Editar
                  </button>
                  <button className="btn btn-danger" onClick={() => removeProduct(p)}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'settings' && (
        <section className="admin-settings">
          <h2>Número do WhatsApp</h2>
          <p className="muted">
            Número (com DDI e DDD, apenas dígitos) que receberá os pedidos finalizados no catálogo.
            Ex.: 5500999999999
          </p>
          <div className="settings-row">
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              inputMode="numeric"
              placeholder="5500999999999"
            />
            <button className="btn btn-primary" onClick={saveSettings}>Salvar</button>
          </div>
          {settingsSaved && <p className="field-success">Número atualizado com sucesso.</p>}
          {settingsError && <p className="field-error">{settingsError}</p>}
        </section>
      )}

      {editing && (
        <ProductForm
          draft={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            adminCall('list_products')
              .then((rows: any[]) => setProducts(rows.map(normalizeProduct)))
              .catch(() => {});
            onProductsChanged();
          }}
        />
      )}
    </main>
  );
}
