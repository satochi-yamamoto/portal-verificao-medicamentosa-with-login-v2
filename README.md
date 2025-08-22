# Portal de Verificação Medicamentosa

Sistema inteligente de análise de interações medicamentosas baseado em evidências científicas, desenvolvido com React, Vite, Tailwind CSS e Supabase.

## 🚀 Características Principais

- **Análise Inteligente**: Utiliza IA (OpenAI GPT-4o-mini) para análise de interações medicamentosas
- **Base Científica**: Todas as análises são embasadas em evidências científicas documentadas
- **Interface Moderna**: Desenvolvido com React e Tailwind CSS para uma experiência de usuário otimizada
- **Banco de Dados Robusto**: Utiliza Supabase (PostgreSQL) para armazenamento seguro e escalável
- **Relatórios Detalhados**: Geração de relatórios completos para consultas farmacêuticas

## 🛠 Tecnologias Utilizadas

### Frontend
- **React** - Biblioteca para construção da interface
- **Vite** - Build tool e dev server otimizado
- **Tailwind CSS** - Framework CSS utilitário
- **React Router** - Roteamento client-side
- **Lucide React** - Ícones modernos
- **React Hot Toast** - Notificações elegantes

### Backend & Serviços
- **Supabase** - Backend as a Service (PostgreSQL + APIs)
- **OpenAI API** - Inteligência artificial para análises
- **PostgreSQL** - Banco de dados relacional

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta no Supabase
- Chave da API OpenAI

## 🔧 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/portal-verificacao-medicamentosa.git
cd portal-verificacao-medicamentosa
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Copie o arquivo `.env.example` para `.env` e configure suas credenciais:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
VITE_SUPABASE_URL=https://prscgpxrnfbzjlacuczo.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_supabase
VITE_OPENAI_API_KEY=sua_chave_openai
VITE_OPENAI_TOKEN=seu_token_openai
```

### 4. Configure o banco de dados no Supabase

1. Acesse o [Supabase](https://supabase.com) e crie um novo projeto
2. No SQL Editor, execute **primeiro** o script `database/schema_fixed.sql` para criar as tabelas
3. Em seguida, execute o script `database/interactions_data.sql` para inserir as interações
4. Se encontrar erros, consulte o arquivo `docs/TROUBLESHOOTING.md`

**⚠️ Importante**: Use o arquivo `schema_fixed.sql` (não o `schema.sql`) para evitar erros com extensões PostgreSQL.

### 5. Execute a aplicação
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

- **medications**: Catálogo de medicamentos com informações detalhadas
- **drug_interactions**: Registro de interações medicamentosas conhecidas
- **consultations**: Histórico de consultas farmacêuticas realizadas
- **scientific_sources**: Fontes científicas e referências bibliográficas
- **activity_logs**: Log de atividades do sistema

## 🏗 Arquitetura da Aplicação

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Layout.jsx      # Layout principal da aplicação
│   ├── MedicationSelector.jsx  # Seletor de medicamentos
│   ├── InteractionCard.jsx     # Card de interação
│   └── AnalysisReport.jsx      # Relatório de análise
├── pages/               # Páginas da aplicação
│   ├── Home.jsx        # Página inicial
│   ├── DrugAnalysis.jsx    # Análise de medicamentos
│   ├── DrugInteractions.jsx # Base de interações
│   ├── DrugDatabase.jsx    # Gerenciamento de medicamentos
│   └── Reports.jsx     # Relatórios e estatísticas
├── services/            # Serviços e APIs
│   └── database.js     # Operações do banco de dados
├── lib/                 # Bibliotecas e configurações
│   ├── supabase.js     # Configuração do Supabase
│   └── openai.js       # Integração com OpenAI
└── App.jsx             # Componente principal
```

## 🔍 Funcionalidades

### 1. Análise de Medicamentos
- Seleção múltipla de medicamentos
- Análise automática via IA
- Classificação de severidade das interações
- Recomendações de manejo clínico

### 2. Base de Interações
- Consulta de interações conhecidas
- Filtros por severidade
- Busca por medicamentos
- Informações detalhadas sobre mecanismos

### 3. Gerenciamento de Medicamentos
- CRUD completo de medicamentos
- Busca e filtros avançados
- Categorização por classe terapêutica
- Informações farmacológicas detalhadas

### 4. Relatórios
- Histórico de consultas
- Estatísticas de uso
- Exportação de dados
- Análise de padrões

## 🔒 Segurança

- Row Level Security (RLS) habilitado no Supabase
- Políticas de acesso configuradas
- Logs de atividades para auditoria
- Validação de dados no frontend e backend

## 📚 Medicamentos Pré-cadastrados

O sistema já vem com uma base inicial de medicamentos baseada em casos reais:

- Nitrazepam (Benzodiazepínico)
- Clonazepam (Benzodiazepínico)
- Ácido Valproico (Antiepiléptico)
- Olanzapina (Antipsicótico)
- Anlodipino (Bloqueador de cálcio)
- Losartana (ARA-II)
- Omeprazol (IBP)
- Sinvastatina (Estatina)
- Ciprofibrato (Fibrato)
- Colchicina (Antigotoso)
- Alopurinol (Inibidor xantina oxidase)
- Metformina (Antidiabético)
- Flunarizina (Bloqueador de cálcio)

## 🚧 Desenvolvimento

### Scripts disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa linting do código

### Estrutura de commits

Utilize conventional commits para manter um histórico limpo:
- `feat:` para novas funcionalidades
- `fix:` para correções de bugs
- `docs:` para documentação
- `style:` para mudanças de estilo
- `refactor:` para refatorações
- `test:` para testes

## ⚠️ Aviso Legal

Este sistema é uma ferramenta de apoio à decisão clínica e **NÃO SUBSTITUI** o julgamento profissional do farmacêutico clínico. Todas as análises devem ser revisadas e validadas por um profissional qualificado antes da implementação de qualquer recomendação.

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia o arquivo `CONTRIBUTING.md` para guidelines sobre como contribuir com o projeto.

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através de:
- Email: suporte@portal-medicamentos.com
- Issues do GitHub: [Criar issue](https://github.com/seu-usuario/portal-verificacao-medicamentosa/issues)

---

Desenvolvido com ❤️ para a comunidade farmacêutica
