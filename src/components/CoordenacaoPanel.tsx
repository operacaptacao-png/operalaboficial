/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserSession, StudentPerformanceData, StudentPerformanceLesson } from '../types';
import { PERF_MASTER_DB } from '../data/database';
import { 
  ClipboardCheck, 
  Search, 
  TrendingUp, 
  Award, 
  Sparkles,
  ChevronDown,
  ChevronRight,
  Eye,
  Printer,
  X,
  FileText,
  UserCheck
} from 'lucide-react';

interface CoordenacaoPanelProps {
  session: UserSession;
  perfData: StudentPerformanceData;
}

export default function CoordenacaoPanel({ perfData }: CoordenacaoPanelProps) {
  const [selectedProf, setSelectedProf] = useState<string>('TODOS');
  const [expandedTurmas, setExpandedTurmas] = useState<Record<string, boolean>>({});

  // Student Detail Modal state
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<{
    nome: string;
    turma: string;
    prof: string;
  } | null>(null);

  const toggleTurma = (tKey: string) => {
    setExpandedTurmas(prev => ({ ...prev, [tKey]: !prev[tKey] }));
  };

  const calculateStudentPie = (aluno: string, turma: string) => {
    const notas = perfData[aluno] || [];
    const isEspanhol = turma.toUpperCase().startsWith('ESP');
    const maxL = isEspanhol ? 5 : 8;

    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let validos = 0;

    for (let i = 0; i < maxL; i++) {
      const lesson = notas[i] || {};
      ['po', 'co', 'pe', 'ce'].forEach((k) => {
        const v = Number(lesson[k]);
        if (v >= 1 && v <= 5) {
          counts[v]++;
          validos++;
        }
      });
    }

    if (validos === 0) return 'conic-gradient(#cbd5e1 0% 100%)';

    const p1 = (counts[1] / validos) * 100;
    const p2 = (counts[2] / validos) * 100;
    const p3 = (counts[3] / validos) * 100;
    const p4 = (counts[4] / validos) * 100;

    return `conic-gradient(#ef4444 0% ${p1}%, #f97316 ${p1}% ${p1 + p2}%, #eab308 ${p1 + p2}% ${p1 + p2 + p3}%, #3b82f6 ${p1 + p2 + p3}% ${p1 + p2 + p3 + p4}%, #22c55e ${p1 + p2 + p3 + p4}% 100%)`;
  };

  // Calcula estatísticas pedagógicas
  let totalAlunosGeral = 0;
  let totalComNotaGeral = 0;
  let totalAvaliacoesCompletas = 0;

  const profStats: {
    prof: string;
    totalAlunos: number;
    alunosAvaliados: number;
    percentual: number;
    turmas: {
      turma: string;
      totalAlunos: number;
      alunosAvaliados: number;
      percentual: number;
      alunos: { nome: string; percentual: number; preenchidas: number; totalLições: number }[];
    }[];
  }[] = [];

  for (const prof in PERF_MASTER_DB) {
    let pTotalAlunos = 0;
    let pAvaliados = 0;
    const pTurmas = [];

    for (const turma in PERF_MASTER_DB[prof]) {
      const alunos = PERF_MASTER_DB[prof][turma];
      const isEspanhol = turma.toUpperCase().startsWith('ESP');
      const maxL = isEspanhol ? 5 : 8;

      let tAvaliados = 0;
      const alunosInfo = alunos.map((aluno) => {
        const notas = perfData[aluno] || [];
        let preenchidas = 0;
        for (let i = 0; i < maxL; i++) {
          const l = notas[i];
          if (l && (Number(l.po) > 0 || Number(l.co) > 0 || Number(l.pe) > 0 || Number(l.ce) > 0 || (l.obsA && l.obsA.length > 0))) {
            preenchidas++;
          }
        }
        const perc = Math.round((preenchidas / maxL) * 100);
        if (perc > 0) tAvaliados++;
        if (perc === 100) totalAvaliacoesCompletas++;
        return { nome: aluno, percentual: perc, preenchidas, totalLições: maxL };
      });

      pTotalAlunos += alunos.length;
      pAvaliados += tAvaliados;
      totalAlunosGeral += alunos.length;
      totalComNotaGeral += tAvaliados;

      const tPerc = alunos.length > 0 ? Math.round((tAvaliados / alunos.length) * 100) : 0;
      pTurmas.push({
        turma,
        totalAlunos: alunos.length,
        alunosAvaliados: tAvaliados,
        percentual: tPerc,
        alunos: alunosInfo
      });
    }

    const pPerc = pTotalAlunos > 0 ? Math.round((pAvaliados / pTotalAlunos) * 100) : 0;
    profStats.push({
      prof,
      totalAlunos: pTotalAlunos,
      alunosAvaliados: pAvaliados,
      percentual: pPerc,
      turmas: pTurmas
    });
  }

  const percentualGeral = totalAlunosGeral > 0 ? Math.round((totalComNotaGeral / totalAlunosGeral) * 100) : 0;

  const profsList = ['TODOS', ...Object.keys(PERF_MASTER_DB)];
  const profsExibidos = selectedProf === 'TODOS' 
    ? profStats 
    : profStats.filter(p => p.prof === selectedProf);

  // Student active details for modal
  const studentNotas = selectedStudentDetail ? (perfData[selectedStudentDetail.nome] || []) : [];
  const isEspanholActive = selectedStudentDetail?.turma.toUpperCase().startsWith('ESP');
  const maxLActive = isEspanholActive ? 5 : 8;

  return (
    <div className="page-content w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-slate-200 pb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#0b2545] flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 text-[#eebd1a]" />
            <span>Auditoria Pedagógica</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            Painel da Coordenação • Acompanhamento de Preenchimento do Performance Lab
          </p>
        </div>

        {/* Prof Filter */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xxs font-black text-slate-400 uppercase pl-2">Professor:</span>
          <select
            value={selectedProf}
            onChange={(e) => setSelectedProf(e.target.value)}
            className="bg-transparent font-black text-xs uppercase text-[#0b2545] p-1.5 outline-none cursor-pointer"
          >
            {profsList.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-1">
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Total de Alunos Ativos</span>
          <span className="text-3xl font-black text-[#0b2545]">{totalAlunosGeral}</span>
          <p className="text-xxs font-semibold text-slate-400">Em todas as turmas 2026.1</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-1">
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Alunos com Avaliação Iniciada</span>
          <span className="text-3xl font-black text-blue-600">{totalComNotaGeral}</span>
          <p className="text-xxs font-semibold text-slate-400">{percentualGeral}% do corpo discente</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-1">
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Prontos para Certificado (100%)</span>
          <span className="text-3xl font-black text-emerald-600">{totalAvaliacoesCompletas}</span>
          <p className="text-xxs font-semibold text-slate-400">Todas as lições avaliadas</p>
        </div>
      </div>

      {/* Audit List per Professor */}
      <div className="space-y-6">
        {profsExibidos.map((pStat) => (
          <div
            key={pStat.prof}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            {/* Prof Header Card */}
            <div className="bg-slate-50 p-5 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-black text-base uppercase text-[#0b2545]">
                  Professor(a): <span className="text-[#eebd1a]">{pStat.prof}</span>
                </h3>
                <p className="text-xxs font-bold text-slate-400 uppercase mt-0.5">
                  {pStat.turmas.length} turmas sob responsabilidade • {pStat.totalAlunos} alunos
                </p>
              </div>

              {/* Progress */}
              <div className="w-full md:w-64 space-y-1">
                <div className="flex justify-between text-xxs font-black uppercase">
                  <span className="text-slate-500">Progresso Geral</span>
                  <span className={pStat.percentual >= 80 ? 'text-emerald-600' : pStat.percentual >= 40 ? 'text-amber-500' : 'text-red-500'}>
                    {pStat.percentual}% ({pStat.alunosAvaliados}/{pStat.totalAlunos})
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pStat.percentual >= 80 ? 'bg-emerald-500' : pStat.percentual >= 40 ? 'bg-amber-400' : 'bg-red-500'
                    }`}
                    style={{ width: `${pStat.percentual}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Turmas Breakdown */}
            <div className="divide-y divide-slate-100 p-4 space-y-3">
              {pStat.turmas.map((t) => {
                const tKey = `${pStat.prof}-${t.turma}`;
                const isExpanded = !!expandedTurmas[tKey];

                return (
                  <div key={t.turma} className="pt-2">
                    <div
                      onClick={() => toggleTurma(tKey)}
                      className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition select-none"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        <div>
                          <h4 className="font-black text-xs text-[#0b2545] uppercase">{t.turma}</h4>
                          <span className="text-xxs font-bold text-slate-400 uppercase">
                            {t.alunosAvaliados} de {t.totalAlunos} alunos avaliados • Clique para ver alunos
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-xxs font-black px-2.5 py-1 rounded-full uppercase ${
                          t.percentual >= 80 ? 'bg-emerald-100 text-emerald-800' : t.percentual >= 40 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {t.percentual}% Concluído
                        </span>
                      </div>
                    </div>

                    {/* Alunos list inside expanded turma (Clique no aluno para detalhamento) */}
                    {isExpanded && (
                      <div className="pl-8 pr-3 py-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-slate-50/50 rounded-xl mt-2">
                        {t.alunos.map((a) => (
                          <div
                            key={a.nome}
                            onClick={() => setSelectedStudentDetail({ nome: a.nome, turma: t.turma, prof: pStat.prof })}
                            className="bg-white hover:bg-slate-100/90 p-3 rounded-lg border border-slate-200 hover:border-[#0b2545] flex justify-between items-center cursor-pointer transition shadow-xs group"
                          >
                            <div className="truncate pr-2">
                              <span className="font-black text-xxs text-[#0b2545] group-hover:text-red-600 uppercase truncate block">
                                {a.nome}
                              </span>
                              <span className="text-xxs text-slate-400 font-bold uppercase block mt-0.5">
                                Ver detalhamento
                              </span>
                            </div>
                            <span className={`text-xxs font-black flex-shrink-0 ${
                              a.percentual === 100 ? 'text-emerald-600' : a.percentual > 0 ? 'text-amber-500' : 'text-slate-300'
                            }`}>
                              {a.percentual}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: DETALHAMENTO DO DESEMPENHO DO ALUNO (AUDITORIA PEDAGÓGICA) */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 bg-[#0b2545]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-4 border-[#0b2545] shadow-2xl p-6 md:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-100 pb-4">
              <div>
                <span className="text-xxs font-black uppercase text-[#e2001a] bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Auditoria de Desempenho
                </span>
                <h2 className="text-xl md:text-2xl font-black uppercase text-[#0b2545] mt-2">
                  {selectedStudentDetail.nome}
                </h2>
                <p className="text-xxs font-bold text-slate-400 uppercase mt-0.5">
                  Turma: <strong className="text-[#0b2545]">{selectedStudentDetail.turma}</strong> • Docente Responsável: <strong>{selectedStudentDetail.prof}</strong>
                </p>
              </div>

              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Pizza and Overall Status */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50 p-5 rounded-2xl border border-slate-200 gap-4">
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-full border-2 border-[#0b2545] flex-shrink-0 shadow-inner"
                  style={{ background: calculateStudentPie(selectedStudentDetail.nome, selectedStudentDetail.turma) }}
                />
                <div>
                  <h4 className="font-black text-xs uppercase text-[#0b2545]">Consolidação de Competências</h4>
                  <p className="text-xxs text-slate-500 font-medium">Distribuição das habilidades avaliadas por cores pelo docente</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xxs font-black uppercase">
                <span className="flex items-center gap-1.5 bg-red-50 text-red-700 px-2.5 py-1 rounded-full border border-red-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>Em Desenv.
                </span>
                <span className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full border border-orange-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>Básico
                </span>
                <span className="flex items-center gap-1.5 bg-yellow-50 text-yellow-800 px-2.5 py-1 rounded-full border border-yellow-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>Adequado
                </span>
                <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>Bom
                </span>
                <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Excelente
                </span>
              </div>
            </div>

            {/* Grid de Lições Detalhadas */}
            <div className="space-y-3">
              <h4 className="font-black text-xs uppercase text-slate-400 tracking-wider">
                Detalhamento Lição a Lição:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: maxLActive }).map((_, lIdx) => {
                  const l = studentNotas[lIdx] || {};
                  const crits = [
                    { id: 'po', label: 'Prod. Oral' },
                    { id: 'co', label: 'Comp. Oral' },
                    { id: 'pe', label: 'Prod. Escrita' },
                    { id: 'ce', label: 'Comp. Escrita' }
                  ];

                  const hasAny = crits.some(c => Number(l[c.id]) > 0);

                  return (
                    <div key={lIdx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                        <span className="font-black text-xs uppercase text-[#0b2545]">Lesson {lIdx + 1}</span>
                        <span className={`text-xxs font-black uppercase ${hasAny ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {hasAny ? 'Avaliada' : 'Pendente'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xxs font-bold">
                        {crits.map((c) => {
                          const val = Number(l[c.id]) || 0;
                          const bgCol = val === 1 ? 'bg-red-500' : val === 2 ? 'bg-orange-500' : val === 3 ? 'bg-yellow-400' : val === 4 ? 'bg-blue-500' : val === 5 ? 'bg-emerald-500' : 'bg-slate-200 border border-slate-300';
                          return (
                            <div key={c.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                              <span className="text-slate-600 uppercase font-black">{c.label}</span>
                              <span 
                                className={`w-4 h-4 rounded-full inline-block shadow-xs ${bgCol}`} 
                                title={val === 1 ? 'Em Desenvolvimento' : val === 2 ? 'Básico' : val === 3 ? 'Adequado' : val === 4 ? 'Bom' : val === 5 ? 'Excelente' : 'Pendente'}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Observações Pedagógicas */}
                      {['A', 'B', 'C', 'D'].some(sub => !!l[`obs${sub}`]) && (
                        <div className="bg-slate-50 p-2 rounded text-xxs font-medium text-slate-600 space-y-1">
                          <span className="font-black text-xxs uppercase text-[#0b2545] block">Observações do Docente:</span>
                          {['A', 'B', 'C', 'D'].map(sub => l[`obs${sub}`] ? (
                            <p key={sub}><strong>Sub {sub}:</strong> {l[`obs${sub}`]}</p>
                          ) : null)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center border-t border-slate-100 pt-4">
              <span className="text-xxs font-bold text-slate-400 uppercase">
                Auditoria Oficial Opera Idiomas
              </span>

              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="bg-[#0b2545] hover:bg-black text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase shadow transition cursor-pointer"
              >
                Fechar Detalhamento
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
