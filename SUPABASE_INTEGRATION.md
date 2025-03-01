# Integração com Supabase

Este documento descreve as alterações realizadas para integrar o Supabase ao projeto V2BHF.

## Alterações Realizadas

### 1. Configuração do Supabase
- Criado cliente Supabase em `src/lib/supabase.ts`
- Adicionadas variáveis de ambiente no arquivo `.env.example`
- Criado script SQL para inicialização do banco de dados em `scripts/schema.sql`
- Criado script de migração de dados em `scripts/migration.ts`

### 2. Autenticação
- Atualizado o store para usar autenticação do Supabase
- Atualizada a página de login para usar Supabase
- Criada página de callback para autenticação OAuth
- Adicionada rota de callback no App.tsx

### 3. Gerenciamento de Dados
- Atualizados os serviços para profissionais e registros de tempo
- Atualizado o store para usar os serviços do Supabase
- Adicionado estado de carregamento (isLoading) para feedback visual
- Atualizada a página de registro para usar o Supabase

### 4. Documentação
- Atualizado o README com instruções para configuração do Supabase
- Criado este documento de resumo das alterações

## Próximos Passos

1. **Configuração do Supabase**
   - Criar projeto no Supabase
   - Configurar autenticação (Email/Senha, OAuth)
   - Executar script SQL para criar tabelas
   - Configurar variáveis de ambiente

2. **Migração de Dados**
   - Executar script de migração para dados iniciais
   - Verificar se os dados foram migrados corretamente

3. **Testes**
   - Testar autenticação (login, logout, OAuth)
   - Testar CRUD de profissionais
   - Testar CRUD de registros de tempo
   - Verificar se as políticas de segurança estão funcionando

4. **Melhorias Futuras**
   - Implementar armazenamento de arquivos para avatares
   - Adicionar funções de busca e filtragem no Supabase
   - Implementar sistema de notificações em tempo real
   - Adicionar autenticação por telefone (SMS)

## Observações Importantes

- As tabelas no Supabase usam snake_case para nomes de colunas, enquanto o frontend usa camelCase
- As funções de conversão entre os formatos estão implementadas no store
- As políticas de segurança (RLS) estão configuradas para permitir acesso apenas a usuários autenticados
- O script de migração pode ser executado com `npm run migrate:data` 