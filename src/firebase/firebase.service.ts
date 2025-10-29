import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');

    // Só inicializar se as credenciais estiverem configuradas corretamente
    if (projectId && privateKey && clientEmail && !projectId.includes('test')) {
      const serviceAccount = {
        type: 'service_account',
        project_id: projectId,
        private_key_id: this.configService.get<string>('FIREBASE_PRIVATE_KEY_ID'),
        private_key: privateKey.replace(/\\n/g, '\n'),
        client_email: clientEmail,
        client_id: this.configService.get<string>('FIREBASE_CLIENT_ID'),
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: this.configService.get<string>('FIREBASE_CLIENT_CERT_URL'),
      };

      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
          databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`,
        });
      }
    } else {
      console.log('Firebase não inicializado - usando credenciais de teste. Configure as variáveis de ambiente do Firebase para usar a autenticação real.');
    }
  }

  getAuth() {
    return admin.apps.length > 0 ? admin.auth() : null;
  }

  getFirestore() {
    return admin.apps.length > 0 ? admin.firestore() : null;
  }
}

