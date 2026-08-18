/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudentPerformanceData, ReposicaoItem, SafireStudentCheck } from '../types';

export const URL_API_DESEMPENHO = "https://script.google.com/macros/s/AKfycbzAY6yLI80vR6m4EA6R80xE5K8OOcl1xW917LdvPVchZW_cOLhPLvvQ-4uVRgpmETJx/exec";
export const SCRIPT_URL_SAFIRE = "https://script.google.com/macros/s/AKfycbz-6QfjR8G4V6jCgZztYNu7LcOGjXIQtYYZ06ZCzsMjs9LAaMdI5e4B2JpORm_zlnv_Pw/exec";

export function normalizeString(str?: string): string {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

/**
 * Carrega a base de dados de avaliações com fallback para cache local
 */
export async function fetchDesempenhoData(): Promise<StudentPerformanceData> {
  const cached = localStorage.getItem('opera_dbNotasCloud');
  let data: StudentPerformanceData = {};
  if (cached) {
    try {
      data = JSON.parse(cached);
    } catch {
      // ignore
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);
    const res = await fetch(`${URL_API_DESEMPENHO}?action=read&_t=${Date.now()}`, {
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const json = await res.json();
      if (json && typeof json === 'object') {
        data = json;
        localStorage.setItem('opera_dbNotasCloud', JSON.stringify(json));
      }
    }
  } catch {
    console.warn("Utilizando dados de desempenho armazenados localmente.");
  }

  return data;
}

/**
 * Salva notas do aluno no Google Apps Script e atualiza cache
 */
export async function saveStudentPerformance(
  aluno: string,
  turma: string,
  prof: string,
  notas: unknown
): Promise<boolean> {
  // Salva no cache local imediatamente (optimistic)
  try {
    const cached = localStorage.getItem('opera_dbNotasCloud');
    const localData = cached ? JSON.parse(cached) : {};
    localData[aluno] = notas;
    localStorage.setItem('opera_dbNotasCloud', JSON.stringify(localData));
  } catch {
    // ignore
  }

  const params = new URLSearchParams();
  params.append('action', 'save');
  params.append('aluno', aluno);
  params.append('turma', turma);
  params.append('prof', prof);
  params.append('notas', JSON.stringify(notas));

  try {
    await fetch(URL_API_DESEMPENHO, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    return true;
  } catch (error) {
    console.error("Erro ao salvar na nuvem:", error);
    return false;
  }
}

/**
 * Exclui registro de aluno
 */
export async function deleteStudentPerformance(aluno: string): Promise<boolean> {
  try {
    const cached = localStorage.getItem('opera_dbNotasCloud');
    if (cached) {
      const localData = JSON.parse(cached);
      delete localData[aluno];
      localStorage.setItem('opera_dbNotasCloud', JSON.stringify(localData));
    }
  } catch {
    // ignore
  }

  const params = new URLSearchParams();
  params.append('action', 'delete');
  params.append('aluno', aluno);

  try {
    await fetch(URL_API_DESEMPENHO, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Registra chamada / diário de classe
 */
export async function registrarChamadaNuvem(
  prof: string,
  turma: string,
  dataAula: string,
  licao: string,
  dadosChamada: { nome: string; status: string }[]
): Promise<boolean> {
  const params = new URLSearchParams();
  params.append('action', 'registrar_chamada');
  params.append('prof', prof);
  params.append('turma', turma);
  params.append('dataAula', dataAula);
  params.append('licao', licao);
  params.append('dadosChamada', JSON.stringify(dadosChamada));

  try {
    await fetch(URL_API_DESEMPENHO, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Lista reposições cadastradas
 */
export async function fetchReposicoes(): Promise<ReposicaoItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${URL_API_DESEMPENHO}?action=listar_reposicoes&_t=${Date.now()}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (error) {
    console.warn("Erro ao buscar reposições da nuvem:", error);
  }
  return [];
}

/**
 * Atualiza status de presença ou cancelamento de reposição
 */
export async function updateReposicaoStatus(
  id: string,
  novoStatus: string,
  staffOuProf: string
): Promise<boolean> {
  const params = new URLSearchParams();
  params.append('action', 'atualizar_reposicao');
  params.append('id', id);
  params.append('status', novoStatus);
  params.append('staff', staffOuProf);

  try {
    await fetch(URL_API_DESEMPENHO, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Agenda nova reposição / monitoria
 */
export async function agendarReposicao(dados: {
  tipo: string;
  aluno: string;
  turma: string;
  profOriginal: string;
  profSub: string;
  licao: string;
  modalidade: string;
  dataRep: string;
  horaRep: string;
  staff: string;
}): Promise<boolean> {
  const params = new URLSearchParams();
  params.append('action', 'agendar_reposicao');
  params.append('tipo', dados.tipo);
  params.append('aluno', dados.aluno);
  params.append('turma', dados.turma);
  params.append('profOriginal', dados.profOriginal);
  params.append('profSub', dados.profSub);
  params.append('licao', dados.licao);
  params.append('modalidade', dados.modalidade);
  params.append('dataRep', dados.dataRep);
  params.append('horaRep', dados.horaRep);
  params.append('staff', dados.staff);

  try {
    await fetch(URL_API_DESEMPENHO, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Consulta faltas no Safire
 */
export async function checkSafireFaltas(alunoNome: string): Promise<SafireStudentCheck> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);
    const res = await fetch(`${SCRIPT_URL_SAFIRE}?nome=${encodeURIComponent(alunoNome)}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // ignore
  }
  return { error: true };
}
