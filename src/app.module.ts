import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FirebaseModule } from './firebase/firebase.module';
import { QuestionnaireModule } from './questionnaire/questionnaire.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FirebaseModule,
    AuthModule,
    UsersModule,
    QuestionnaireModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
