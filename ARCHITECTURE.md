# Arquitetura do Sistema - Brunetto Slides Manager

## 🎯 Visão Geral

Sistema web multi-tenant para gerenciamento de templates de slides, onde cada cliente (family office) tem:
- Subdomínio próprio (ex: `cliente1.brunetto.app`)
- Autenticação segura
- Dados isolados
- Templates personalizados

---

## 🏗️ Arquitetura Multi-Tenant

### **Modelo de Isolamento**
- **Tenant por Organização:** Cada cliente é uma "organização"
- **Isolamento Lógico:** Dados separados por `organization_id` no banco
- **Subdomínios:** Roteamento baseado em subdomain

### **Estrutura de Subdomínios**
```
app.brunetto.app          → Landing page + Login
admin.brunetto.app        → Painel administrativo
cliente1.brunetto.app     → Workspace Cliente 1
cliente2.brunetto.app     → Workspace Cliente 2
```

---

## 📊 Schema do Banco de Dados

### **Tabela: organizations**
```sql
CREATE TABLE organizations (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(64) UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#1A3123',
  secondary_color VARCHAR(7) DEFAULT '#8B9B88',
  accent_color VARCHAR(7) DEFAULT '#F9EAD3',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **Tabela: users** (estendida)
```sql
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  organization_id VARCHAR(64),
  name TEXT,
  email VARCHAR(320),
  role ENUM('owner', 'admin', 'editor', 'viewer') DEFAULT 'viewer',
  login_method VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_signed_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);
