# RPG Chronicles

Plataforma online de RPG de mesa com IA Mestre. Este repositório contém o **monorepo**
com frontend, backend e schema do banco de dados.

> **Status atual: Fase 0 — Fundação.**
> Repositório, autenticação (Google + Anônimo), estrutura de rotas e schema inicial do
> banco de dados estão prontos e validados. As demais fases (personagens completos,
> multiplayer em tempo real, IA Mestre, combate, mundo vivo etc.) serão construídas
> incrementalmente sobre esta base.

---

## Estrutura do repositório

```
rpg-chronicles/
├── frontend/     # React + Vite + TypeScript + TailwindCSS + Zustand + React Query
├── backend/      # Node + Express + TypeScript + Socket.IO
├── supabase/     # schema.sql — schema do banco (Postgres) e políticas de RLS
└── README.md
```

## Stack

| Camada     | Tecnologias |
|------------|-------------|
| Frontend   | React, Vite, TypeScript, TailwindCSS v4, Framer Motion, React Router, Zustand, React Query |
| Backend    | Node.js, Express, TypeScript, Socket.IO, Helmet, express-rate-limit |
| Banco      | Supabase (Postgres + Auth + RLS) |
| Auth       | Supabase Auth — Google OAuth e Login Anônimo |
| Deploy     | Frontend → Vercel · Backend → Railway · Banco → Supabase |

---

## 1. Pré-requisitos

- Node.js 20+ e npm 10+
- Uma conta [Supabase](https://supabase.com) (gratuita) com um projeto criado
- Uma credencial OAuth do Google (Google Cloud Console) para o login social

---

## 2. Configurando o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor** do painel do Supabase, cole e execute o conteúdo de
   [`supabase/schema.sql`](./supabase/schema.sql). Isso cria as tabelas `users`,
   `campaigns`, `campaign_members`, `characters`, os triggers de sincronização com
   `auth.users` e todas as políticas de **Row Level Security (RLS)**.
3. Em **Authentication → Providers**, habilite:
   - **Google** (informe Client ID e Client Secret do Google Cloud Console)
   - **Anonymous Sign-ins** (habilitar no toggle correspondente)
4. Em **Authentication → URL Configuration**, adicione a URL do frontend
   (ex.: `http://localhost:5173` em dev, e o domínio da Vercel em produção) em
   *Site URL* e *Redirect URLs*.
5. Copie em **Project Settings → API**:
   - `Project URL`
   - `anon public key` (para o frontend)
   - `service_role key` (para o backend — **nunca** exponha no frontend)

---

## 3. Rodando o Frontend localmente

```bash
cd frontend
cp .env.example .env
# Edite .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

npm install
npm run dev
```

Acesse `http://localhost:5173`.

### Variáveis de ambiente (`frontend/.env`)

| Variável | Descrição |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave pública (anon) do Supabase |
| `VITE_BACKEND_URL` | URL do backend (ex.: `http://localhost:4000`) |

---

## 4. Rodando o Backend localmente

```bash
cd backend
cp .env.example .env
# Edite .env com SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY

npm install
npm run dev
```

O servidor sobe em `http://localhost:4000`. Endpoints disponíveis nesta fase:

- `GET /health` — health check
- `GET /me` — perfil do usuário autenticado (requer header `Authorization: Bearer <token>`)
- Socket.IO no mesmo endpoint HTTP, autenticado via `socket.handshake.auth.token`

### Variáveis de ambiente (`backend/.env`)

| Variável | Descrição |
|---|---|
| `NODE_ENV` | `development` \| `production` |
| `PORT` | Porta do servidor (padrão `4000`) |
| `CORS_ORIGIN` | Origem permitida (URL do frontend) |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key (acesso administrativo, bypassa RLS) |

---

## 5. Scripts disponíveis

**Frontend** (`frontend/package.json`)
```bash
npm run dev       # servidor de desenvolvimento (Vite)
npm run build     # type-check + build de produção
npm run preview   # preview do build de produção
npm run lint      # ESLint
```

**Backend** (`backend/package.json`)
```bash
npm run dev        # servidor com hot-reload (tsx watch)
npm run build      # compila TypeScript para dist/
npm run start      # roda a build compilada (produção)
npm run typecheck  # apenas type-check, sem gerar arquivos
```

---

## 6. Deploy em produção

### Backend → Railway
1. Crie um novo projeto no Railway apontando para a pasta `backend/`.
2. Configure as variáveis de ambiente (mesmas do `.env.example`, com valores de produção).
3. Build command: `npm run build` · Start command: `npm run start`.
4. Anote a URL pública gerada (ex.: `https://rpg-chronicles-backend.up.railway.app`).

### Frontend → Vercel
1. Importe o repositório na Vercel apontando o **Root Directory** para `frontend/`.
2. Configure as variáveis de ambiente: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
   e `VITE_BACKEND_URL` (URL do backend no Railway).
3. Build command: `npm run build` · Output directory: `dist`.
4. Após o deploy, volte ao Supabase e adicione a URL da Vercel em
   **Authentication → URL Configuration**.

### Banco → Supabase
Já em produção desde a criação do projeto — não requer deploy adicional. Apenas
mantenha o `schema.sql` como fonte de verdade e aplique migrações incrementais
conforme novas fases forem implementadas.

---

## 7. Segurança já implementada na Fase 0

- **RLS (Row Level Security)** em todas as tabelas — cada usuário só acessa seus
  próprios dados ou dados de campanhas das quais participa.
- **Service Role Key** isolada no backend, nunca exposta ao cliente.
- **Helmet** (cabeçalhos HTTP seguros) e **CORS** restrito à origem do frontend.
- **Rate limiting** global no backend (300 req / 15 min por IP, ajustável por rota
  nas próximas fases).
- Validação de sessão via JWT do Supabase em toda rota protegida e no handshake
  do Socket.IO.

---

## 8. Roadmap (próximas fases)

1. **Fase 1** — Sistema de personagens completo (ficha, atributos, evolução)
2. **Fase 2** — Sala multiplayer (chat, dados, lista de jogadores via Socket.IO)
3. **Fase 3** — IA Mestre (narração, NPCs, memória resumida da campanha)
4. **Fase 4** — Sistema de RPG (combate D20, magias, elementos, status)
5. **Fase 5** — Mundo vivo (clima, dia/noite, eventos, locais, economia)
6. **Fase 6** — Sistemas avançados (crafting, facções, relacionamentos, conquistas)
7. **Fase 7** — Polimento final (UI completa, responsividade, performance, hardening)

Cada fase segue o processo: planejar → arquitetar → implementar → revisar → testar →
corrigir, com validação de integração entre frontend, backend e banco antes de avançar.
