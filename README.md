# にほんご — Japonês para o seu Working Holiday

Landing page para divulgação das aulas particulares de japonês online com **Miuky Muramoto** (20 anos vivendo no Japão).

## Contato

- WhatsApp: [+81 70-1625-2129](https://wa.me/817016252129)

## Desenvolvimento local

```bash
cd nihongo-working-holiday
npm run dev
```

Abra `http://localhost:5173`.

**Um único link para divulgar:** use sempre `index.html` (ou a raiz do site). Em telas até 767px o visitante é enviado automaticamente para `mobile.html`.

- Forçar desktop no celular: `index.html?desktop=1` (a preferência fica salva na sessão).
- Voltar ao mobile: `index.html?mobile=1` ou abrir `mobile.html` direto.

Alternativa sem Node:

```bash
python3 -m http.server 5173
```

## Design (Stitch)

O layout foi gerado no [Google Stitch](https://stitch.withgoogle.com/) (projeto `12071605958678522652`). A implementação em `index.html` segue o export em `docs/stitch/landing-reference.html`, com imagens da marca em `images/`.

## Publicar (Cloudflare Pages + muramotosensei.com)

Guia passo a passo: **[DEPLOY-CLOUDFLARE.md](./DEPLOY-CLOUDFLARE.md)**

Resumo:

```bash
npm install
npx wrangler login
npm run deploy
```

Depois, no dashboard Cloudflare, associe `muramotosensei.com` ao projeto Pages **muramotosensei**.

**Pages + GitHub:** build `npm run build`, output **`dist`** (veja [DEPLOY-CLOUDFLARE.md](./DEPLOY-CLOUDFLARE.md)).
