# Publicar no Cloudflare Pages — muramotosensei.com

Site estático: o build copia só HTML, imagens e `_redirects` / `_headers` para **`dist/`** (sem `node_modules`).

## 1. Domínio na Cloudflare

Se **muramotosensei.com** ainda não está na Cloudflare:

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com) → **Add a site** → digite `muramotosensei.com`.
2. Escolha o plano **Free**.
3. Na tela de nameservers, copie os dois NS da Cloudflare (ex.: `ada.ns.cloudflare.com`).
4. No painel onde você **comprou** o domínio, troque os nameservers do domínio pelos da Cloudflare.
5. Aguarde propagação (minutos a algumas horas). A Cloudflare avisa quando o site estiver **Active**.

> Se o domínio já foi comprado **na Cloudflare Registrar**, ele já está na conta — pule para o passo 2.

## 2. Deploy do site (Wrangler — upload direto)

No terminal, na pasta do projeto:

```bash
cd /home/luziberto/Github/nihongo-working-holiday
npm install
npx wrangler login
npm run deploy
```

Na primeira vez, o Wrangler cria o projeto Pages **`muramotosensei`**. Você recebe uma URL tipo `https://muramotosensei.pages.dev`.

Para publicar de novo depois de mudar arquivos:

```bash
npm run deploy
```

## 3. Ligar o domínio customizado (Worker `muramoto-sensei`)

O apex **`muramotosensei.com`** usa registro DNS tipo **Worker** → `muramoto-sensei`. O site em `https://muramotosensei.com` deve responder **200**.

### www — não use só CNAME para o apex

**CNAME `www` → `muramotosensei.com`** costuma gerar **Error 522** no `www`, porque o apex não é um host HTTP normal — é rota de Worker.

**Correção (escolha uma):**

#### Opção A (recomendada): domínio customizado no Worker

1. **Workers & Pages** → **muramoto-sensei** → **Settings** → **Domains & Routes** (ou **Custom domains**).
2. **Add** → `www.muramotosensei.com`.
3. A Cloudflare ajusta o DNS (pode substituir o CNAME manual).
4. Opcional: **Rules** → **Redirect Rules** — se `www` abrir igual ao apex, crie regra **301** de `www.muramotosensei.com/*` → `https://muramotosensei.com/$1`.

#### Opção B: só redirect (sem servir site no www)

1. Em **DNS**, remova o CNAME `www` → apex se estiver com 522.
2. Adicione `www` de novo pelo fluxo **Add custom domain** do Worker (passo A), **ou** peça à Cloudflare o registro que ela sugere para Workers.
3. **Redirect Rule**: hostname `www.muramotosensei.com` → `https://muramotosensei.com/${uri.path}` (301).

### Apex

1. Confirme em DNS: `muramotosensei.com` → **Worker** `muramoto-sensei` (nuvem laranja).
2. SSL/TLS → **Full**.

## 4. Conferir

- Desktop: `https://muramotosensei.com/`
- Celular: mesmo link (redireciona para `mobile.html` automaticamente)
- WhatsApp: botões já usam `+81 70-1625-2129`

## Alternativa: GitHub + Pages (CI)

1. Suba o repositório no GitHub.
2. Workers & Pages → **Create** → **Connect to Git**.
3. Repositório `nihongo-working-holiday`, branch `main`.
4. **Build settings** (importante — não publique a raiz do repo):
   - Framework preset: **None**
   - Build command: `npm run build`
   - Build output directory: **`dist`**
   - **Não** use `npm run deploy` nem `wrangler pages deploy .` no build (isso envia `node_modules` e estoura o limite de 25 MiB).
5. Salve e faça **Retry deployment**; depois adicione o domínio como no passo 3.

## Deploy automático (Git conectado no Cloudflare)

Se no dashboard aparecem deploys em **`main`** com **“by API token”** e status **Failed**, o push no GitHub **está** disparando build — mas a etapa de build quebra.

No projeto **muramoto-sensei** → **Settings** → **Build**:

| Campo | Valor |
|--------|--------|
| Build command | `npm run build` |
| **Deploy command** | `npx --yes wrangler@4 deploy` |
| Root directory | `/` (raiz do repo) |
| Node version | 20 |

O projeto no dashboard é **Worker** `muramoto-sensei` (não Pages separado). O `wrangler.toml` define `[assets] directory = "./dist"` — por isso o deploy correto é **`wrangler deploy`**, não `wrangler pages deploy`.

**Erro `Authentication error` em `/pages/projects/muramoto-sensei`:** o painel estava usando `pages deploy` num projeto Worker; troque o deploy command para `npx --yes wrangler@4 deploy`.

Localmente: `npm run deploy` (build + deploy).

Depois: **Deployments** → **Retry deployment** no último commit.

**“Empty commit message”** costuma ser só metadado do deploy via API; o que importa é o **log do build** (clique no deploy falho).

Deploy **“Manually deployed”** não usa o Git: é upload manual e por isso pode estar no ar enquanto o automático falha.

## Troubleshooting

| Problema | O que fazer |
|----------|-------------|
| Git push não atualiza o site | Veja se o último deploy em **Deployments** é do commit certo; se só há “Manually deployed”, configure o build acima ou rode `npm run deploy` |
| Deploy `main` Failed em ~22s | Abra o log; confira output `dist` e comando `npm run build` |
| `wrangler deploy` / Missing entry-point | Confirme `[assets] directory = "./dist"` no `wrangler.toml` e `npm run build` antes do deploy |
| `pages/projects/...` Authentication error | Projeto é **Worker** — use `npx --yes wrangler@4 deploy`, não `pages deploy` |
| `Invalid _redirects` / Only relative URLs | Remova URLs absolutas de `_redirects`; use Redirect Rules no dashboard para www |
| `Missing script: deploy:cloudflare` | Use `npx --yes wrangler@4 deploy` no painel ou `npm run deploy:cloudflare` após pull |
| **522 só no www** | Não use CNAME `www` → apex com DNS Worker; adicione `www` em **Domains & Routes** do Worker `muramoto-sensei` |
| Domínio não resolve | Confirme nameservers na Cloudflare; aguarde DNS |
| 522 / erro SSL | Em SSL/TLS, use **Full**; espere certificado emitir |
| Só abre `.pages.dev` | Falta adicionar custom domain no projeto Pages |
| Imagens quebradas | Confirme que a pasta `images/` foi incluída no deploy |
| `Asset too large` / `workerd` 129 MiB | Output deve ser **`dist`**, build `npm run build`; não deployar `.` com `node_modules` |
