import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { QuestionnaireService } from './questionnaire.service';
import { FirebaseAuthGuard } from 'src/firebase/firebase-auth.guard';
import type {
  QuestionnaireSubmission,
  UserProfile,
} from './questionnaire.interface';

interface AuthenticatedRequest {
  user: {
    uid: string;
    email: string;
    name: string;
  };
}

@Controller('core/questionnaire')
@UseGuards(FirebaseAuthGuard)
export class QuestionnaireController {
  constructor(private questionnaireService: QuestionnaireService) {}

  /**
   * Retorna questions + metadados (questionnaireId/version)
   * para suportar versionamento no frontend.
   */
  @Get('questions')
  getQuestions() {
    return this.questionnaireService.getQuestionsBundle();
    // retorno esperado:
    // { questionnaireId, version, questions }
  }

  /**
   * Envia respostas.
   * Mantém compatibilidade com o payload atual (só responses),
   * mas também aceita questionnaireId/version (para futuro).
   */
  @Post('submit')
  async submitQuestionnaire(
    @Request() req: AuthenticatedRequest,
    @Body()
    body: {
      questionnaireId?: string;
      version?: string;
      responses: QuestionnaireSubmission['responses'];
    },
  ): Promise<{ success: boolean; message: string; profile: UserProfile }> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        throw new HttpException('Usuário não autenticado', HttpStatus.UNAUTHORIZED);
      }

      const profile = await this.questionnaireService.saveResponse(
        userId,
        body.responses,
        body.questionnaireId,
        body.version,
      );

      return {
        success: true,
        message: 'Questionário enviado com sucesso',
        profile,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Erro ao processar questionário', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('profile')
  async getUserProfile(@Request() req: AuthenticatedRequest): Promise<UserProfile> {
    const userId = req.user?.uid;

    if (!userId) {
      throw new HttpException('Usuário não autenticado', HttpStatus.UNAUTHORIZED);
    }

    const profile = await this.questionnaireService.getUserProfile(userId);

    if (!profile) {
      throw new HttpException('Perfil não encontrado', HttpStatus.NOT_FOUND);
    }

    return profile;
  }

  @Get('status')
  async getQuestionnaireStatus(@Request() req: AuthenticatedRequest) {
    const userId = req.user?.uid;

    if (!userId) {
      throw new HttpException('Usuário não autenticado', HttpStatus.UNAUTHORIZED);
    }

    const status = await this.questionnaireService.getQuestionnaireStatus(userId);
    // retorno recomendado:
    // { completed, questionnaireId, version }
    return status;
  }

  @Get('response')
  async getResponse(@Request() req: AuthenticatedRequest) {
    const userId = req.user?.uid;

    if (!userId) {
      throw new HttpException('Usuário não autenticado', HttpStatus.UNAUTHORIZED);
    }

    const response = await this.questionnaireService.getResponse(userId);
    return response || { message: 'Nenhuma resposta encontrada' };
  }
}
