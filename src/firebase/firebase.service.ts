import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const serviceAccount =
      this.loadServiceAccountFromJson() ?? this.loadServiceAccountFromEnv();

    // Só inicializar se as credenciais estiverem configuradas corretamente
    if (
      serviceAccount?.projectId &&
      serviceAccount.privateKey &&
      serviceAccount.clientEmail &&
      !serviceAccount.projectId.includes('test')
    ) {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(
            serviceAccount as admin.ServiceAccount,
          ),
          databaseURL: `https://${serviceAccount.projectId}-default-rtdb.firebaseio.com`,
        });
      }
    } else {
      console.log(
        'Firebase não inicializado - usando credenciais de teste. Configure as variáveis de ambiente do Firebase para usar a autenticação real.',
      );
    }
  }

  getAuth() {
    return admin.apps.length > 0 ? admin.auth() : null;
  }

  getFirestore() {
    return admin.apps.length > 0 ? admin.firestore() : null;
  }

  private loadServiceAccountFromJson() {
    const rawJson = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON');
    const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!rawJson && !credentialPath) {
      return null;
    }

    try {
      const parsed = rawJson
        ? this.parseJsonOrFile(rawJson)
        : this.readJsonFromFile(credentialPath as string);
      return this.toServiceAccount(parsed);
    } catch (error) {
      console.warn('Falha ao interpretar as credenciais do Firebase:', error);
      return null;
    }
  }

  private loadServiceAccountFromEnv() {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');

    if (!projectId || !privateKey || !clientEmail) {
      return null;
    }

    return this.toServiceAccount({
      project_id: projectId,
      private_key: privateKey,
      client_email: clientEmail,
    });
  }

  private parseJsonOrFile(input: string) {
    const trimmed = input.trim();
    if (fs.existsSync(trimmed)) {
      return this.readJsonFromFile(trimmed);
    }
    return JSON.parse(trimmed);
  }

  private readJsonFromFile(filePath: string) {
    const resolved = path.resolve(filePath);
    const content = fs.readFileSync(resolved, 'utf8');
    return JSON.parse(content);
  }

  private toServiceAccount(raw: Record<string, string>) {
    if (!raw) {
      return null;
    }

    const privateKey = this.sanitizePrivateKey(
      raw.private_key || raw.privateKey,
    );

    return {
      projectId: raw.project_id || raw.projectId,
      privateKey,
      clientEmail: raw.client_email || raw.clientEmail,
    };
  }

  private sanitizePrivateKey(key?: string) {
    if (!key) {
      return null;
    }

    return key
      .trim()
      .replace(/^"([\s\S]*)"$/u, '$1')
      .replace(/^'([\s\S]*)'$/u, '$1')
      .replace(/\\n/g, '\n')
      .replace(/\r\n/g, '\n');
  }
}
