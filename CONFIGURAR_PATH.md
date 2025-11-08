# Como Configurar o PATH do Node.js no Cursor

O Node.js está instalado em `C:\Program Files\nodejs`, mas não está no PATH do sistema. Aqui estão as soluções:

## Solução 1: Arquivo de Configuração do Cursor (Recomendado) ✅

Já foi criado o arquivo `.vscode/settings.json` que configura o PATH automaticamente para o terminal do Cursor.

**Para aplicar:**
1. Feche e reabra o Cursor
2. Abra um novo terminal (Ctrl + `)
3. Teste: `node --version` e `npm --version`

## Solução 2: Adicionar ao PATH do Sistema (Permanente)

Se quiser que funcione em todos os lugares (não só no Cursor):

### Windows 10/11:

1. Pressione `Win + X` e selecione "Sistema"
2. Clique em "Configurações avançadas do sistema"
3. Clique em "Variáveis de Ambiente"
4. Em "Variáveis do sistema", encontre "Path" e clique em "Editar"
5. Clique em "Novo"
6. Adicione: `C:\Program Files\nodejs`
7. Clique em "OK" em todas as janelas
8. **Reinicie o Cursor** para aplicar as mudanças

### Via PowerShell (como Administrador):

```powershell
[Environment]::SetEnvironmentVariable(
    "Path",
    [Environment]::GetEnvironmentVariable("Path", "Machine") + ";C:\Program Files\nodejs",
    "Machine"
)
```

Depois, reinicie o Cursor.

## Solução 3: Perfil do PowerShell (Temporário por Sessão)

Crie um perfil do PowerShell que adiciona o Node.js ao PATH toda vez que abrir um terminal:

1. Abra o PowerShell
2. Execute:
```powershell
if (!(Test-Path -Path $PROFILE)) { New-Item -ItemType File -Path $PROFILE -Force }
notepad $PROFILE
```

3. Adicione esta linha no arquivo que abrir:
```powershell
$env:PATH += ";C:\Program Files\nodejs"
```

4. Salve e feche
5. Reinicie o terminal

## Verificar se Funcionou

Depois de aplicar qualquer solução, teste:

```powershell
node --version
npm --version
```

Se mostrar as versões, está funcionando! ✅

## Solução Rápida (Temporária)

Se precisar usar agora mesmo sem reiniciar, execute no terminal:

```powershell
$env:PATH += ";C:\Program Files\nodejs"
```

Isso adiciona o Node.js ao PATH apenas para esta sessão do terminal.

## Recomendação

Use a **Solução 1** (arquivo `.vscode/settings.json`) se quiser que funcione apenas no Cursor, ou a **Solução 2** se quiser que funcione em todo o sistema.

