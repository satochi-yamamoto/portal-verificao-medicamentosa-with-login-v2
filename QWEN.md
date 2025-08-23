# Portal de Verificação Medicamentosa - Contexto para Qwen Code

## Visão Geral do Projeto

Este é um sistema inteligente de análise de interações medicamentosas baseado em evidências científicas, desenvolvido com React, Vite, Tailwind CSS e Supabase. O sistema permite a análise de múltiplos medicamentos, identificando interações potenciais com base em dados científicos e inteligência artificial.

## Tecnologias Principais

- **Frontend:** React, Vite, Tailwind CSS, React Router
- **Backend:** Supabase (PostgreSQL, autenticação, APIs)
- **Inteligência Artificial:** OpenAI API (gpt-4o-mini)
- **Banco de Dados:** PostgreSQL (via Supabase)

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Layout.jsx      # Layout principal da aplicação
│   ├── MedicationSelector.jsx  # Seletor de medicamentos
│   ├── InteractionCard.jsx     # Card de interação
│   ├── AnalysisReport.jsx      # Relatório de análise
│   └── ... outros componentes
├── pages/               # Páginas da aplicação
│   ├── Home.jsx        # Página inicial
│   ├── DrugAnalysis.jsx    # Análise de medicamentos
│   ├── DrugInteractions.jsx # Base de interações
│   ├── DrugDatabase.jsx    # Gerenciamento de medicamentos
│   └── Reports.jsx     # Relatórios e estatísticas
├── services/            # Serviços e APIs
│   └── database.js     # Operações do banco de dados
│   └── consultationLogs.js # Logs de consultas
│   └── medicationCacheRefactored.js # Cache de combinações
│   └── medicationCaptureEnhanced.js # Captura automática de medicamentos
│   └── interactionService.js # Serviços de interações
├── lib/                 # Bibliotecas e configurações
│   ├── supabase.js     # Configuração do Supabase
│   └── openai.js       # Integração com OpenAI
└── App.jsx             # Componente principal
```

## Funcionalidades Principais

### 1. Análise de Medicamentos (`/drug-analysis`)
- Permite ao usuário selecionar múltiplos medicamentos (com dosagem) para análise.
- Utiliza a API da OpenAI para analisar as interações entre os medicamentos.
- Implementa um sistema de cache para evitar reanálises de combinações já processadas.
- Captura automaticamente os medicamentos analisados para a base de dados.
- Gera relatórios detalhados com:
  - Mecanismo farmacológico das interações
  - Consequências clínicas
  - Manejo clínico
  - Recomendações práticas
  - Monitoramento necessário
- Permite exportar o relatório em formato PDF.
- Exibe histórico de consultas anteriores.

### 2. Base de Interações (`/drug-interactions`)
- Exibe uma lista de interações medicamentosas conhecidas.
- Permite filtrar interações por severidade (Maior, Moderada, Menor).
- Fornece informações detalhadas sobre cada interação:
  - Medicamentos envolvidos
  - Mecanismo
  - Efeito clínico
  - Manejo
  - Monitoramento
  - Nível de evidência

### 3. Base de Medicamentos (`/drug-database`)
- Mostra os medicamentos que foram capturados automaticamente durante as análises.
- Exibe informações detalhadas sobre cada medicamento (obtidas via IA):
  - Princípio ativo
  - Classe terapêutica
  - Mecanismo de ação
  - Indicações principais
  - Contraindicações
  - Efeitos adversos
  - Interações importantes
  - Monitoramento
  - Instruções de administração
- Permite adicionar/editar medicamentos manualmente.
- Exibe estatísticas sobre os medicamentos mais consultados.

### 4. Relatórios (`/reports`)
- Apresenta estatísticas de uso do sistema:
  - Total de consultas
  - Tempo médio de análise
  - Tokens usados (OpenAI)
  - Taxa de erro
- Exibe os medicamentos mais analisados.
- Mostra o histórico detalhado das consultas.
- Permite exportar os dados em formato CSV.

## Banco de Dados (Supabase)

### Tabelas Principais
- **`medications`**: Catálogo de medicamentos com informações detalhadas.
- **`drug_interactions`**: Registro de interações medicamentosas conhecidas.
- **`consultations`**: Histórico de consultas farmacêuticas realizadas.
- **`consultation_logs`**: Logs detalhados de cada análise realizada (incluindo requisições, respostas, duração, tokens).
- **`medication_combinations_cache`**: Cache de análises já realizadas.
- **`consultation_history`**: Histórico de consultas a combinações em cache.

### Funcionalidades Especiais do Banco
- Row Level Security (RLS) habilitado para controle de acesso.
- Funções RPC (Procedural Language/PSQL) para operações complexas:
  - `get_cached_combination`: Busca combinações no cache.
  - `save_combination_cache`: Salva uma nova combinação no cache.
  - `cleanup_expired_cache`: Remove combinações expiradas do cache.
  - `get_detailed_medications`: Retorna medicamentos com estatísticas.

## Integração com OpenAI

- Utiliza o modelo `gpt-4o-mini` para as análises.
- Implementa verificações pós-análise para garantir que todos os medicamentos solicitados foram abordados.
- Em caso de omissão de medicamentos na análise inicial, força uma nova análise.
- Extrai dados estruturados dos medicamentos para popular a base de dados.

## Componentes e Serviços Importantes

### Serviços (`src/services/`)
- **`consultationLogs.js`**: Gerencia os logs das consultas (criação, atualização, busca, estatísticas).
- **`medicationCacheRefactored.js`**: Implementa o sistema de cache de combinações de medicamentos.
- **`medicationCaptureEnhanced.js`**: Captura automaticamente medicamentos das análises, enriquecendo-os com dados da IA.
- **`database.js`**: Fornece acesso às tabelas principais do banco de dados.
- **`interactionService.js`**: Fornece acesso às interações medicamentosas.

### Componentes (`src/components/`)
- **`Layout.jsx`**: Layout principal com cabeçalho, navegação e rodapé.
- **`MedicationSelector.jsx`**: Componente para selecionar medicamentos para análise.
- **`AnalysisReport.jsx`**: Componente para exibir o relatório da análise.
- **`InteractionCard.jsx`**: Componente para exibir informações sobre uma interação.

## Comandos de Desenvolvimento

- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build`: Gera build de produção.
- `npm run preview`: Visualiza o build de produção.
- `npm run lint`: Executa linting do código.

## Considerações de Segurança

- Row Level Security (RLS) habilitado no Supabase.
- Políticas de acesso configuradas (leitura pública, escrita permitida).
- Logs de atividades para auditoria.
- Validação de dados no frontend e backend.

## Aviso Legal

Este sistema é uma ferramenta de apoio à decisão clínica e **NÃO SUBSTITUI** o julgamento profissional do farmacêutico clínico. Todas as análises devem ser revisadas e validadas por um profissional qualificado antes da implementação de qualquer recomendação.
