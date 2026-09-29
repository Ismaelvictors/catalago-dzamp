import { useState } from 'react';
import type { FormEvent } from 'react';

const CONTACT_EMAIL = 'victors.testes.dev@gmail.com';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function ContactsPage({ whatsappNumber }: { whatsappNumber: string }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.replace(/\D/g, '');
    if (!name || !email.includes('@') || phone.length < 10) {
      setError('Preencha nome, e-mail válido e WhatsApp com DDD.');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: 'Solicitação de contato — Catálogo DZAMP',
          _template: 'table',
          Nome: name,
          Email: email,
          WhatsApp: form.phone.trim(),
        }),
      });
      if (!res.ok) throw new Error('falha no envio');
      setStatus('sent');
      setForm({ name: '', email: '', phone: '' });
    } catch {
      setStatus('error');
      setError('Não foi possível enviar agora. Tente novamente ou fale direto pelo WhatsApp.');
    }
  };

  return (
    <main className="catalog contacts">
      <section className="hero hero-small">
        <p className="hero-eyebrow">Fale com a DZAMP</p>
        <h1>Contatos</h1>
        <p className="hero-copy">
          Estamos à disposição para dúvidas sobre peças, tamanhos, pedidos e parcerias.
        </p>
      </section>

      <div className="contact-grid">
        <div className="contact-info">
          <h2>Canais diretos</h2>
          <a
            className="contact-item"
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="contact-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 21l2-5.4A8.5 8.5 0 1 1 21 11.5Z" />
              </svg>
            </span>
            <span>
              <strong>WhatsApp</strong>
              <span className="muted">Atendimento rápido e pedidos</span>
            </span>
          </a>
          <a className="contact-item" href={`mailto:${CONTACT_EMAIL}`}>
            <span className="contact-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </span>
            <span>
              <strong>E-mail</strong>
              <span className="muted">{CONTACT_EMAIL}</span>
            </span>
          </a>
          <div className="contact-item">
            <span className="contact-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <span>
              <strong>Instagram</strong>
              <span className="muted">@dzamp.oficial</span>
            </span>
          </div>
        </div>

        <div className="contact-form-card">
          <h2>Solicite nosso contato</h2>
          <p className="muted">Deixe seus dados e a equipe DZAMP entra em contato com você.</p>

          {status === 'sent' ? (
            <div className="contact-success">
              <strong>Solicitação enviada!</strong>
              <p>Obrigado pelo contato — responderemos em breve.</p>
              <button className="btn btn-outline" onClick={() => setStatus('idle')}>
                Enviar outra solicitação
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={submit} noValidate>
              <label className="field">
                Nome *
                <input
                  value={form.name}
                  onChange={(e) => set({ name: e.target.value })}
                  placeholder="Seu nome"
                  required
                />
              </label>
              <label className="field">
                E-mail *
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set({ email: e.target.value })}
                  placeholder="voce@email.com"
                  required
                />
              </label>
              <label className="field">
                WhatsApp *
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set({ phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  required
                />
              </label>

              {error && <p className="field-error">{error}</p>}
              <button className="btn btn-primary btn-block" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Enviando...' : 'Solicitar contato'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
