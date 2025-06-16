# Berry Bet — Guia de Estrutura e Colaboração

Este projeto é uma paródia crítica de sites de apostas, feito em Go (backend) e HTML/CSS/JS (frontend). O objetivo deste README é explicar claramente o papel de cada pasta/arquivo, onde implementar cada parte do sistema e como colaborar.

---

## 📁 Estrutura do Projeto

```
berry_bet/
├── cmd/server/         # Ponto de entrada do backend (main.go)
├── data/               # Banco de dados SQLite (criado automaticamente)
├── frontend/           # Código do frontend (HTML/CSS/JS)
│   ├── landing/        # Página inicial
│   ├── games/          # Páginas de jogos
│   └── account/        # Páginas de conta do usuário
├── internal/           # Código de backend (Go)
│   ├── config/         # Configurações do sistema
│   ├── db/             # Conexão e migrações do banco de dados
│   ├── handler/        # Handlers HTTP (rotas da API)
│   └── service/        # Lógica de negócio (Go)
├── migrations/         # Arquivos .sql de criação de tabelas (agora embutidos em internal/db/migrations)
├── go.mod / go.sum     # Dependências do Go
└── README.md           # Este arquivo
```

---

## 🗂️ O que colocar em cada pasta/arquivo

### 1. `cmd/server/main.go`
- **Função:** Ponto de entrada do backend.
- **O que fazer aqui:**
  - Inicializar o banco de dados.
  - Criar o router HTTP.
  - Registrar as rotas principais (ex: `/api/usuarios`, `/api/apostas`).
  - Iniciar o servidor.
- **Não coloque:** Lógica de negócio, SQL ou HTML.

### 2. `internal/db/`
- **Função:** Tudo relacionado ao banco de dados.
- **O que fazer aqui:**
  - `sqlite.go`: Conexão com o banco, execução das migrations.
  - `migrations/`: Arquivos `.sql` para criar/alterar tabelas.
- **Não coloque:** Lógica de negócio ou rotas HTTP.

### 3. `internal/handler/`
- **Função:** Handlers HTTP (funções que recebem requisições e devolvem respostas).
- **O que fazer aqui:**
  - Criar funções para cada rota da API (ex: `CriarUsuarioHandler`, `FazerApostaHandler`).
  - Receber/parsing de dados do frontend.
  - Chamar funções de `service/` para executar regras de negócio.
- **Não coloque:** SQL direto ou lógica de negócio complexa.

### 4. `internal/service/`
- **Função:** Lógica de negócio da aplicação.
- **O que fazer aqui:**
  - Funções que implementam as regras do sistema (ex: validar aposta, calcular saldo, autenticar usuário).
  - Chamar funções de acesso ao banco (de `db/`) quando necessário.
- **Não coloque:** Código de roteamento HTTP ou SQL bruto.

### 5. `frontend/`
- **Função:** Todo o código do frontend (HTML, CSS, JS).
- **O que fazer aqui:**
  - `landing/`: Página inicial do site.
  - `games/`: Páginas dos jogos.
  - `account/`: Login, cadastro, perfil, histórico.
  - Use JS para consumir a API do backend.
- **Não coloque:** Código Go ou SQL.

### 6. `data/`
- **Função:** Armazenar o arquivo do banco de dados SQLite.
- **O que fazer aqui:**
  - Nada manualmente. O arquivo é criado pelo backend.

### 7. `migrations/` (ou `internal/db/migrations/`)
- **Função:** Scripts SQL para criar/alterar tabelas.
- **O que fazer aqui:**
  - Adicionar/editar arquivos `.sql` para criar novas tabelas ou alterar existentes.
- **Não coloque:** Código Go ou HTML.

---

## 🔄 Fluxo de Desenvolvimento

1. **Frontend:**
   - Crie páginas e scripts JS em `frontend/`.
   - Consuma a API do backend usando `fetch` ou AJAX.

2. **Backend:**
   - Crie rotas em `internal/handler/`.
   - Implemente regras em `internal/service/`.
   - Acesse o banco via funções de `internal/db/`.

3. **Banco de Dados:**
   - Crie/edite migrations em `internal/db/migrations/`.
   - O backend aplica as migrations automaticamente ao iniciar.

---

## 🧑‍💻 Exemplo de fluxo para adicionar uma funcionalidade

1. **Nova funcionalidade:** Cadastro de usuário
2. **Passos:**
   - Crie a rota `/api/usuarios` em `internal/handler/usuario.go`.
   - Implemente a lógica de cadastro em `internal/service/usuario.go`.
   - Crie a tabela `users` em uma migration `.sql` se ainda não existir.
   - No frontend, crie o formulário de cadastro em `frontend/account/`.
   - Use JS para enviar os dados para a API.

---

## 🛠️ Dicas para colaboração

- Sempre crie uma branch para sua tarefa.
- Comente o código e explique decisões importantes.
- Combine com o grupo antes de alterar a estrutura.
- Use o README como referência para onde colocar cada coisa.

---

## 📬 Dúvidas

Se não souber onde colocar algo, pergunte no grupo ou consulte este README!
