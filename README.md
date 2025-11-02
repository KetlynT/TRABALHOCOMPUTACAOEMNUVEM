# Sistema de Gerenciamento de Projetos Colaborativos (local)

## Requisitos
- Docker e Docker Compose

## Rodando com Docker Compose
1. Na raiz do projeto, rode:
   ```bash
   docker-compose up --build
2. Aguarde os containers subirem. O primeiro start do container `api` vai criar o banco.
3. Acesse `http://localhost:5000/swagger` para testar endpoints (ex.: `POST /api/auth/login` com `{ "email":"a@b.com", "password":"password" }`).
4. No frontend, vá para `http://localhost:3000`, faça login e veja o dashboard (se houver projetos no banco — crie via `POST /api/projects` no Swagger).