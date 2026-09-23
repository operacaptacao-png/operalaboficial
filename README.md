# OPERALAB - Portal Integrado Pedagógico

Portal educacional para gestão de turmas, frequência via Safire, auditoria pedagógica, diário de classe, portal de áudios e emissão de certificados e relatórios em PDF A4.

---

## 🚀 Como Rodar e Publicar no GitHub / Cloudflare / Vercel

### 1. No GitHub Pages (Opção mais simples: Pasta `/docs` sem Actions)
1. Suba o repositório no seu GitHub.
2. Acesse seu repositório: **Settings** > **Pages**.
3. Em **Source**, mantenha **Deploy from a branch**.
4. Em **Branch**, selecione **main** (ou **master**) e escolha a pasta **/docs**.
5. Clique em **Save**. O GitHub publicará os arquivos compilados em segundos!

### 2. No GitHub Pages (Opção Automática via GitHub Actions)
1. Acesse seu repositório: **Settings** > **Pages**.
2. Em **Source**, selecione **GitHub Actions**.
3. O fluxo configurado em `.github/workflows/deploy.yml` fará o build e deploy automaticamente a cada commit.

### 3. No Cloudflare Pages
**Se você conectar via Git / GitHub:**
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Build Output Directory**: `dist`

**Se você fizer Upload Direto (Arrastar e Soltar):**
- Envie diretamente a pasta `dist` (ou a pasta `docs`).

### 3. Rodando Localmente
```bash
npm install
npm run dev
```

### 4. Compilando para Produção
```bash
npm run build
```
Os arquivos finais compilados (HTML, CSS e JS puros) estarão na pasta `dist/`.
