import { Module } from '@nestjs/common';
import { QuestionnaireController } from './questionnaire.controller';
import { QuestionnaireService } from './questionnaire.service';
import { AuthModule } from '../auth/auth.module';
import { FirebaseService } from 'src/firebase/firebase.service';

@Module({
  imports: [AuthModule],
  controllers: [QuestionnaireController],
  providers: [QuestionnaireService, FirebaseService],
  exports: [QuestionnaireService],
})
export class QuestionnaireModule {}
