import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from '../firebase/firebase.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private firebaseService: FirebaseService,
  ) { }

  async validateFirebaseToken(token: string) {
    const firebaseAuth = this.firebaseService.getAuth();

    if (!firebaseAuth) {
      return {
        uid: 'test-user-123',
        email: 'test@example.com',
        name: 'Usuário de Teste',
      };
    }

    // Diagnóstico rápido do formato
    const parts = token?.split('.')?.length ?? 0;
    console.log('[auth] token parts:', parts, 'len:', token?.length);

    const decoded = jwt.decode(token, { json: true });
    console.log('[auth] decoded iss/aud:', decoded?.iss, decoded?.aud);

    try {
      const decodedToken = await firebaseAuth.verifyIdToken(token);
      return decodedToken;
    } catch (e: any) {
      console.error('[auth] verifyIdToken error:', e.message, e.code);
      throw new UnauthorizedException(e?.message ?? 'Token inválido');
    }
  }

  login(user: any) {
    const payload = {
      email: user.email,
      sub: user.uid,
      name: user.name || user.email,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name || user.email,
      },
    };
  }

  async getUserProfile(uid: string) {
    try {
      const firebaseAuth = this.firebaseService.getAuth();
      if (!firebaseAuth) {
        return {
          uid: uid,
          email: 'test@example.com',
          name: 'Usuário de Teste',
          emailVerified: true,
        };
      }

      const userRecord = await firebaseAuth.getUser(uid);
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
