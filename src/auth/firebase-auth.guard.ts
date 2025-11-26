import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly jwtService: JwtService,
  ) {}

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
    return null;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token de autenticação não fornecido');
    }

    // Quando o Firebase está configurado, usar o token do Firebase diretamente
    const firebaseAuth = this.firebaseService.getAuth();
    if (firebaseAuth) {
      try {
        const decoded = await firebaseAuth.verifyIdToken(token);
        const userRecord = await firebaseAuth.getUser(decoded.uid);

        request.user = {
          uid: userRecord.uid,
          email: userRecord.email,
          name: userRecord.displayName || userRecord.email,
        };
        return true;
      } catch (error) {
        throw new UnauthorizedException('Token do Firebase inválido');
      }
    }

    // Fallback para ambientes de desenvolvimento/teste usando JWT interno
    try {
      const payload = this.jwtService.verify(token);
      request.user = {
        uid: payload.sub,
        email: payload.email,
        name: payload.name || payload.email,
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
