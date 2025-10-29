# AvançaPJ Backend

Backend NestJS da plataforma AvançaPJ - Sistema de assinaturas com questionário de perfil personalizado.

## 🚀 Tecnologias

- **NestJS 11** - Framework Node.js progressivo
- **TypeScript 5.7** - Linguagem tipada
- **Firebase Admin SDK** - Autenticação e serviços
- **Passport JWT** - Autenticação com tokens
- **Class Validator** - Validação de dados

## 📋 Funcionalidades

### ✅ Sistema de Autenticação
- Autenticação com Firebase Authentication
- Geração de tokens JWT
- Guards de proteção de rotas
- Validação de tokens

### ✅ Módulo de Questionário
- 4 perguntas estratégicas sobre o negócio
- Geração automática de perfil personalizado
- Mapeamento inteligente de ferramentas
- Armazenamento de respostas

### ✅ Gestão de Usuários
- Criação e atualização de perfis
- Armazenamento de informações
- Listagem de usuários

## 📦 Instalação

```bash
# Instalar dependências
npm install
```

## 🔧 Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
# Firebase
FIREBASE_PROJECT_ID=seu-project-id
FIREBASE_PRIVATE_KEY=sua-private-key
FIREBASE_CLIENT_EMAIL=seu-client-email

# JWT
JWT_SECRET=seu-jwt-secret-aqui

# Servidor
PORT=3000
```

## 🏃 Execução

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod

# Testes
npm run test
```

## 📡 Endpoints da API

### Autenticação

**POST /auth**
```json
{
  "token": "firebase-id-token"
}
```

### Questionário

- **GET /questionnaire/questions** - Obter perguntas
- **POST /questionnaire/submit** - Enviar respostas
- **GET /questionnaire/status** - Verificar status
- **GET /questionnaire/profile** - Obter perfil

### Usuários

- **GET /users** - Listar usuários
- **GET /users/:uid** - Obter usuário

## 🗂️ Estrutura do Projeto

```
src/
├── auth/                    # Módulo de autenticação
├── questionnaire/           # Módulo de questionário
├── users/                   # Módulo de usuários
├── firebase/                # Configuração Firebase
└── main.ts                  # Ponto de entrada
```

## ⚠️ Observações

**Dados em Memória**: Atualmente os dados são armazenados em memória. Para produção, implemente banco de dados SQL.

## 🔗 Links

- [Frontend](https://github.com/Igornodari/avancapj-frontend)

## 📝 Licença

Projeto privado - Todos os direitos reservados
