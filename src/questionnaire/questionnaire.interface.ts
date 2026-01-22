// src/questionnaire/questionnaire.interface.ts

export type QuestionType = 'single' | 'multiple' | 'text';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  order: number;
  options?: QuestionOption[];
  required?: boolean; // pronto para validação futura
}

export interface QuestionOption {
  id: string;
  text: string;

  /**
   * MVP (mantém compatível com seu modelo atual)
   * No futuro você pode trocar por regras/tags sem quebrar o resto.
   */
  toolsAssociated?: string[];
}

/**
 * Metadados do questionário (permite versionamento)
 */
export interface Questionnaire {
  id: string; // ex: "onboarding"
  activeVersion: string; // ex: "v1"
}

/**
 * Uma versão do questionário com as perguntas daquela versão
 */
export interface QuestionnaireVersion {
  questionnaireId: string; // "onboarding"
  version: string; // "v1"
  questions: Question[];
  createdAt: string; // ISO string
}

/**
 * Submissão (respostas) do usuário.
 * Substitui o antigo QuestionnaireResponse.
 */
export interface QuestionnaireSubmission {
  id?: string; // id do documento no Firestore (opcional)

  userId: string;

  questionnaireId: string; // "onboarding"
  version: string; // "v1"

  responses: Array<{
    questionId: string;
    answer: string | string[];
  }>;

  completedAt: string; // ISO string
}

/**
 * Perfil calculado a partir da submissão.
 * Evolui bem para planos/entitlements depois.
 */
export interface UserProfile {
  userId: string;

  questionnaireId: string; // "onboarding"
  version: string; // "v1"

  workArea: string;
  businessType: string;
  needs: string[];

  /**
   * Recomendação do quiz (não é permissão do plano)
   */
  recommendedTools: string[];

  questionnaireCompleted: boolean;

  updatedAt: string; // ISO string
}
