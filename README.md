# Berry Bet

Berry Bet é uma aplicação backend para gerenciamento de apostas, jogos, usuários e estatísticas, construída em Go utilizando o framework Gin e SQLite.

## Estrutura de Pastas e Arquivos

```
├── api/                  # Rotas e agrupamentos de endpoints (REST)
│   ├── auth/             # Rotas de autenticação (login, register)
│   ├── bets/             # Rotas de apostas
│   ├── games/            # Rotas de jogos
│   ├── outcomes/         # Rotas de resultados
│   ├── sessions/         # Rotas de sessões
│   ├── transactions/     # Rotas de transações
│   ├── user_stats/       # Rotas de estatísticas de usuário
│   ├── users/            # Rotas de usuários
│   └── router.go         # Registro central de rotas
│
├── config/               # Configuração e conexão com banco de dados
│   └── db.go             # Setup do SQLite e execução de migrações
│
├── data/                 # Dados persistentes
│   └── berry_bet.db      # Banco de dados SQLite
│
├── internal/             # Lógica de negócio, models, DTOs e utilitários
│   ├── auth/             # Autenticação, JWT, login, registro
│   ├── bets/             # Lógica de apostas (model, service, handler, DTO)
│   ├── games/            # Lógica de jogos (model, service, handler, DTO)
│   ├── games/roulette/   # Submódulo para roleta
│   ├── outcomes/         # Lógica de resultados (model, service, handler, DTO)
│   ├── sessions/         # Lógica de sessões (model, service, handler)
│   ├── transactions/     # Lógica de transações (model, service, handler, DTO)
│   ├── user_stats/       # Estatísticas de usuário (model, service, handler, DTO)
│   ├── users/            # Lógica de usuários (model, service, handler, DTO, balance)
│   └── utils/            # Utilitários globais (validação, responses, segurança, middlewares)
│
├── migrations/           # Scripts SQL para criação e atualização do banco
│   ├── 001_create_users.sql
│   ├── 002_create_games.sql
│   ├── ...
│   └── 008_create_bet_limits.sql
│
├── main.go               # Ponto de entrada da aplicação
├── go.mod / go.sum       # Dependências do projeto
└── .env                  # Variáveis de ambiente (ex: JWT_SECRET)
```

## Descrição dos Principais Arquivos e Pastas

- **api/**: Define e agrupa as rotas REST, separando por domínio (ex: bets, users, games). Cada subpasta importa os handlers do respectivo módulo em `internal/`.
- **config/db.go**: Inicializa o banco de dados SQLite, executa as migrações e mantém a conexão global.
- **data/**: Armazena o arquivo do banco de dados SQLite.
- **internal/**: Contém toda a lógica de negócio, models, DTOs, validações, handlers e utilitários.
  - **auth/**: Lida com autenticação, geração e validação de JWT, login e registro de usuários.
  - **bets/**, **games/**, **outcomes/**, **sessions/**, **transactions/**, **user_stats/**, **users/**: Cada módulo possui:
    - `model.go`: Structs que representam entidades do banco.
    - `dto.go`: Structs para request/response (nunca expõem models diretamente).
    - `handler.go`: Recebem requests, validam, delegam para services e respondem.
    - `service.go`: (quando presente) Lógica de negócio e validações.
  - **utils/**: Funções utilitárias globais:
    - `validation.go`: Validação de email, CPF, telefone, datas.
    - `apiresponse.go`: Padronização de respostas de sucesso/erro.
    - `errormiddleware.go`: Middleware global de tratamento de erros.
    - `security.go`: Funções de segurança (ex: hash de senha).
- **migrations/**: Scripts SQL para criar e atualizar as tabelas do banco.
- **main.go**: Inicializa o servidor, carrega variáveis de ambiente, configura middlewares globais (CORS, erros), registra rotas e inicia a aplicação.
- **.env**: Variáveis sensíveis, como JWT_SECRET.

## Fluxo Básico da Aplicação
1. O servidor é iniciado por `main.go`.
2. O banco é configurado e migrado automaticamente.
3. Middlewares globais são aplicados (CORS, tratamento de erros).
4. As rotas são registradas e protegidas por JWT quando necessário.
5. Handlers recebem requests, validam dados, delegam para services e respondem usando DTOs.
6. Toda resposta segue o padrão de sucesso/erro definido em `utils/apiresponse.go`.

## Segurança
- Endpoints sensíveis protegidos por JWT.
- Senhas nunca são expostas ou logadas.
- Validação rigorosa de dados de entrada.
- Middleware global de tratamento de erros.
- CORS configurado via middleware.

## Testes e Documentação
- Recomenda-se criar testes automatizados para handlers e services.
- Para documentação da API, utilize Swagger/OpenAPI (exemplo: https://github.com/swaggo/swag).

## Como rodar o projeto
1. Instale Go 1.20+ e SQLite3.
2. Configure o arquivo `.env` com a variável `JWT_SECRET`.
3. Execute:
   ```sh
   go run main.go
   ```
4. Acesse a API em `http://localhost:8080`.

---

Para dúvidas ou contribuições, abra uma issue ou pull request.
