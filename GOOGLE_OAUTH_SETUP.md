# Configuração do Google OAuth para FinTrack

Este guia detalhado explica como configurar o Google OAuth para autenticação no Supabase.

## Passo 1: Criar projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Faça login com sua conta Google
3. Clique no seletor de projeto no topo (ao lado de "Google Cloud")
4. Clique em **"NEW PROJECT"** (Novo Projeto)
5. Preencha:
   - **Project name**: `FinTrack` (ou outro nome de sua preferência)
   - **Organization**: Deixe como está (se aplicável)
   - **Location**: Deixe como está
6. Clique em **"CREATE"** (Criar)
7. Aguarde alguns segundos e selecione o projeto recém-criado

## Passo 2: Habilitar Google+ API

1. No menu lateral, vá em **"APIs & Services"** > **"Library"** (Biblioteca)
2. Na barra de pesquisa, digite: `Google+ API`
3. Clique em **"Google+ API"**
4. Clique no botão **"ENABLE"** (Habilitar)
5. Aguarde a confirmação

## Passo 3: Configurar Tela de Consentimento OAuth ⚠️ OBRIGATÓRIO

⚠️ **IMPORTANTE**: Você DEVE configurar a tela de consentimento OAuth ANTES de criar as credenciais OAuth. Sem isso, o Google não permitirá criar credenciais.

1. No menu lateral esquerdo, vá em **"APIs & Services"** > **"OAuth consent screen"** (Tela de consentimento OAuth)

2. **Se aparecer a tela "OAuth Overview"** (com a mensagem "You haven't configured any OAuth clients"):
   - Procure por um botão **"CONFIGURE APP"** ou **"CREATE"** ou **"SET UP CONSENT SCREEN"**
   - OU procure por um link/botão que diz algo como **"Configure consent screen"**
   - Clique nesse botão
   - Se não encontrar nenhum botão, tente clicar diretamente em **"OAuth consent screen"** no menu novamente
   - OU tente acessar diretamente: `https://console.cloud.google.com/apis/credentials/consent`

3. **Quando aparecer a tela de seleção de tipo de usuário**:
   - Selecione o tipo de usuário:
     - **External** (para usuários externos) - Recomendado para desenvolvimento/teste
     - **Internal** (apenas para contas Google Workspace)
   - Clique em **"CREATE"** (Criar)

4. **Se você já está na tela de configuração**, continue abaixo

5. Preencha o formulário:

   **App information** (Informações do App):
   - **App name**: `FinTrack` (ou outro nome)
   - **User support email**: Seu email
   - **App logo**: (Opcional) Você pode fazer upload de um logo
   - **Application home page**: `https://seu-dominio.com` (ou deixe em branco para desenvolvimento)
   - **Application privacy policy link**: (Opcional)
   - **Application terms of service link**: (Opcional)
   - **Authorized domains**: (Opcional para desenvolvimento)

   **Developer contact information**:
   - **Email addresses**: Seu email (já preenchido automaticamente)

6. Clique em **"SAVE AND CONTINUE"** (Salvar e Continuar)

7. **Scopes** (Escopos):
   - Clique em **"ADD OR REMOVE SCOPES"**
   - Selecione os escopos básicos:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Clique em **"UPDATE"** e depois **"SAVE AND CONTINUE"**

8. **Test users** (Usuários de teste):
   - Se estiver em modo de teste, adicione emails de teste
   - Clique em **"ADD USERS"** e adicione seu email
   - Clique em **"SAVE AND CONTINUE"**

9. Revise tudo e clique em **"BACK TO DASHBOARD"** (Voltar ao Painel)

## Passo 4: Criar Credenciais OAuth

⚠️ **IMPORTANTE**: Só prossiga se você já completou o Passo 3 (Tela de Consentimento OAuth). Se não, volte e complete primeiro!

1. No menu lateral esquerdo, vá em **"APIs & Services"** > **"Credentials"** (Credenciais)
2. Você verá uma página com:
   - Uma seção "OAuth Overview" no topo
   - Um botão **"Create OAuth client"** ou **"+ CREATE CREDENTIALS"**
   
3. **Se você vê a tela "OAuth Overview"** (como na imagem):
   - Isso significa que a tela de consentimento ainda não está configurada
   - **NÃO clique em "Create OAuth client" ainda**
   - Volte para o **Passo 3** e configure a tela de consentimento primeiro
   - Depois volte aqui

4. **Se você já configurou a tela de consentimento**:
   - Clique no botão **"+ CREATE CREDENTIALS"** (no topo da página)
   - OU clique em **"Create OAuth client"** (se aparecer)
   - Selecione **"OAuth client ID"** (ID do cliente OAuth)
   - Agora o formulário deve aparecer!

