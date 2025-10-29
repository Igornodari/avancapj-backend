import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Controller('core/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  async authenticate(@Body() body: { token: string }) {
    const user = await this.authService.validateFirebaseToken(body.token);
    const loginResult = await this.authService.login(user);
    return {
      accessToken: loginResult.access_token,
      user: loginResult.user,
    };
  }

  @Post('login')
  async login(@Body() body: { token: string }) {
    const user = await this.authService.validateFirebaseToken(body.token);
    return this.authService.login(user);
  }

  @Get('profile')
  @UseGuards(FirebaseAuthGuard)
  async getProfile(@Request() req) {
    return this.authService.getUserProfile(req.user.uid);
  }

  @Post('verify-token')
  async verifyToken(@Body() body: { token: string }) {
    try {
      const user = await this.authService.validateFirebaseToken(body.token);
      return { valid: true, user };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}
