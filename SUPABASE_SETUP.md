# Configuração do Supabase para FinTrack

Este guia explica como configurar o Supabase para usar como backend do FinTrack.

## Passo 1: Criar projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Preencha os dados do projeto:
   - Nome do projeto
   - Senha do banco de dados
   - Região (escolha a mais próxima)
5. Aguarde a criação do projeto (pode levar alguns minutos)

## Passo 2: Executar o Schema SQL

1. No painel do Supabase, vá em "SQL Editor"
2. Clique em "New Query"
3. Copie e cole o conteúdo do arquivo `supabase-schema.sql`
4. Clique em "Run" para executar o SQL
5. Verifique se todas as tabelas foram criadas corretamente

## Passo 3: Obter as credenciais

1. No painel do Supabase, vá em "Settings" (ícone de engrenagem)
2. Clique em "API"
3. Você verá:
   - **Project URL**: Copie este valor
   - **anon public key**: Copie este valor

## Passo 4: Configurar variáveis de ambiente

1. Crie um arquivo `.env` na raiz do projeto (se ainda não existir)
2. Adicione as seguintes variáveis:

```env
VITE_SUPABASE_URL=sua_url_do_projeto
VITE_SUPABASE_ANON_KEY=sua_chave_anon_public
```

**Exemplo:**
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Importante**: 
- Nunca commite o arquivo `.env` no Git
- O arquivo `.env` já está no `.gitignore`
- Use `.env.example` como referência (se necessário)

## Passo 5: Autenticação - Email e Senha ✅

✅ **Email e Senha já está configurado!** A aplicação já está pronta para usar autenticação por email/senha. Você não precisa fazer nada adicional.

O Supabase suporta autenticação por email/senha por padrão, e os componentes de Login e Register já estão configurados para usar isso.

**Você pode pular este passo e ir direto para o Passo 6!**

---

### (Opcional) Se quiser adicionar login com Google depois:

Se **quiser usar login com Google** (opcional, não obrigatório):

📖 **Guia Completo**: Consulte o arquivo `GOOGLE_OAUTH_SETUP.md` para instruções detalhadas passo a passo.

**Resumo rápido:**

1. Crie um projeto no [Google Cloud Console](https://console.cloud.google.com/)
2. Habilite a Google+ API
3. Configure a tela de consentimento OAuth (⚠️ obrigatório antes de criar credenciais)
4. Crie credenciais OAuth (Web application):
   - **Authorized JavaScript origins**: `https://seu-projeto-id.supabase.co`
   - **Authorized redirect URIs**: `https://seu-projeto-id.supabase.co/auth/v1/callback`
5. Copie o Client ID e Client Secret
   - **Onde encontrar**: Vá em "APIs & Services" > "Credentials" no Google Cloud Console
   - Procure por "OAuth 2.0 Client IDs" na lista
   - Clique no nome da credencial para ver os detalhes
   - ⚠️ **Client Secret só aparece UMA VEZ** - copie imediatamente ao criar!
   - 📖 **Guia detalhado**: Veja o arquivo `ONDE_ENCONTRAR_CLIENT_ID.md`

6. No Supabase, vá em "Authentication" > "Providers" > "Google"
7. Ative o Google e cole as credenciais:
   - **Client ID (for OAuth)**: Cole o Client ID
   - **Client Secret (for OAuth)**: Cole o Client Secret
8. Clique em **"Save"** (Salvar)

⚠️ **Importante**: Copie o Client Secret imediatamente ao criar, pois você não poderá vê-lo novamente!

**Para desabilitar OAuth depois**: Vá em "Authentication" > "Providers" > "Google" e desative o toggle.

---

**Nota**: Se você não quiser usar Google OAuth, simplesmente ignore esta seção. Email/senha funciona perfeitamente sem OAuth!

## Passo 6: Reiniciar o servidor de desenvolvimento

Após configurar as variáveis de ambiente:

```bash
npm run dev
```

## Verificação

Após configurar tudo:

1. Acesse a aplicação
2. Tente criar uma conta
3. Faça login
4. Crie uma conta bancária ou transação
5. Verifique no Supabase se os dados foram salvos:
   - Vá em "Table Editor"
   - Selecione a tabela (ex: `accounts`, `transactions`)
   - Você deve ver os dados criados

## Estrutura das Tabelas

### accounts
- Armazena contas bancárias dos usuários

### credit_cards
- Armazena cartões de crédito dos usuários

### transactions
- Armazena todas as transações (receitas, despesas, gastos com cartão)

### categories
- Armazena categorias personalizadas dos usuários

## Segurança

O Supabase usa Row Level Security (RLS) para garantir que:
- Usuários só podem ver/editar seus próprios dados
- Cada tabela tem políticas que verificam `auth.uid() = user_id`
- Dados são automaticamente isolados por usuário

## Troubleshooting

### Erro: "Missing Supabase environment variables"
- Verifique se o arquivo `.env` existe
- Verifique se as variáveis começam com `VITE_`
- Reinicie o servidor de desenvolvimento

### Erro: "relation does not exist"
- Execute o SQL do arquivo `supabase-schema.sql` novamente
- Verifique se todas as tabelas foram criadas

### Dados não aparecem
- Verifique se o RLS está habilitado
- Verifique se as políticas RLS estão corretas
- Verifique o console do navegador para erros