```

### **Tabela: templates**
```sql
CREATE TABLE templates (
  id VARCHAR(64) PRIMARY KEY,
  organization_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_by VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### **Tabela: slides**
```sql
CREATE TABLE slides (
  id VARCHAR(64) PRIMARY KEY,
  template_id VARCHAR(64) NOT NULL,
  slide_id VARCHAR(64) NOT NULL,
  page_title VARCHAR(255) NOT NULL,
  summary TEXT,
  html_path TEXT NOT NULL,
  image_paths JSON,
  position INT NOT NULL,
  is_new BOOLEAN DEFAULT FALSE,
  is_moved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
);
```

### **Tabela: template_slides** (relação N:N)
```sql
CREATE TABLE template_slides (
  id VARCHAR(64) PRIMARY KEY,
  template_id VARCHAR(64) NOT NULL,
  slide_id VARCHAR(64) NOT NULL,
  position INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
  FOREIGN KEY (slide_id) REFERENCES slides(id) ON DELETE CASCADE,
  UNIQUE KEY unique_template_slide (template_id, slide_id)
);
```

---

## 🔐 Sistema de Autenticação

### **Fluxo de Login**
1. Usuário acessa `cliente1.brunetto.app`
2. Sistema identifica organização pelo subdomain
3. Redireciona para Manus OAuth com `organization_id`
4. Após autenticação, cria sessão com contexto da organização
5. Usuário acessa apenas dados da sua organização

### **Roles e Permissões**
| Role | Permissões |
|------|------------|
| **owner** | Tudo + gerenciar usuários + configurações org |
| **admin** | Criar/editar/excluir templates e slides |
| **editor** | Criar/editar templates (não pode excluir) |
| **viewer** | Apenas visualizar templates |

---

## 🎨 Interface do Usuário

### **Páginas Principais**

#### 1. **Landing Page** (`app.brunetto.app`)
- Hero section com demo
- Features do sistema
- Pricing (se aplicável)
- CTA para login/signup

#### 2. **Dashboard** (`{subdomain}.brunetto.app`)
```
┌─────────────────────────────────────────┐
│ [Logo] Brunetto Slides    [User Menu]   │
├─────────────────────────────────────────┤
│                                         │
│  📊 Dashboard                           │
│  📁 Templates                           │
│  🎨 Slides Library                      │
│  ⚙️  Settings (admin only)              │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [Main Content Area]                    │
│                                         │
│  - Grid de templates                    │
│  - Visualização de slides               │
│  - Criação de novos templates           │
│                                         │
└─────────────────────────────────────────┘
```

#### 3. **Template Editor**
- Seleção de slides (checkboxes)
- Drag-and-drop para reordenar
- Preview em tempo real
- Salvar/exportar template

#### 4. **Admin Panel** (owner/admin only)
- Gerenciar usuários
- Configurações da organização
- Customização de cores/logo
- Analytics de uso

---

## 🔄 Fluxo de Dados

### **Criação de Template**
```
User → Frontend → tRPC → Backend → DB
                     ↓
                  Storage (S3/R2)
                     ↓
                  Slides HTML
```

### **Visualização de Template**
```
User → Frontend → tRPC → Backend → DB
                     ↓
                  Fetch slides
                     ↓
                  Render preview
```

---

## 🚀 Stack Tecnológico

### **Frontend**
- React 19
- Tailwind CSS 4
- shadcn/ui components
- tRPC client
- Wouter (routing)

### **Backend**
- Express 4
- tRPC 11
- Better-SQLite3 / MySQL
- Manus OAuth

### **Storage**
- Cloudflare R2 (slides HTML + imagens)
- Ou local filesystem para dev

### **Deploy**
- Vercel (frontend + serverless functions)
- Ou Cloudflare Pages + Workers

---

## 📦 Estrutura de Arquivos

```
slide-template-manager/
├── drizzle/
│   └── schema.ts                 # Schema completo
├── server/
│   ├── db.ts                     # Query helpers
│   ├── routers.ts                # tRPC procedures
│   └── _core/                    # Framework
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx          # Landing page
│   │   │   ├── Dashboard.tsx     # Main dashboard
│   │   │   ├── Templates.tsx     # Templates list
│   │   │   ├── TemplateEditor.tsx # Editor
│   │   │   └── Settings.tsx      # Admin settings
│   │   ├── components/
│   │   │   ├── SlideCard.tsx
│   │   │   ├── TemplateGrid.tsx
│   │   │   └── SlidePreview.tsx
│   │   └── lib/
│   │       └── trpc.ts
│   └── public/
│       └── templates/            # Templates HTML
└── storage/                      # S3 helpers
```

---

## 🔒 Segurança

### **Isolamento de Dados**
- Todas as queries incluem `WHERE organization_id = ?`
- Middleware tRPC valida organização do usuário
- Nenhum dado cross-tenant

### **Autenticação**
- Manus OAuth (SSO)
- Session cookies com JWT
- CSRF protection

### **Autorização**
- Role-based access control (RBAC)
- Procedures protegidas por role
- Frontend esconde UI baseado em permissões

---

## 📈 Escalabilidade

### **Fase 1: MVP** (Atual)
- Single server
- SQLite local
- Até 10 organizações

### **Fase 2: Crescimento**
- MySQL/TiDB
- Cloudflare R2 para storage
- Até 100 organizações

### **Fase 3: Escala**
- Database sharding por organização
- CDN para slides
- Cache distribuído (Redis)
- Até 1000+ organizações

---

## 🎯 Roadmap de Implementação

### **Sprint 1: Database & Auth** ✅
- [x] Schema multi-tenant
- [x] Autenticação Manus OAuth
- [x] Middleware de organização

### **Sprint 2: Core Features**
- [ ] CRUD de templates
- [ ] CRUD de slides
- [ ] Upload de slides HTML
- [ ] Preview de templates

### **Sprint 3: UI/UX**
- [ ] Dashboard principal
- [ ] Template editor com drag-drop
- [ ] Slide library
- [ ] Settings page

### **Sprint 4: Admin & Deploy**
- [ ] Admin panel
- [ ] User management
- [ ] Deploy em produção
- [ ] Documentação

---

## 🔧 Configuração de Desenvolvimento

### **Variáveis de Ambiente**
```env
DATABASE_URL=mysql://...
JWT_SECRET=...
VITE_APP_ID=...
OAUTH_SERVER_URL=...
VITE_OAUTH_PORTAL_URL=...
OWNER_OPEN_ID=...
OWNER_NAME=...

# Storage (opcional)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
```

### **Comandos**
```bash
# Instalar dependências
pnpm install

# Migrar banco de dados
pnpm db:push

# Iniciar dev server
pnpm dev

# Build para produção
pnpm build
```

---

**Versão:** 1.0  
**Data:** 23 de outubro de 2025  
**Status:** 🚧 Em Desenvolvimento

