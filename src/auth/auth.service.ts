import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateFirebaseToken(token: string) {
    try {
      // Se o Firebase não estiver inicializado, simular validação para desenvolvimento
      if (!admin.apps.length) {
        // Retornar um usuário de teste para desenvolvimento
        return {
          uid: 'test-user-123',
          email: 'test@example.com',
          name: 'Usuário de Teste',
        };
      }
      
      const decodedToken = await admin.auth().verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.uid,
      name: user.name || user.email 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name || user.email,
      }
    };
  }

  async getUserProfile(uid: string) {
    try {
      // Se o Firebase não estiver inicializado, retornar dados de teste
      if (!admin.apps.length) {
        return {
          uid: uid,
          email: 'test@example.com',
          name: 'Usuário de Teste',
          emailVerified: true,
        };
      }
      
      const userRecord = await admin.auth().getUser(uid);
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName || userRecord.email,
        emailVerified: userRecord.emailVerified,
      };
    } catch (error) {
      throw new Error('Usuário não encontrado');
    }
  }
}