5. **Agora o formulário deve aparecer!** Preencha:

   **Application type** (Tipo de aplicação):
   - Selecione **"Web application"** (Aplicação Web)

   **Name** (Nome):
   - Digite: `FinTrack Web Client` (ou outro nome)

   **Authorized JavaScript origins** (Origens JavaScript autorizadas):
   - Clique em **"+ ADD URI"**
   - Adicione a URL do seu projeto Supabase:
     ```
     https://seu-projeto-id.supabase.co
     ```
   - Exemplo: `https://abcdefghijklmnop.supabase.co`
   - ⚠️ **Importante**: Use a URL do seu projeto Supabase (sem `/auth/v1/callback` aqui)

   **Authorized redirect URIs** (URIs de redirecionamento autorizadas):
   - Clique em **"+ ADD URI"**
   - Adicione a URL de callback do Supabase:
     ```
     https://seu-projeto-id.supabase.co/auth/v1/callback
     ```
   - Exemplo: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`
   - ⚠️ **Importante**: Esta é a URL que o Google usará para redirecionar após o login

6. Clique em **"CREATE"** (Criar)

7. **IMPORTANTE**: Uma janela popup aparecerá com:
   - **Your Client ID** (Seu ID do Cliente)
   - **Your Client Secret** (Seu Segredo do Cliente)
   
   ⚠️ **COPIE ESSAS INFORMAÇÕES AGORA!** Você não poderá ver o Client Secret novamente depois de fechar esta janela.

   Se você fechar a janela sem copiar:
   - O Client ID você pode ver novamente na lista de credenciais
   - O Client Secret você precisará criar uma nova credencial

## Passo 5: Configurar no Supabase

1. Acesse o painel do Supabase
2. Vá em **"Authentication"** > **"Providers"** (Provedores)
3. Encontre **"Google"** na lista
4. Clique no toggle para **ativar** o Google
5. Cole as credenciais:
   - **Client ID (for OAuth)**: Cole o Client ID que você copiou
   - **Client Secret (for OAuth)**: Cole o Client Secret que você copiou
6. Clique em **"Save"** (Salvar)

## Passo 6: Testar

1. Acesse sua aplicação FinTrack
2. Clique em "Entrar com Google"
3. Você será redirecionado para o Google
4. Faça login e autorize o acesso
5. Você será redirecionado de volta para a aplicação

## Troubleshooting

### Erro: "redirect_uri_mismatch"
- Verifique se a URI de redirecionamento no Google Cloud Console está exatamente igual a:
  `https://seu-projeto-id.supabase.co/auth/v1/callback`
- Certifique-se de que não há espaços extras ou barras no final

### Erro: "access_denied"
- Verifique se você adicionou seu email como usuário de teste (se estiver em modo de teste)
- Verifique se a tela de consentimento OAuth está configurada corretamente

### Erro: "invalid_client"
- Verifique se o Client ID e Client Secret estão corretos no Supabase
- Certifique-se de que copiou sem espaços extras

### Não consigo ver o Client Secret novamente
- Você precisará criar uma nova credencial OAuth
- Ou redefinir o Client Secret (se disponível)

## Como Desabilitar/Remover OAuth (se não quiser mais usar)

### No Supabase:

1. Acesse o painel do Supabase
2. Vá em **"Authentication"** > **"Providers"**
3. Encontre **"Google"** na lista
4. Clique no toggle para **desativar** o Google
5. (Opcional) Você pode deletar as credenciais se quiser, mas não é necessário

### No Google Cloud Console (Opcional - se quiser remover completamente):

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione seu projeto
3. Vá em **"APIs & Services"** > **"Credentials"**
4. Encontre o OAuth client que você criou
5. Clique nos três pontos (⋮) ao lado do cliente
6. Selecione **"Delete"** (Deletar)
7. Confirme a exclusão

**Nota**: Você não precisa deletar nada no Google Cloud Console se só quiser desabilitar temporariamente. Basta desativar no Supabase.

## Informações Importantes

- **Modo de Teste**: Inicialmente, apenas usuários adicionados como "test users" poderão fazer login
- **Publicação**: Para tornar público, você precisará publicar o app no Google Cloud Console
- **URLs**: Certifique-se de usar a URL correta do seu projeto Supabase (encontre em Settings > API)
- **OAuth é Opcional**: Você pode usar apenas email/senha se preferir, sem configurar Google OAuth

## Onde encontrar a URL do Supabase

1. No painel do Supabase
2. Vá em **"Settings"** (Configurações) > **"API"**
3. A URL está em **"Project URL"**
4. Use essa URL (sem `/auth/v1/callback`) para "Authorized JavaScript origins"
5. Use essa URL + `/auth/v1/callback` para "Authorized redirect URIs"

