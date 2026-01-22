/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import type { DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class FirebaseService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const serviceAccount =
      this.loadServiceAccountFromJson() ?? this.loadServiceAccountFromEnv();

    const { projectId, privateKey, clientEmail } = serviceAccount || {};

    if (projectId && privateKey && clientEmail && !projectId.includes('test')) {
      const sanitizedPrivateKey = privateKey
        .trim()
        .replace(/^"([\s\S]*)"$/u, '$1')
        .replace(/^'([\s\S]*)'$/u, '$1')
        .replace(/\\n/g, '\n');

      const serviceAccountObj = {
        type: 'service_account',
        project_id: projectId,
        private_key_id: this.configService.get<string>(
          'FIREBASE_PRIVATE_KEY_ID',
        ),
        private_key: sanitizedPrivateKey,
        client_email: clientEmail,
        client_id: this.configService.get<string>('FIREBASE_CLIENT_ID'),
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url:
          'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: this.configService.get<string>(
          'FIREBASE_CLIENT_CERT_URL',
        ),
      };

      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(
            serviceAccountObj as admin.ServiceAccount,
          ),
          databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`,
        });
      }
    } else {
      console.log(
        'Firebase não inicializado - usando credenciais de teste. Configure as variáveis de ambiente do Firebase para usar a autenticação real.',
      );
    }
  }

  async verifyToken(token: string): Promise<DecodedIdToken> {
    return admin.auth().verifyIdToken(token);
  }

  getAuth() {
    return admin.apps.length > 0 ? admin.auth() : null;
  }

  getFirestore() {
    return admin.apps.length > 0 ? admin.firestore() : null;
  }

  private loadServiceAccountFromJson() {
    const rawJson = this.configService.get<string>(
      'FIREBASE_SERVICE_ACCOUNT_JSON',
    );
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
