import { Injectable } from '@nestjs/common';
import {
  Question,
  QuestionnaireSubmission,
  UserProfile,
} from './questionnaire.interface';

type ResponseItem = QuestionnaireSubmission['responses'][number];

@Injectable()
export class QuestionnaireService {
  private readonly questionnaireId = 'onboarding';
  private readonly version = 'v1';

  private questions: Question[] = [
    {
      id: 'q1',
      text: 'Qual é o seu ramo de atuação?',
      type: 'single',
      order: 1,
      options: [
        { id: 'tech', text: 'Tecnologia', toolsAssociated: ['tool-dev', 'tool-analytics'] },
        { id: 'commerce', text: 'Comércio', toolsAssociated: ['tool-inventory', 'tool-sales'] },
        { id: 'services', text: 'Serviços', toolsAssociated: ['tool-scheduling', 'tool-crm'] },
        { id: 'education', text: 'Educação', toolsAssociated: ['tool-lms', 'tool-content'] },
        { id: 'health', text: 'Saúde', toolsAssociated: ['tool-scheduling', 'tool-records'] },
        { id: 'finance', text: 'Financeiro', toolsAssociated: ['tool-accounting', 'tool-reports'] },
        { id: 'other', text: 'Outro', toolsAssociated: [] },
      ],
    },
    {
      id: 'q2',
      text: 'Qual o tamanho da sua empresa?',
      type: 'single',
      order: 2,
      options: [
        { id: 'solo', text: 'Autônomo/Freelancer', toolsAssociated: ['tool-basic'] },
        { id: 'small', text: 'Pequena (1-10 funcionários)', toolsAssociated: ['tool-team'] },
        { id: 'medium', text: 'Média (11-50 funcionários)', toolsAssociated: ['tool-team', 'tool-advanced'] },
        { id: 'large', text: 'Grande (50+ funcionários)', toolsAssociated: ['tool-enterprise'] },
      ],
    },
    {
      id: 'q3',
      text: 'Quais são suas principais necessidades? (Selecione todas que se aplicam)',
      type: 'multiple',
      order: 3,
      options: [
        { id: 'customer-management', text: 'Gestão de Clientes', toolsAssociated: ['tool-crm'] },
        { id: 'financial-control', text: 'Controle Financeiro', toolsAssociated: ['tool-accounting', 'tool-reports'] },
        { id: 'project-management', text: 'Gestão de Projetos', toolsAssociated: ['tool-projects'] },
        { id: 'inventory', text: 'Controle de Estoque', toolsAssociated: ['tool-inventory'] },
        { id: 'sales', text: 'Vendas', toolsAssociated: ['tool-sales'] },
        { id: 'marketing', text: 'Marketing', toolsAssociated: ['tool-marketing'] },
        { id: 'analytics', text: 'Análise de Dados', toolsAssociated: ['tool-analytics'] },
        { id: 'automation', text: 'Automação de Processos', toolsAssociated: ['tool-automation'] },
      ],
    },
    {
      id: 'q4',
      text: 'Qual é o seu principal objetivo ao usar nossa plataforma?',
      type: 'single',
      order: 4,
      options: [
        { id: 'efficiency', text: 'Aumentar Eficiência', toolsAssociated: ['tool-automation'] },
        { id: 'growth', text: 'Crescer o Negócio', toolsAssociated: ['tool-marketing', 'tool-sales'] },
        { id: 'organization', text: 'Melhorar Organização', toolsAssociated: ['tool-projects', 'tool-crm'] },
        { id: 'cost-reduction', text: 'Reduzir Custos', toolsAssociated: ['tool-accounting'] },
      ],
    },
  ];

  private submissions: Map<string, QuestionnaireSubmission> = new Map();
  private userProfiles: Map<string, UserProfile> = new Map();

  getQuestions(): Question[] {
    return this.questions.slice().sort((a, b) => a.order - b.order);
  }

  saveResponse(userId: string, responses: QuestionnaireSubmission['responses'], questionnaireId?: string, version?: string) {
    const submission: QuestionnaireSubmission = {
      userId,
      questionnaireId: questionnaireId || this.questionnaireId,
      version: version || this.version,
      responses,
      completedAt: new Date().toISOString(),
    };

    this.submissions.set(userId, submission);

    const profile = this.generateUserProfile(userId, responses);
    this.userProfiles.set(userId, profile);

    return profile;
  }
  getQuestionnaireStatus(userId: string) {
    return { completed: this.hasCompletedQuestionnaire(userId), questionnaireId: this.questionnaireId, version: this.version };
  }

  getQuestionsBundle() {
    return { questionnaireId: this.questionnaireId, version: this.version, questions: this.getQuestions() };
  }

  private generateUserProfile(userId: string, responses: QuestionnaireSubmission['responses']): UserProfile {
    const toolsSet = new Set<string>();
    let workArea = '';
    let businessType = '';
    const needs: string[] = [];

    responses.forEach((response: ResponseItem) => {
      const question = this.questions.find((q) => q.id === response.questionId);
      if (!question) return;

      if (question.id === 'q1') {
        const option = question.options?.find((opt) => opt.id === response.answer);
        if (option) {
          workArea = option.text;
          option.toolsAssociated?.forEach((tool) => toolsSet.add(tool));
        }
        return;
      }

      if (question.id === 'q2') {
        const option = question.options?.find((opt) => opt.id === response.answer);
        if (option) {
          businessType = option.text;
          option.toolsAssociated?.forEach((tool) => toolsSet.add(tool));
        }
        return;
      }

      if (question.id === 'q3') {
        const answers = Array.isArray(response.answer) ? response.answer : [response.answer];
        answers.forEach((answerId) => {
          const option = question.options?.find((opt) => opt.id === answerId);
          if (option) {
            needs.push(option.text);
            option.toolsAssociated?.forEach((tool) => toolsSet.add(tool));
          }
        });
        return;
      }

      if (question.id === 'q4') {
        const option = question.options?.find((opt) => opt.id === response.answer);
        option?.toolsAssociated?.forEach((tool) => toolsSet.add(tool));
      }
    });

    return {
      userId,
      questionnaireId: this.questionnaireId,
      version: this.version,
      workArea,
      businessType,
      needs,
      recommendedTools: Array.from(toolsSet),
      questionnaireCompleted: true,
      updatedAt: new Date().toISOString(),
    };
  }

  getUserProfile(userId: string): UserProfile | null {
    return this.userProfiles.get(userId) || null;
  }

  hasCompletedQuestionnaire(userId: string): boolean {
    const profile = this.userProfiles.get(userId);
    return !!profile?.questionnaireCompleted;
  }

  getResponse(userId: string): QuestionnaireSubmission | null {
    return this.submissions.get(userId) || null;
  }
}
