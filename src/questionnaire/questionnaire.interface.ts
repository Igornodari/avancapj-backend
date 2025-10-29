export interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'text';
  options?: QuestionOption[];
  order: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  toolsAssociated?: string[]; // IDs das ferramentas associadas a esta opção
}

export interface QuestionnaireResponse {
  userId: string;
  responses: {
    questionId: string;
    answer: string | string[]; // string para single/text, array para multiple
  }[];
  completedAt: Date;
}

export interface UserProfile {
  userId: string;
  workArea: string;
  businessType: string;
  needs: string[];
  recommendedTools: string[];
  questionnaireCompleted: boolean;
}
