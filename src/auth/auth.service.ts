import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private firebaseService: FirebaseService,
  ) {}

  async validateFirebaseToken(token: string) {
    try {
      const firebaseAuth = this.firebaseService.getAuth();

      // Se o Firebase não estiver inicializado, simular validação para desenvolvimento
      if (!firebaseAuth) {
        return {
          uid: 'test-user-123',
          email: 'test@example.com',
          name: 'Usuário de Teste',
        };
      }

      const decodedToken = await firebaseAuth.verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.uid,
      name: user.name || user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
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
      // Se o Firebase não estiver inicializado, retornar dados de teste
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
