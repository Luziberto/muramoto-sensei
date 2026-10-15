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

## Troubleshooting

| Problema | O que fazer |
|----------|-------------|
| Domínio não resolve | Confirme nameservers na Cloudflare; aguarde DNS |
| 522 / erro SSL | Em SSL/TLS, use **Full**; espere certificado emitir |
| Só abre `.pages.dev` | Falta adicionar custom domain no projeto Pages |
| Imagens quebradas | Confirme que a pasta `images/` foi incluída no deploy |
| `Asset too large` / `workerd` 129 MiB | Output deve ser **`dist`**, build `npm run build`; não deployar `.` com `node_modules` |
