# FitPlan

Aplicativo fitness responsivo em React + TypeScript + Vite, com interface em português brasileiro.

## Funcionalidades implementadas

- Onboarding inicial para nome, objetivo, nível, local e frequência de 3 a 6 dias por semana.
- Calendário semanal com treinos e dias de recuperação.
- Biblioteca inicial de exercícios com séries, repetições, descanso, instruções, erros comuns e alternativas.
- Modo de treino interativo com registro de carga/repetições, marcação de séries e cronômetro de descanso.
- Sugestões gerais de alimentação por refeição e objetivo.
- Hidratação diária com incrementos de 250 ml.
- Biblioteca pessoal de links musicais e playlists.
- Histórico local de treinos e registros de peso, cintura e observações.
- Layout responsivo com navegação desktop e mobile.
- Persistência local no navegador usando localStorage.

## Executar localmente

Requisitos: Node.js LTS e npm.

```bash
npm install
npm run dev
```

Para validar a compilação:

```bash
npm run build
npm run preview
```

## Importante sobre persistência e autenticação

Sem as variáveis Supabase, o aplicativo funciona em modo local. **Com Supabase configurado e a migração SQL aplicada**, a tela de cadastro/login por e-mail é ativada e os dados passam a ser sincronizados por conta com políticas RLS. Os dados do localStorage podem ser perdidos ao limpar os dados do navegador e não devem ser tratados como armazenamento seguro de dados sensíveis.

Para produção, revise as políticas RLS, configure backups e regras de privacidade. Não coloque chaves secretas no frontend. A chave pública/anon do Supabase pode ser usada no cliente apenas com RLS corretamente configurado.

## Segurança e saúde

O FitPlan fornece sugestões gerais e não substitui avaliação de profissional de educação física, médico ou nutricionista. Exercícios e refeições devem ser adaptados à capacidade e às necessidades individuais. Interrompa a atividade e procure atendimento adequado diante de sintomas preocupantes.

## Próximas etapas recomendadas

1. Configurar um projeto Supabase e validar cadastro, login e recuperação de senha.
2. Executar e revisar a migração SQL, testar o isolamento entre usuários e a sincronização.
3. Adicionar testes automatizados e validar todos os fluxos.
4. Incluir demonstrações verificadas para cada exercício.
5. Configurar PWA e, quando necessário, notificações com consentimento.
6. Revisar acessibilidade, privacidade e comportamento offline antes da publicação.

## Ativar login e sincronização na nuvem

1. Crie um projeto em [Supabase](https://supabase.com/dashboard).
2. No SQL Editor do projeto, revise e execute `supabase/migrations/001_initial_schema.sql`.
3. Em Authentication → Providers, habilite Email. Configure o e-mail de confirmação, URLs de redirecionamento e SMTP adequado antes de publicar.
4. Crie o arquivo `.env.local` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA_ANON
```

5. Execute `npm install` e `npm run dev`. Faça cadastro com duas contas diferentes e verifique que os dados de uma conta não aparecem na outra.

**Importante:** não envie chaves `service_role` ao GitHub, não coloque segredos em variáveis `VITE_*` e não publique um projeto antes de validar as políticas de segurança.

### Como funciona a sincronização

O app mantém dados locais separados por ID de usuário, sincroniza um snapshot JSON com `public.user_app_state` e utiliza as políticas RLS do Supabase. O salvamento é disparado após mudanças locais, com pequeno atraso para reduzir requisições. Ainda não há resolução sofisticada de conflitos entre dois dispositivos editando ao mesmo tempo; a última gravação prevalece.

### Implantação

Para publicar em Vercel ou Netlify, importe este repositório, use `npm run build` e a pasta `dist`. Cadastre as duas variáveis públicas do Supabase no provedor de hospedagem e adicione o domínio final às URLs permitidas do Supabase Auth.

