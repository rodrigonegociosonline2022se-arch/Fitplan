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

Esta primeira versão salva dados no navegador do dispositivo atual. Ela **ainda não possui autenticação real, sincronização entre dispositivos nem banco de dados Supabase configurado**. Os dados do localStorage podem ser perdidos ao limpar os dados do navegador e não devem ser tratados como armazenamento seguro de dados sensíveis.

Para produção, configure Supabase Auth, tabelas com Row Level Security (RLS), políticas por usuário, backups e regras de privacidade. Não coloque chaves secretas no frontend. A chave pública/anon do Supabase pode ser usada no cliente apenas com RLS corretamente configurado.

## Segurança e saúde

O FitPlan fornece sugestões gerais e não substitui avaliação de profissional de educação física, médico ou nutricionista. Exercícios e refeições devem ser adaptados à capacidade e às necessidades individuais. Interrompa a atividade e procure atendimento adequado diante de sintomas preocupantes.

## Próximas etapas recomendadas

1. Integrar Supabase Auth e recuperação de senha.
2. Criar banco de dados e políticas RLS para perfil, planos, sessões, séries, hidratação, músicas e progresso.
3. Adicionar testes automatizados e validar todos os fluxos.
4. Incluir demonstrações verificadas para cada exercício.
5. Configurar PWA e, quando necessário, notificações com consentimento.
6. Revisar acessibilidade, privacidade e comportamento offline antes da publicação.
