import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
  constructor(private configService: ConfigService) {
    const jwtSecret =
      configService.get<string>('JWT_SECRET') ||
      'default-secret-key-change-in-production';

    if (!jwtSecret || jwtSecret === 'default-secret-key-change-in-production') {
      console.warn(
        '⚠️  WARNING: Using default JWT_SECRET. Please set JWT_SECRET in .env file for production!',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    return {
      uid: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  }
}
