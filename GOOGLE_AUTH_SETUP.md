# Configuração do Login com Google no Supabase

Este guia explica como configurar o login com Google para sua aplicação BH Fácil.

## Passo 1: Configurar Projeto no Google Cloud

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. No menu lateral, vá para "APIs e Serviços" > "Credenciais"
4. Clique em "Criar Credenciais" e selecione "ID do Cliente OAuth"
5. Configure a tela de consentimento:
   - Tipo de Usuário: Externo
   - Preencha as informações obrigatórias (nome do aplicativo, email de suporte, etc.)

## Passo 2: Criar Credenciais OAuth

1. Após configurar a tela de consentimento, crie um ID do Cliente OAuth:

   - Tipo de aplicativo: Aplicativo da Web
   - Nome: "BH Fácil" (ou outro nome de sua escolha)
   - Origens JavaScript autorizadas:
     - `http://localhost:5173` (para desenvolvimento local)
     - `https://[seu-domínio-de-produção]` (para produção)
   - URIs de redirecionamento autorizados:
     - `http://localhost:5173/auth/callback` (para desenvolvimento local)
     - `https://[seu-domínio-de-produção]/auth/callback` (para produção)
     - `https://[seu-projeto].supabase.co/auth/v1/callback` (URL do callback do Supabase)

2. Clique em "Criar" e anote o **ID do cliente** e o **Segredo do cliente**

## Passo 3: Configurar Supabase

1. Acesse o [Painel do Supabase](https://app.supabase.io)
2. Selecione seu projeto
3. Vá para "Authentication" > "Providers"
4. Encontre "Google" na lista de provedores e clique para ativar
5. Preencha:
   - **Client ID**: ID do cliente que você obteve do Google Cloud
   - **Client Secret**: Segredo do cliente que você obteve do Google Cloud
   - **Redirect URL**: Mantenha a URL padrão gerada pelo Supabase (geralmente `https://[seu-projeto].supabase.co/auth/v1/callback`)
6. Habilite "Google" movendo o botão para a posição "Enabled"
7. Clique em "Save"

## Passo 4: Configure a URL do Site no Supabase

1. Vá para "Authentication" > "URL Configuration"
2. Defina o "Site URL" para:
   - `http://localhost:5173` (para desenvolvimento local)
   - `https://[seu-domínio-de-produção]` (para produção)
3. Adicione redirecionamentos adicionais se necessário (por exemplo, URLs personalizadas de callback)
4. Clique em "Save"

## Testando o Login

Depois de configurar tudo:

1. Execute sua aplicação localmente (`npm run dev`)
2. Navegue até a página de login
3. Clique no botão "Continuar com Google"
4. Você deve ser redirecionado para a página de autenticação do Google
5. Após autenticar, você será redirecionado de volta para seu aplicativo

## Solução de Problemas

### Pop-up Bloqueado

- Certifique-se de que seu navegador não esteja bloqueando pop-ups
- Adicione seu site à lista de permissões no bloqueador de pop-ups

### Erro de Redirecionamento

- Verifique se as URLs de redirecionamento estão configuradas corretamente no Google Cloud
- Verifique se a URL do Site está configurada corretamente no Supabase

### Erro de Client ID/Secret

- Confirme se os valores corretos de Client ID e Secret estão configurados no Supabase
- Não inclua espaços extras antes ou depois dos valores

### Erro de CORS

- Certifique-se de que o domínio da sua aplicação está listado nas origens JavaScript autorizadas no Google Cloud
