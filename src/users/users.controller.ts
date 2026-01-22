import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService, UserProfile } from './users.service';
import { FirebaseAuthGuard } from 'src/firebase/firebase-auth.guard';

interface AuthenticatedRequest {
  user: {
    uid: string;
    email: string;
    name: string;
  };
}

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req: AuthenticatedRequest): Promise<UserProfile> {
    const user = await this.usersService.getUserByUid(req.user.uid);
    if (!user) {
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
    @Request() req: AuthenticatedRequest,
    @Body()
    updateData: { clientType?: string; workArea?: string; name?: string },
  ): Promise<UserProfile> {
    return this.usersService.updateUserProfile(req.user.uid, updateData);
  }

  @Post('setup')
  async setupProfile(
    @Request() req: AuthenticatedRequest,
    @Body() setupData: { clientType: string; workArea: string },
  ): Promise<UserProfile> {
    return this.usersService.updateUserProfile(req.user.uid, setupData);
  }

  @Get('all')
  async getAllUsers(): Promise<UserProfile[]> {
    return this.usersService.getAllUsers();
  }
}
