# Configuração do Firebase para o AvançaPJ Backend

Este guia mostra o passo a passo para configurar o Firebase e preencher o `.env` sem erros de credenciais ou parsing da chave privada.

## 1) Criar o projeto e habilitar autenticação
1. Acesse o [console do Firebase](https://console.firebase.google.com/) e crie um projeto (ou use um existente).
2. No menu **Build → Authentication → Métodos de login**, ative o provedor desejado (ex.: **Email/senha** ou **Google**). O backend valida tokens emitidos pelo Firebase Auth, portanto você precisa ativar ao menos um provedor.

## 2) Gerar a Service Account
> **Importante:** o backend **não** usa o snippet de configuração Web (`apiKey`, `authDomain`, etc.). Ele precisa do JSON da **Service Account** gerado em *Configurações do projeto → Contas de serviço*. Se você colar o config Web no `.env`, o Firebase Admin SDK não vai autenticar e exibirá erros de credencial.

1. No menu **Configurações do projeto → Contas de serviço**, clique em **Gerar nova chave** para o tipo **Firebase Admin SDK**.
2. Salve o arquivo JSON com segurança.
3. Escolha a forma de carregar as credenciais no backend:
   - **Mapa campo a campo** (padrão): copie os campos do JSON para o `.env`:
     - `project_id` → `FIREBASE_PROJECT_ID`
     - `private_key_id` → `FIREBASE_PRIVATE_KEY_ID`
     - `private_key` → `FIREBASE_PRIVATE_KEY`
     - `client_email` → `FIREBASE_CLIENT_EMAIL`
     - `client_id` → `FIREBASE_CLIENT_ID`
     - `client_x509_cert_url` → `FIREBASE_CLIENT_CERT_URL`
   - **JSON completo**: defina `FIREBASE_SERVICE_ACCOUNT_JSON` com o conteúdo do arquivo JSON **ou** o caminho absoluto para o arquivo (ex.: `FIREBASE_SERVICE_ACCOUNT_JSON=/home/usuario/serviceAccount.json`). O backend detecta automaticamente se o valor é JSON ou um caminho de arquivo. Você também pode usar a variável padrão `GOOGLE_APPLICATION_CREDENTIALS` apontando para o arquivo JSON.

Exemplo de JSON da Service Account (trecho):
```json
{
  "type": "service_account",
  "project_id": "seu-project-id",
  "private_key_id": "123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nSEU-CONTEUDO\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-abc@seu-project-id.iam.gserviceaccount.com",
  "client_id": "1234567890",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-abc%40seu-project-id.iam.gserviceaccount.com"
}
```

## 3) Formatar a private_key corretamente
- **Cole em linha única**, sem aspas. Se o JSON tiver quebras de linha, substitua-as por `\n` (o serviço converte para quebras reais). Exemplo:
  ```env
  FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nSEU-CONTEUDO\n-----END PRIVATE KEY-----\n
  ```
- No Windows PowerShell, mantenha o valor no `.env` sem aspas para evitar `Invalid PEM formatted message`.

## 4) Preencher o `.env`
Use o `.env.example` como referência (campo a campo) ou a opção de JSON completo:
```env
# Firebase
FIREBASE_PROJECT_ID=seu-project-id
FIREBASE_PRIVATE_KEY_ID=sua-private-key-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nSEU-CONTEUDO-DA-CHAVE\n-----END PRIVATE KEY-----\n
# (Opcional) JSON completo ou caminho do arquivo
# FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
# FIREBASE_SERVICE_ACCOUNT_JSON=/caminho/absoluto/serviceAccount.json

# JWT
JWT_SECRET=seu-jwt-secret-aqui

# Servidor
PORT=3000
```

## 5) Testar localmente
1. Instale dependências e rode os testes:
   ```bash
   npm install
   npm test -- --runInBand
   ```
2. Suba o backend em modo dev e verifique se nenhuma exceção de credencial aparece:
   ```bash
   npm run start:dev
   ```

## 6) (Opcional) Usar a CLI do Firebase
Caso queira implantar o frontend no Firebase Hosting ou usar a CLI para debugar:
```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

Esses comandos correspondem às telas do assistente do Firebase Hosting e podem ser executados do diretório do frontend. O backend não precisa ser implantado no Hosting; ele só requer credenciais válidas da Service Account.
