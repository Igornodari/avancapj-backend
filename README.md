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

Crie um arquivo `.env` na raiz do projeto. Para um passo a passo completo (incluindo o assistente do Firebase Hosting), consulte [docs/firebase-setup.md](docs/firebase-setup.md). Resumo rápido:

1. Gere uma **Service Account** em **Configurações do Projeto → Contas de Serviço → Gerar nova chave** e baixe o JSON (não use o snippet Web com `apiKey`).
2. Copie os campos do JSON para o `.env` (use o `.env.example` como base) **ou** defina `FIREBASE_SERVICE_ACCOUNT_JSON` com o JSON completo (ou caminho do arquivo) para evitar copiar campo a campo. Se preferir automatizar, rode `npx ts-node tools/generate-env-from-service-account.ts --input serviceAccount.json --output .env.local`.
3. Cole a `private_key` em **uma única linha**. Se estiver copiando com quebras de linha, substitua-as por `\n` (sem aspas ao redor) para que o SDK consiga ler corretamente.

Exemplo mínimo:

```env
# Firebase
FIREBASE_PROJECT_ID=seu-project-id
FIREBASE_PRIVATE_KEY_ID=sua-private-key-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nSEU-CONTEUDO-DA-CHAVE\n-----END PRIVATE KEY-----\n
# (Opcional) Cole o JSON inteiro ou informe um caminho para o arquivo
# FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
# FIREBASE_SERVICE_ACCOUNT_JSON=/caminho/absoluto/serviceAccount.json

FIREBASE_CLIENT_EMAIL=seu-client-email@seu-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=seu-client-id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40seu-project-id.iam.gserviceaccount.com

# JWT
JWT_SECRET=seu-jwt-secret-aqui

# Servidor
PORT=3000
```

> Dica: se estiver em Windows PowerShell, use `"` apenas para delimitar a variável no prompt, mas mantenha o valor no `.env` sem aspas. O serviço já normaliza `\n` para quebras de linha reais durante a inicialização.

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
