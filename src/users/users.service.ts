import { Injectable } from '@nestjs/common';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  clientType?: string;
  workArea?: string;
  businessType?: string;
  needs?: string[];
  recommendedTools?: string[];
  questionnaireCompleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class UsersService {
  private users: Map<string, UserProfile> = new Map();

  async createOrUpdateUser(userData: {
    uid: string;
    email: string;
    name: string;
    clientType?: string;
    workArea?: string;
  }): Promise<UserProfile> {
    const existingUser = this.users.get(userData.uid);

    const user: UserProfile = {
      uid: userData.uid,
      email: userData.email,
      name: userData.name,
      clientType: userData.clientType || existingUser?.clientType,
      workArea: userData.workArea || existingUser?.workArea,
      businessType: existingUser?.businessType,
      needs: existingUser?.needs,
      recommendedTools: existingUser?.recommendedTools,
      questionnaireCompleted: existingUser?.questionnaireCompleted || false,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    this.users.set(userData.uid, user);
    return user;
  }

  async getUserByUid(uid: string): Promise<UserProfile | null> {
    return this.users.get(uid) || null;
  }

  async updateUserProfile(
    uid: string,
    updateData: Partial<UserProfile>,
  ): Promise<UserProfile> {
    const existingUser = this.users.get(uid);
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    const updatedUser: UserProfile = {
      ...existingUser,
      ...updateData,
      uid, // Garantir que o UID não seja alterado
      updatedAt: new Date(),
    };

    this.users.set(uid, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<UserProfile[]> {
    return Array.from(this.users.values());
  }
}
