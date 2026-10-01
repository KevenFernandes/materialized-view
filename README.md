# 📊 Materialized View Pattern com Node.js, TypeScript e PostgreSQL

Este projeto é uma demonstração prática do padrão de design de gerenciamento de dados **Materialized View** (Visão Materializada), implementado sobre uma **arquitetura em camadas** limpa e desacoplada em Node.js com TypeScript e PostgreSQL.

A aplicação simula um cenário comum em sistemas de e-commerce/varejo: a geração de relatórios consolidados de vendas agregadas a partir de tabelas transacionais com alto volume de escritas.

---

## 🎯 O Padrão de Design: Materialized View

### Por que utilizar?
Em sistemas OLTP (Online Transaction Processing), consultas analíticas com múltiplos `JOIN`s, agrupamentos (`GROUP BY`) e funções de agregação (`SUM`, `COUNT`) sobre tabelas de movimentação (ex: pedidos e itens de pedidos) demandam alto custo computacional de CPU, memória e I/O de disco. À medida que a base cresce para milhões de registros, essas consultas tornam-se lentas e podem causar concorrência de locks e degradação da performance geral do banco de dados.

O padrão **Materialized View** resolve esse gargalo ao **pré-calcular e persistir fisicamente em disco** o resultado da consulta agregada em uma tabela de leitura otimizada (`mv_resumo_vendas_produtos`).

### Principais Benefícios e Compensações (Trade-offs):
- ⚡ **Leituras Ultrarrápidas**: A consulta ao relatório passa de uma varredura complexa com junções em múltiplas tabelas para um `SELECT` direto e simples sobre a tabela materializada.
- 🛡️ **Isolamento de Carga**: O relatório não concorre com as operações transacionais de escrita (novos pedidos, atualizações de estoque, pagamentos).
- ⚖️ **Consistência Eventual (Trade-off)**: Os dados lidos podem ter uma pequena latência em relação à escrita mais recente, dependendo da janela de atualização.
- 🔄 **Estratégia de Atualização no Projeto**: Um job em segundo plano (`MaterializedViewJob`) atualiza e recomputa periodicamente a tabela da visão materializada em intervalos configuráveis (a cada 60 segundos por padrão).

---

## 🏗️ Arquitetura em Camadas

O código foi estruturado seguindo o padrão de **Arquitetura em Camadas (Layered Architecture)**, garantindo separação de responsabilidades, testabilidade e baixo acoplamento:

```
src/
├── config/             # Configurações do pool de banco de dados e variáveis de ambiente
├── controllers/        # Camada de Apresentação (recebe requisições HTTP e entrega respostas)
├── factories/          # Composition Root (instanciação e injeção de dependências)
├── jobs/               # Camada de Segundo Plano (agendador do refresh da visão materializada)
├── repositories/       # Camada de Persistência (contratos abstratos e implementações PostgreSQL)
│   ├── materialized-view/
│   └── order/
├── services/           # Camada de Aplicação / Regra de Negócio
├── types/              # Definições de tipos e interfaces do TypeScript
├── routes.ts           # Definição e mapeamento de rotas Express
└── server.ts           # Ponto de entrada da aplicação e inicialização do servidor HTTP
```

### Detalhamento das Camadas:
1. **Presentation (Controllers)**: Recebe a requisição HTTP, valida parâmetros e delega o processamento para a camada de serviço (`MaterializedViewController` e `LiveSummaryController`).
2. **Application (Services)**: Contém a orquestração e a lógica da aplicação (`MaterializedViewService` e `LiveSummaryService`).
3. **Persistence (Repositories)**: Utiliza o padrão Repository com contratos abstratos (`OrderRepository`, `MaterializedViewRepository`) e implementações concretas para PostgreSQL, respeitando o princípio de **Inversão de Dependências (DIP)**.
4. **Background Jobs (`src/jobs`)**: Agendador assíncrono gerenciado pelo ciclo de vida da aplicação que roda em intervalos definidos para recomputar e atualizar a visão materializada.
5. **Factories (`src/factories`)**: Centraliza a montagem das instâncias com injeção de dependência (`SalesFactory`).

---

## 🛣️ Rotas da Aplicação

A API disponibiliza duas abordagens para fins de consulta e comparação:

| Método | Rota | Descrição | Origem dos Dados |
| :--- | :--- | :--- | :--- |
| `GET` | `/sales-report/sumary` | Retorna o resumo consolidado de vendas | Tabela da **Materialized View** (`mv_resumo_vendas_produtos`) |
| `GET` | `/sales-report/live` | Retorna o resumo de vendas calculado em tempo real | Consulta agregada direta nas tabelas de **Origem** (`itens_pedido`, `pedidos`, `produtos`) |

