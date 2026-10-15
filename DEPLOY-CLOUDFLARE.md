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

## 3. Ligar o domínio customizado

1. Cloudflare Dashboard → **Workers & Pages** → projeto **muramotosensei**.
2. **Custom domains** → **Set up a custom domain**.
3. Adicione:
   - `muramotosensei.com` (apex)
   - `www.muramotosensei.com` (opcional; o arquivo `_redirects` manda www → apex)
4. Se a zona DNS já está na Cloudflare, os registros `CNAME`/`AAAA` costumam ser criados automaticamente.
5. SSL fica **Full** por padrão; em alguns minutos `https://muramotosensei.com` deve abrir.

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

## Deploy automático no push (`main`)

### Por que o push não dispara nada?

Se no GitHub **não há webhook** do Cloudflare (repositório sem integração Git ativa), o `git push` **não avisa** a Cloudflare. Deploys “by API token” no dashboard podem ser **retry manual** ou outro fluxo — não necessariamente um hook em cada push.

Use **uma** das opções abaixo.

### Opção recomendada: GitHub Actions (este repo)

Arquivo: `.github/workflows/cloudflare-deploy.yml` — roda em todo push na `main`.

**Secrets** em GitHub → repositório **muramoto-sensei** → **Settings → Secrets and variables → Actions**:

| Secret | Onde pegar |
|--------|------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → Create → template **Edit Cloudflare Workers** (ou token custom com **Account → Cloudflare Pages → Edit**) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → qualquer zona → URL `dash.cloudflare.com/<ACCOUNT_ID>/...` ou **Workers & Pages** → Account details |

Depois de salvar os dois secrets, faça um push (ou **Actions → Deploy to Cloudflare → Run workflow**).

### Opção B: Build no Cloudflare (como no seu dashboard)

Projeto **Workers** `muramoto-sensei` com **Build** + **Deploy** separados (não é o formulário antigo só “output directory”).

**1. Reconectar o Git**  
Se aparecer *“This project is disconnected from your Git account”*, clique em **Manage** ao lado do repo e **reautorize** o GitHub na Cloudflare. Sem isso, **push não dispara** deploy.

**2. Settings → Build** (valores corretos):

| Campo | Valor |
|--------|--------|
| Production branch | `main` |
| **Build command** | `npm run build` ← **não deixe “None”** |
| **Deploy command** | `npx wrangler deploy` |
| Root directory | `/` |
| Disable builds | **desligado** (builds ativos) |

O `npm run build` gera a pasta `dist/`. O `wrangler.toml` aponta `[assets] directory = "./dist"` para o deploy.

**3. Retry** em **Deployments** após salvar.

Erro típico com a config antiga: **Build command vazio** + só `wrangler deploy` → sobe Worker **sem** HTML novo (ou build falha).

Deploy **“Manually deployed”** não passa por esse pipeline Git.

## Troubleshooting

| Problema | O que fazer |
|----------|-------------|
| Git push não atualiza o site | Veja se o último deploy em **Deployments** é do commit certo; se só há “Manually deployed”, configure o build acima ou rode `npm run deploy` |
| Deploy `main` Failed em ~22s | Abra o log; confira output `dist` e comando `npm run build` |
| Domínio não resolve | Confirme nameservers na Cloudflare; aguarde DNS |
| 522 / erro SSL | Em SSL/TLS, use **Full**; espere certificado emitir |
| Só abre `.pages.dev` | Falta adicionar custom domain no projeto Pages |
| Imagens quebradas | Confirme que a pasta `images/` foi incluída no deploy |
| `Asset too large` / `workerd` 129 MiB | Output deve ser **`dist`**, build `npm run build`; não deployar `.` com `node_modules` |
