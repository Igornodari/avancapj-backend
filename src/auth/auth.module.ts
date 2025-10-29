import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseStrategy } from './firebase.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret =
          configService.get<string>('JWT_SECRET') ||
          'default-secret-key-change-in-production';

        if (!secret || secret === 'default-secret-key-change-in-production') {
          console.warn(
            '⚠️  WARNING: Using default JWT_SECRET. Please set JWT_SECRET in .env file for production!',
          );
        }

        return {
          secret,
          signOptions: { expiresIn: '24h' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, FirebaseStrategy],
  exports: [AuthService],
})
export class AuthModule {}
