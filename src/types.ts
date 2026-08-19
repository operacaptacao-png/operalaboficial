/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'aluno' | 'prof' | 'staff';

export interface UserSession {
  userLogado: string;
  tipoLoginAtual: UserRole;
  nomeDisplay: string;
  turmaDisplay: string;
  avatar?: string;
}

export interface StudentPerformanceLesson {
  po?: number; // Produção Oral (1-5)
  co?: number; // Compreensão Oral (1-5)
  pe?: number; // Produção Escrita (1-5)
  ce?: number; // Compreensão Escrita (1-5)
  as?: number; // Assiduidade (mantido para compatibilidade, não afeta pizza)
  obsA?: string;
  obsB?: string;
  obsC?: string;
  obsD?: string;
  [key: string]: string | number | undefined;
}

export type StudentPerformanceData = Record<string, StudentPerformanceLesson[]>;

export interface ReposicaoItem {
  id: string;
  aluno: string;
  turma: string;
  status: 'Pendente' | 'Realizado' | 'Faltou' | 'Cancelado';
  profSub: string;
  profOriginal?: string;
  data: string;
  hora: string;
  licao: string;
  modalidade: string;
  staff?: string;
  historico?: string;
}

export interface SafireStudentCheck {
  error?: boolean;
  quaisFaltou?: string[];
  quaisAgendar?: string[];
  totalFaltas?: number;
  mensagem?: string;
  despedida?: string;
  professor?: string;
  turma?: string;
  aluno?: string;
}

export interface CalendarEvent {
  date?: string;
  start?: string;
  end?: string;
  title: string;
  type: 'blue' | 'red' | 'gold';
  highlight?: boolean;
}

export interface AudioItem {
  name: string;
  icon: string;
  pass?: string;
  url: string;
  category: 'target' | 'teens' | 'expert' | 'espanhol';
}
