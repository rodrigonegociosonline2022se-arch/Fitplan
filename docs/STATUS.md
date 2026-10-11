# Estado atual do FitPlan

## Incluído no repositório
- Aplicação React + TypeScript + Vite e interface responsiva em português.
- Questionário inicial, objetivo, nível, local e frequência de 3, 4, 5 ou 6 dias.
- Calendário, exercícios iniciais, séries, repetições, cargas e descanso.
- Sugestões gerais de refeições e registro de hidratação.
- Links de música/playlists e registro de peso, cintura, observações e treinos.
- Manifest web, ícone e migração SQL inicial com tabelas e políticas RLS para Supabase.

## Limitações importantes
- Cadastro/login real ainda não está conectado a um provedor.
- A interface guarda os dados em localStorage neste navegador.
- A migração SQL não foi aplicada automaticamente a um projeto Supabase.
- Exercícios usam um ícone ilustrativo, não uma demonstração anatômica verificada.
- Notificações push, reprodução musical interna, publicação em lojas e testes automatizados não estão configurados.

## Próximas etapas para ativar backend
1. Criar um projeto Supabase.
2. Revisar e executar a migração SQL em supabase/migrations/001_initial_schema.sql no SQL Editor.
3. Integrar Supabase Auth ao fluxo de cadastro/login.
4. Substituir persistência local por chamadas autenticadas ao banco, mantendo RLS ativa.
5. Usar apenas URL e chave pública/anon no frontend. Nunca colocar service_role no navegador.
6. Testar isolamento entre contas e validar políticas antes de usar dados reais.
