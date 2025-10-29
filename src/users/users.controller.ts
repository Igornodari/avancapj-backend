import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { UsersService, UserProfile } from './users.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req): Promise<UserProfile> {
    const user = await this.usersService.getUserByUid(req.user.uid);
    if (!user) {
      // Criar usuário se não existir
      return this.usersService.createOrUpdateUser({
        uid: req.user.uid,
        email: req.user.email,
        name: req.user.name,
      });
    }
    return user;
  }

  @Put('profile')
  async updateProfile(
    @Request() req,
    @Body()
    updateData: { clientType?: string; workArea?: string; name?: string },
  ): Promise<UserProfile> {
    return this.usersService.updateUserProfile(req.user.uid, updateData);
  }

  @Post('setup')
  async setupProfile(
    @Request() req,
    @Body() setupData: { clientType: string; workArea: string },
  ): Promise<UserProfile> {
    return this.usersService.updateUserProfile(req.user.uid, setupData);
  }

  @Get('all')
  async getAllUsers(): Promise<UserProfile[]> {
    return this.usersService.getAllUsers();
  }
}
