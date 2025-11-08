# Onde Encontrar o Client ID e Client Secret

## Se você JÁ criou as credenciais OAuth no Google Cloud Console:

### Passo 1: Acessar as Credenciais

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Certifique-se de que o projeto correto está selecionado (no topo da página)
3. No menu lateral esquerdo, vá em **"APIs & Services"** > **"Credentials"** (Credenciais)

### Passo 2: Encontrar o Client ID

Na página de Credenciais, você verá uma seção chamada **"OAuth 2.0 Client IDs"**:

1. Procure por uma lista de credenciais OAuth
2. Você verá algo como:
   ```
   OAuth 2.0 Client IDs
   ┌─────────────────────────────────────┐
   │ FinTrack Web Client                 │
   │ Client ID: 123456789-abc...xyz      │
   │                                     │
   │ [ícone de olho] [ícone de copiar]  │
   └─────────────────────────────────────┘
   ```

3. **Para ver o Client ID completo:**
   - Clique no nome da credencial (ex: "FinTrack Web Client")
   - OU clique no ícone de copiar ao lado do Client ID
   - O Client ID será algo como: `123456789-abcdefghijklmnop.apps.googleusercontent.com`

4. **Para ver o Client Secret:**
   - ⚠️ **ATENÇÃO**: O Client Secret só aparece UMA VEZ quando você cria a credencial
   - Se você não copiou na hora, você NÃO poderá vê-lo novamente
   - Nesse caso, você precisará criar uma NOVA credencial OAuth

### Passo 3: Copiar as Credenciais

1. **Client ID:**
   - Clique no ícone de copiar ao lado do Client ID
   - OU selecione e copie manualmente
   - Exemplo: `123456789-abcdefghijklmnop.apps.googleusercontent.com`

2. **Client Secret:**
   - Se você ainda tem a janela popup aberta de quando criou, copie de lá
   - Se não, você precisará criar uma nova credencial (veja abaixo)

## Se você AINDA NÃO criou as credenciais OAuth:

### Opção 1: Tentar criar novamente

1. Vá em **"APIs & Services"** > **"Credentials"**
2. Clique em **"+ CREATE CREDENTIALS"** (no topo da página)
3. Selecione **"OAuth client ID"**
4. Se aparecer um erro sobre a tela de consentimento, você precisa configurá-la primeiro (veja `GOOGLE_OAUTH_SETUP.md`)

### Opção 2: Pular OAuth por enquanto

Se você não conseguir criar as credenciais agora, você pode:
- Usar apenas email/senha para autenticação
- Configurar OAuth depois quando tiver mais tempo
- A aplicação funciona perfeitamente sem OAuth

## Como criar uma NOVA credencial (se perdeu o Client Secret):

1. Vá em **"APIs & Services"** > **"Credentials"**
2. Clique em **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
3. Preencha:
   - **Application type**: "Web application"
   - **Name**: "FinTrack Web Client" (ou outro nome)
   - **Authorized JavaScript origins**: `https://seu-projeto-id.supabase.co`
   - **Authorized redirect URIs**: `https://seu-projeto-id.supabase.co/auth/v1/callback`
4. Clique em **"CREATE"**
5. **IMPORTANTE**: Uma janela popup aparecerá com:
   - **Your Client ID**
   - **Your Client Secret**
   - **COPIE AMBOS AGORA!** Você não verá o Client Secret novamente

## Onde colar no Supabase:

1. Acesse o painel do Supabase
2. Vá em **"Authentication"** > **"Providers"**
3. Encontre **"Google"** na lista
4. Ative o toggle do Google
5. Cole:
   - **Client ID (for OAuth)**: Cole o Client ID que você copiou
   - **Client Secret (for OAuth)**: Cole o Client Secret que você copiou
6. Clique em **"Save"** (Salvar)

## Exemplo de como as credenciais se parecem:

**Client ID:**
```
123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

**Client Secret:**
```
GOCSPX-abcdefghijklmnopqrstuvwxyz123456
```

## Troubleshooting

### "Não vejo nenhuma credencial OAuth na lista"
- Isso significa que você ainda não criou as credenciais
- Siga os passos para criar uma nova credencial

### "Não consigo ver o Client Secret"
- O Client Secret só aparece UMA VEZ quando você cria a credencial
- Se você não copiou, precisa criar uma nova credencial
- Delete a antiga e crie uma nova

### "Não consigo criar credenciais - aparece erro sobre consent screen"
- Você precisa configurar a tela de consentimento OAuth primeiro
- Veja o arquivo `GOOGLE_OAUTH_SETUP.md` Passo 3

### "Onde encontro a URL do meu projeto Supabase?"
1. No painel do Supabase
2. Vá em **"Settings"** > **"API"**
3. A URL está em **"Project URL"**
4. Use essa URL (sem `/auth/v1/callback`) para "Authorized JavaScript origins"
5. Use essa URL + `/auth/v1/callback` para "Authorized redirect URIs"

