import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

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

  constructor(private readonly firebaseService: FirebaseService) {}

  async createOrUpdateUser(userData: {
    uid: string;
    email: string;
    name: string;
    clientType?: string;
    workArea?: string;
  }): Promise<UserProfile> {
    const firestore = this.firebaseService.getFirestore();
    const existingUser = await this.getUserByUid(userData.uid);

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

    if (firestore) {
      await firestore.collection('users').doc(user.uid).set(user, { merge: true });
    }

    // fallback local para ambientes sem Firebase configurado
    this.users.set(userData.uid, user);
    return user;
  }

  async getUserByUid(uid: string): Promise<UserProfile | null> {
    const firestore = this.firebaseService.getFirestore();

    if (firestore) {
      const snapshot = await firestore.collection('users').doc(uid).get();
      if (snapshot.exists) {
        return snapshot.data() as UserProfile;
      }
    }

    return this.users.get(uid) || null;
  }

  async updateUserProfile(
    uid: string,
    updateData: Partial<UserProfile>,
  ): Promise<UserProfile> {
    const firestore = this.firebaseService.getFirestore();
    const existingUser = await this.getUserByUid(uid);
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    const updatedUser: UserProfile = {
      ...existingUser,
      ...updateData,
      uid, // Garantir que o UID não seja alterado
      updatedAt: new Date(),
    };

    if (firestore) {
      await firestore.collection('users').doc(uid).set(updatedUser, { merge: true });
    }

    this.users.set(uid, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<UserProfile[]> {
    const firestore = this.firebaseService.getFirestore();

    if (firestore) {
      const snapshot = await firestore.collection('users').get();
      return snapshot.docs.map((doc) => doc.data() as UserProfile);
    }

    return Array.from(this.users.values());
  }
}