---

## ⏱️ Comparação de Desempenho: Insomnia vs. Banco de Dados

Ao testar as duas rotas em ferramentas como **Insomnia** ou **Postman** em ambiente de desenvolvimento local, o tempo de resposta retornado pode parecer **praticamente imperceptível** (ex: ambas respondendo em torno de 5ms a 20ms). 

Isso ocorre por dois motivos:
1. **Overhead de Rede e HTTP**: O tempo gasto na conexão HTTP local, parsing de cabeçalhos e serialização do Node.js mascara a diferença que ocorre no banco.
2. **Volume de Dados Local reduzido**: Com poucos registros de seed, o PostgreSQL faz o processamento quase instantâneo na memória cache (RAM).

### 🔍 Como ver o tempo real de execução a nível de Engine

Para visualizar a diferença real no plano de execução e o custo de processamento do PostgreSQL sem o ruído da camada HTTP, execute as consultas diretamente no banco utilizando `EXPLAIN ANALYZE`:

#### 1. Consulta em tempo real (dados brutos transacionais):
Calcula `JOIN`s, agrupamentos e somatórios em tempo de execução:
```bash
docker compose exec database psql -U postgres -d mercadinho -c "
EXPLAIN ANALYZE
SELECT 
  p.id AS produto_id,
  p.nome AS produto_nome,
  COUNT(DISTINCT ped.id) AS total_pedidos,
  SUM(ip.quantidade) AS qtd_total_vendida,
  SUM(ip.quantidade * ip.preco_unitario) AS receita_total
FROM itens_pedido ip
INNER JOIN pedidos ped ON ped.id = ip.pedido_id
INNER JOIN produtos p ON p.id = ip.produto_id
WHERE ped.status = 'concluido'
GROUP BY p.id, p.nome;"
```

#### 2. Consulta sobre a Visão Materializada:
Realiza uma leitura direta e sequencial sobre a tabela pré-calculada:
```bash
docker compose exec database psql -U postgres -d mercadinho -c "
EXPLAIN ANALYZE
SELECT * FROM mv_resumo_vendas_produtos;"
```

> 💡 **O que observar nos resultados:**
> - **Execution Time**: Observe a diferença de tempo de execução real do motor.
> - **Planning Time & Steps**: Na consulta de origem, o banco precisa executar etapas como `Hash Join`, `HashAggregate` e varredura em 3 tabelas distintas. Na visão materializada, há apenas um `Seq Scan` simples e linear sobre uma única tabela.

---

## 🚀 Como Executar a Aplicação

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)

---

### Passo a Passo

#### 1. Clone o repositório e acesse a pasta:
```bash
git clone <url-do-repositorio>
cd materialized-view
```

#### 2. Configure as variáveis de ambiente:
Copie o arquivo de exemplo para criar o seu `.env`:
```bash
cp .env.example .env
```
*(No Windows PowerShell: `Copy-Item .env.example .env`)*

As configurações padrão já apontam para o container Docker:
```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=*
DATABASE_URL=postgresql://postgres:pass123@localhost:5433/mercadinho
```

#### 3. Suba o banco de dados PostgreSQL com Docker Compose:
```bash
docker compose up -d
```
> O Docker irá criar o banco `mercadinho` na porta `5433` e executará automaticamente os scripts de inicialização (tabelas e seed de dados presentes na pasta `docker/initial-scripts/`).

#### 4. Instale as dependências:
```bash
npm install
```

#### 5. Execute a aplicação:

- **Modo Desenvolvimento (com hot-reload via `tsx watch`):**
  ```bash
  npm run dev
  ```

- **Compilar para Produção (TypeScript -> JavaScript em `dist/`):**
  ```bash
  npm run build
  ```

- **Executar a build de Produção:**
  ```bash
  npm run start
  ```

Assim que a aplicação iniciar, você verá as mensagens de inicialização do job de sincronização e o servidor rodando em `http://localhost:3000`.

---

## 🛠️ Tecnologias Utilizadas

- **Runtime**: [Node.js](https://nodejs.org/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Framework Web**: [Express](https://expressjs.com/)
- **Executor & Watcher**: [tsx](https://github.com/privatenumber/tsx)
- **Banco de Dados**: [PostgreSQL](https://www.postgresql.org/) (via driver `pg`)
- **Containers**: [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
