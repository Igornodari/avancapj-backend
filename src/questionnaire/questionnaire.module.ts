import { Module } from '@nestjs/common';
import { QuestionnaireController } from './questionnaire.controller';
import { QuestionnaireService } from './questionnaire.service';
import { AuthModule } from '../auth/auth.module';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@Module({
  imports: [AuthModule],
  controllers: [QuestionnaireController],
  providers: [QuestionnaireService, FirebaseAuthGuard],
  exports: [QuestionnaireService],
})
export class QuestionnaireModule {}
