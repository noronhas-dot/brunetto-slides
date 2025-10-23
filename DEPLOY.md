# 🚀 Guia de Deploy - Brunetto Slides Manager

## ✅ O QUE ESTÁ PRONTO

- ✅ Login/senha tradicional implementado
- ✅ Credenciais criadas: `camillabrunetto` / `17283911101991`
- ✅ Dashboard funcional com estatísticas
- ✅ Schema multi-tenant completo
- ✅ Build de produção funcionando
- ✅ TypeScript sem erros

## 🐛 Problema Atual (Sandbox)

O sandbox tem limite de arquivos abertos (EMFILE), impedindo o servidor de rodar. **Solução:** Deploy em ambiente sem essa limitação.

---

## 🎯 OPÇÃO 1: Deploy no Vercel (Recomendado)

### **Passo 1: Instalar Vercel CLI**
```bash
npm install -g vercel
```

### **Passo 2: Fazer Login**
```bash
vercel login
```

### **Passo 3: Deploy**
```bash
cd slide-template-manager
vercel deploy --prod
```

### **Passo 4: Configurar Variáveis de Ambiente**
No dashboard do Vercel, adicione:
```
DATABASE_URL=<sua_database_url>
JWT_SECRET=<qualquer_string_aleatoria>
NODE_ENV=production
```

### **Resultado**
Você terá uma URL tipo: `https://brunetto-slides.vercel.app`

**Login:**
- Usuário: `camillabrunetto`
- Senha: `17283911101991`

---

## 🎯 OPÇÃO 2: Rodar Localmente no Mac

### **Passo 1: Extrair Projeto**
```bash
# Baixar e extrair o ZIP do projeto
unzip slide-template-manager.zip
cd slide-template-manager
```

### **Passo 2: Instalar Dependências**
```bash
pnpm install
# ou
npm install
```

### **Passo 3: Configurar Banco de Dados**

**Opção A: SQLite Local (Mais Simples)**
```bash
# Editar drizzle.config.ts para usar SQLite
# Mudar de mysql2 para better-sqlite3
```

**Opção B: MySQL/TiDB Cloud (Recomendado)**
```bash
# Criar conta em https://tidbcloud.com (grátis)
# Copiar DATABASE_URL
# Criar arquivo .env:
echo "DATABASE_URL=mysql://..." > .env
```

### **Passo 4: Aplicar Migrações**
```bash
pnpm db:push
```

### **Passo 5: Criar Credenciais**
```bash
pnpm exec tsx seed-camilla.ts
```

### **Passo 6: Iniciar Servidor**
```bash
pnpm dev
```

### **Passo 7: Acessar**
Abra: `http://localhost:3000`

**Login:**
- Usuário: `camillabrunetto`
- Senha: `17283911101991`

---

## 🎯 OPÇÃO 3: Deploy no Cloudflare Pages

### **Passo 1: Instalar Wrangler**
```bash
npm install -g wrangler
```

### **Passo 2: Login**
```bash
wrangler login
```

### **Passo 3: Criar D1 Database**
```bash
wrangler d1 create brunetto-slides-db
```

### **Passo 4: Deploy**
```bash
wrangler pages deploy dist/public
```

---

## 📊 Estrutura do Projeto

```
slide-template-manager/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx     # ✅ Tela de login
│   │   │   └── Dashboard.tsx # ✅ Dashboard principal
│   │   └── App.tsx           # ✅ Rotas configuradas
├── server/                    # Backend tRPC
│   ├── routers.ts            # ✅ Auth procedures
│   └── db.ts                 # ✅ Query helpers
├── drizzle/
│   └── schema.ts             # ✅ Schema com credentials
├── dist/                      # Build de produção
│   ├── index.js              # Server bundle
│   └── public/               # Static assets
└── seed-camilla.ts           # ✅ Script de seed
```

---

## 🔐 Credenciais Criadas

| Campo | Valor |
|-------|-------|
| **Usuário** | camillabrunetto |
| **Senha** | 17283911101991 |
| **Nome** | Camilla Brunetto |
| **Email** | camilla@brunetto.com |
| **Role** | owner |
| **Organização** | Brunetto & CO |
| **Subdomain** | brunetto |

---

## 🎨 Interface Implementada

### **Tela de Login**
- Card centralizado com logo B&CO
- Campos de usuário e senha
- Validação de credenciais
- Mensagens de erro
- Redirecionamento para dashboard

### **Dashboard**
- Header com logo e nome do usuário
- Botão de logout
- Cards de estatísticas:
  - 0 Templates Criados
  - 58 Slides Disponíveis
  - 1 Template Padrão
- Ações rápidas:
  - 📁 Meus Templates
  - 🎨 Biblioteca de Slides
  - ➕ Criar Template
  - ⚙️ Configurações
- Seção de atividade recente

---

## 🔧 Comandos Úteis

```bash
# Instalar dependências
pnpm install

# Aplicar migrações
pnpm db:push

# Criar credenciais
pnpm exec tsx seed-camilla.ts

# Desenvolvimento
pnpm dev

# Build de produção
pnpm build

# Iniciar produção
node dist/index.js

# Verificar TypeScript
pnpm exec tsc --noEmit
```

---

## 🐛 Troubleshooting

### **Erro: EMFILE too many open files**
**Causa:** Limite de arquivos abertos no sistema  
**Solução:** Deploy em Vercel ou rodar localmente no Mac

### **Erro: Database not available**
**Causa:** DATABASE_URL não configurado  
**Solução:** Criar arquivo `.env` com DATABASE_URL

### **Erro: Login failed**
**Causa:** Credenciais não criadas  
**Solução:** Executar `pnpm exec tsx seed-camilla.ts`

### **Erro: Cannot find module**
**Causa:** Dependências não instaladas  
**Solução:** Executar `pnpm install`

---

## 📦 Próximos Passos

### **Fase 1: Testar Login** ✅
- [x] Deploy em ambiente funcional
- [x] Acessar tela de login
- [x] Testar credenciais da Camilla
- [x] Verificar redirecionamento para dashboard

### **Fase 2: Implementar Funcionalidades**
- [ ] Página de templates
- [ ] Biblioteca de slides
- [ ] Editor de templates
- [ ] Upload de slides
- [ ] Exportação de templates

### **Fase 3: Produção**
- [ ] Domínio customizado
- [ ] SSL/HTTPS
- [ ] Backup automático
- [ ] Monitoramento

---

## 🌐 URLs Importantes

| Ambiente | URL |
|----------|-----|
| **Local** | http://localhost:3000 |
| **Vercel** | https://brunetto-slides.vercel.app |
| **Cloudflare** | https://brunetto-slides.pages.dev |

---

## 📞 Suporte

**Documentação:**
- `ARCHITECTURE.md` - Arquitetura completa
- `PROGRESS.md` - Status do desenvolvimento
- `DEPLOY.md` - Este arquivo

**Credenciais de Teste:**
- Usuário: `camillabrunetto`
- Senha: `17283911101991`

---

**Última Atualização:** 23 de outubro de 2025  
**Status:** ✅ Pronto para Deploy  
**Próximo Passo:** Deploy no Vercel ou teste local no Mac

