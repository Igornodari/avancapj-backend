import { Controller, Get, Post, Body, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { QuestionnaireService } from './questionnaire.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { QuestionnaireResponse } from './questionnaire.interface';

@Controller('questionnaire')
export class QuestionnaireController {
  constructor(private questionnaireService: QuestionnaireService) {}

  @Get('questions')
  @UseGuards(FirebaseAuthGuard)
  async getQuestions() {
    return {
      questions: this.questionnaireService.getQuestions(),
    };
  }

  @Post('submit')
  @UseGuards(FirebaseAuthGuard)
  async submitQuestionnaire(
    @Request() req,
    @Body() body: { responses: QuestionnaireResponse['responses'] },
  ) {
    try {
      const userId = req.user.uid;
      const profile = await this.questionnaireService.saveResponse(userId, body.responses);
      
      return {
        success: true,
        message: 'Questionário enviado com sucesso',
        profile,
      };
    } catch (error) {
      throw new HttpException(
        'Erro ao processar questionário',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('profile')
  @UseGuards(FirebaseAuthGuard)
  async getUserProfile(@Request() req) {
    const userId = req.user.uid;
    const profile = await this.questionnaireService.getUserProfile(userId);
    
    if (!profile) {
      throw new HttpException('Perfil não encontrado', HttpStatus.NOT_FOUND);
    }

    return profile;
  }

  @Get('status')
  @UseGuards(FirebaseAuthGuard)
  async getQuestionnaireStatus(@Request() req) {
    const userId = req.user.uid;
    const completed = await this.questionnaireService.hasCompletedQuestionnaire(userId);
    
    return {
      completed,
      userId,
    };
  }

  @Get('response')
  @UseGuards(FirebaseAuthGuard)
  async getResponse(@Request() req) {
    const userId = req.user.uid;
    const response = await this.questionnaireService.getResponse(userId);
    
    return response || { message: 'Nenhuma resposta encontrada' };
  }
}
