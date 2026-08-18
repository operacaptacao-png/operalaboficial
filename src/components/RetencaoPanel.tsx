/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { UserSession, ReposicaoItem } from '../types';
import { PERF_MASTER_DB, HORARIOS_ATIVOS } from '../data/database';
import { 
  fetchReposicoes, 
  checkSafireFaltas, 
  agendarReposicao, 
  updateReposicaoStatus, 
  normalizeString 
} from '../services/api';
import { 
  AlertTriangle, 
  Radio, 
  Search, 
  CalendarCheck, 
  Clock, 
  Copy, 
  CheckCircle, 
  RefreshCw, 
  Filter, 
  X, 
  Check, 
  Zap, 
  ListOrdered
} from 'lucide-react';

interface RetencaoPanelProps {
  session: UserSession;
}

export default function RetencaoPanel({ session }: RetencaoPanelProps) {
  const [visao, setVisao] = useState<'pesquisa' | 'gestao'>('pesquisa');

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{ aluno: string; turma: string; prof: string; faltas: string[] }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Radar 2+ faltas state
  const [radarResults, setRadarResults] = useState<{ aluno: string; turma: string; prof: string; faltas: string[] }[]>([]);
  const [radarLoading, setRadarLoading] = useState(false);
  const [radarProgress, setRadarProgress] = useState('');

  // Reposições Gestão state
  const [reposicoes, setReposicoes] = useState<ReposicaoItem[]>([]);
  const [gestaoFilter, setGestaoFilter] = useState<string>('Pendente');
  const [gestaoSearch, setGestaoSearch] = useState('');
  const [gestaoLoading, setGestaoLoading] = useState(false);

  // Modal Agendamento state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'form' | 'copy'>('form');
  const [selectedStudentInfo, setSelectedStudentInfo] = useState<{ aluno: string; turma: string; prof: string; stringLicoes: string } | null>(null);

  const [tipoAula, setTipoAula] = useState<'Reposição' | 'Monitoria'>('Reposição');
  const [licaoDesejada, setLicaoDesejada] = useState('');
  const [profSub, setProfSub] = useState('');
  const [modalidade, setModalidade] = useState<'Online' | 'Presencial'>('Online');
  const [dataDesejada, setDataDesejada] = useState('');
  const [horaDesejada, setHoraDesejada] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [savingAgendamento, setSavingAgendamento] = useState(false);
  const [textoWpp, setTextoWpp] = useState('');
  const [copied, setCopied] = useState(false);

  const loadReposicoes = async () => {
    setGestaoLoading(true);
    const data = await fetchReposicoes();
    setReposicoes(data.reverse());
    setGestaoLoading(false);
  };

  useEffect(() => {
    loadReposicoes();
  }, []);

  // Time conversion helper
  const timeToMins = (t: string) => {
    const p = t.split(':');
    return parseInt(p[0]) * 60 + parseInt(p[1]);
  };

  // Atualizar horários disponíveis
  useEffect(() => {
    if (!dataDesejada || !profSub) {
      setAvailableSlots([]);
      setHoraDesejada('');
      return;
    }

    const dateObj = new Date(dataDesejada + 'T00:00:00');
    const diaSemana = dateObj.getDay();
    const duracaoMinutos = tipoAula === 'Monitoria' ? 30 : 60;
    const dataFormatadaBr = dataDesejada.split('-').reverse().join('/');

    let faixas: { s: string; e: string; mod?: string }[] = [];
    if (profSub === 'PABLO' || profSub === 'JOELMA') {
      faixas = [{ s: '08:00', e: '20:00' }];
    } else if (HORARIOS_ATIVOS[profSub] && HORARIOS_ATIVOS[profSub][diaSemana]) {
      faixas = HORARIOS_ATIVOS[profSub][diaSemana];
    } else {
      setAvailableSlots([]);
      setHoraDesejada('');
      return;
    }

    const slotsGerados: string[] = [];
    faixas.forEach((faixa) => {
      if (faixa.mod && faixa.mod !== modalidade) return;
      const minStart = timeToMins(faixa.s);
      const minEnd = timeToMins(faixa.e);
      for (let m = minStart; m <= minEnd - duracaoMinutos; m += duracaoMinutos) {
        const h = Math.floor(m / 60).toString().padStart(2, '0');
        const mm = (m % 60).toString().padStart(2, '0');
        slotsGerados.push(`${h}:${mm}`);
      }
    });

    const validSlots = slotsGerados.filter((slot) => {
      const slotStart = timeToMins(slot);
      const slotEnd = slotStart + duracaoMinutos;

      let isOccupied = false;
      reposicoes.forEach((rep) => {
        if (rep.status === 'Cancelado') return;
        if (rep.profSub === profSub && rep.data === dataFormatadaBr) {
          const repStart = timeToMins(rep.hora);
          const isMon = rep.licao.includes('Monitoria');
          const repEnd = repStart + (isMon ? 30 : 60);

          if (slotStart < repEnd && slotEnd > repStart) {
            isOccupied = true;
          }
        }
      });
      return !isOccupied;
    });

    setAvailableSlots(validSlots);
    if (validSlots.length > 0) {
      setHoraDesejada(validSlots[0]);
    } else {
      setHoraDesejada('');
    }
  }, [dataDesejada, profSub, tipoAula, modalidade, reposicoes]);

  // Pesquisa individual Safire
  const handleBuscarAluno = async () => {
    if (!searchTerm.trim()) return;
    setSearchLoading(true);
    setSearchResults([]);
    setSearched(true);

    const term = normalizeString(searchTerm);
    const matches: { aluno: string; turma: string; prof: string }[] = [];

    for (const prof in PERF_MASTER_DB) {
      for (const turma in PERF_MASTER_DB[prof]) {
        for (const aluno of PERF_MASTER_DB[prof][turma]) {
          if (normalizeString(aluno).includes(term)) {
            matches.push({ aluno, turma, prof });
          }
        }
      }
    }

    const results = await Promise.all(
      matches.map(async (m) => {
        const check = await checkSafireFaltas(m.aluno);
        return {
          ...m,
          faltas: !check.error && check.quaisFaltou ? check.quaisFaltou : []
        };
      })
    );

    setSearchResults(results);
    setSearchLoading(false);
  };

  // Radar batch scan para alunos com 2+ faltas
  const handleStartRadar = async () => {
    setRadarLoading(true);
    setRadarResults([]);
    setRadarProgress('Iniciando varredura rápida de retenção...');

    const allStudents: { aluno: string; turma: string; prof: string }[] = [];
    for (const prof in PERF_MASTER_DB) {
      for (const turma in PERF_MASTER_DB[prof]) {
        for (const aluno of PERF_MASTER_DB[prof][turma]) {
          allStudents.push({ aluno, turma, prof });
        }
      }
    }

    const batchSize = 6;
    const found: { aluno: string; turma: string; prof: string; faltas: string[] }[] = [];

    for (let i = 0; i < allStudents.length; i += batchSize) {
      const batch = allStudents.slice(i, i + batchSize);
      const res = await Promise.all(
        batch.map(async (st) => {
          const check = await checkSafireFaltas(st.aluno);
          return {
            ...st,
            faltas: !check.error && check.quaisFaltou ? check.quaisFaltou : []
          };
        })
      );

      res.forEach((r) => {
        if (r.faltas.length >= 2) {
          found.push(r);
        }
      });
      setRadarResults([...found]);
      setRadarProgress(`Analisando presenças (${Math.min(i + batchSize, allStudents.length)} de ${allStudents.length} alunos)...`);
    }

    setRadarLoading(false);
    setRadarProgress(`Varredura concluída! ${found.length} aluno(s) identificado(s) com 2 ou mais faltas.`);
  };

  // Open modal
  const handleOpenAgendamento = (aluno: string, turma: string, prof: string, faltas: string[]) => {
    setSelectedStudentInfo({ aluno, turma, prof, stringLicoes: faltas.join(', ') });
    setTipoAula('Reposição');
    setLicaoDesejada(faltas[0] || 'Lesson 1A');
    setProfSub('EDIMO');
    setModalidade('Online');
    setDataDesejada('');
    setHoraDesejada('');
    setModalStep('form');
    setModalOpen(true);
  };

  const handleSalvarAgendamento = async () => {
    if (!selectedStudentInfo || !dataDesejada || !horaDesejada || !licaoDesejada || !profSub) {
      alert('Por favor, preencha todos os campos e selecione um horário válido.');
      return;
    }

    setSavingAgendamento(true);
    const success = await agendarReposicao({
      tipo: tipoAula,
      aluno: selectedStudentInfo.aluno,
      turma: selectedStudentInfo.turma,
      profOriginal: selectedStudentInfo.prof,
      profSub,
      licao: licaoDesejada,
      modalidade,
      dataRep: dataDesejada,
      horaRep: horaDesejada,
      staff: session.nomeDisplay || 'Staff'
    });
    setSavingAgendamento(false);

    const partesData = dataDesejada.split('-');
    const dataBr = `${partesData[2]}/${partesData[1]}/${partesData[0]}`;
    const texto = `📌 *AGENDAMENTO CONFIRMADO - OPERALAB*\n\n👤 *Aluno:* ${selectedStudentInfo.aluno}\n⚙️ *Tipo:* ${tipoAula}\n📚 *Lição a Repor:* ${licaoDesejada}\n📅 *Data:* ${dataBr}\n⏰ *Horário:* ${horaDesejada}\n🧑‍🏫 *Prof. Substituto:* ${profSub}\n💻 *Modalidade:* ${modalidade}\n\n*Atenção:* Em caso de dúvidas, fale conosco!`;

    setTextoWpp(texto);
    setModalStep('copy');
    loadReposicoes();
  };

  const handleCopyWpp = () => {
    navigator.clipboard.writeText(textoWpp).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleCancelarReposicao = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    await updateReposicaoStatus(id, 'Cancelado', session.nomeDisplay || 'Staff');
    loadReposicoes();
  };

  const filteredReposicoes = reposicoes.filter((r) => {
    const matchStatus = gestaoFilter === 'Todos' || r.status === gestaoFilter;
    const matchSearch = !gestaoSearch || normalizeString(r.aluno).includes(normalizeString(gestaoSearch));
    return matchStatus && matchSearch;
  });

  return (
    <div className="page-content max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-slate-200 pb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#e2001a] flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-[#e2001a]" />
            <span>Painel de Retenção</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            Monitoramento de Faltas, Recuperação de Alunos e Agendamentos
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-200 p-1 rounded-xl border border-slate-300">
          <button
            onClick={() => setVisao('pesquisa')}
            className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase transition flex items-center gap-2 cursor-pointer ${
              visao === 'pesquisa' ? 'bg-[#0b2545] text-[#eebd1a] shadow' : 'text-slate-600 hover:text-black'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Pesquisa por Nome</span>
          </button>
          <button
            onClick={() => { setVisao('gestao'); loadReposicoes(); }}
            className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase transition flex items-center gap-2 cursor-pointer ${
              visao === 'gestao' ? 'bg-[#0b2545] text-[#eebd1a] shadow' : 'text-slate-600 hover:text-black'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Reposições Agendadas</span>
          </button>
        </div>
      </div>

      {/* VISÃO 1: PESQUISA POR NOME */}
      {visao === 'pesquisa' && (
        <div className="space-y-6">
          {/* Caixa de Pesquisa Individual */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <Search className="w-5 h-5 text-[#0b2545]" />
              <div>
                <h3 className="font-black text-sm text-[#0b2545] uppercase tracking-wider">
                  Pesquisa de Aluno no Safire
                </h3>
                <p className="text-xxs text-slate-400 font-bold uppercase">
                  Consulte a frequência e lições pendentes de reposição por nome do aluno
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBuscarAluno()}
                placeholder="Digite o nome completo ou parte do nome do aluno..."
                className="flex-1 p-4 border-2 border-slate-200 rounded-xl font-bold uppercase text-xs text-[#0b2545] outline-none focus:border-[#0b2545]"
              />
              <button
                onClick={handleBuscarAluno}
                disabled={searchLoading || !searchTerm.trim()}
                className="bg-[#0b2545] hover:bg-black text-[#eebd1a] px-8 py-3.5 rounded-xl font-black text-xs uppercase shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {searchLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{searchLoading ? 'Consultando...' : 'Pesquisar Aluno'}</span>
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 ? (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xxs font-black uppercase text-slate-400 tracking-wider">
                  Alunos Encontrados ({searchResults.length}):
                </h4>
                {searchResults.map((r, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-[#0b2545] transition"
                  >
                    <div>
                      <h4 className="font-black text-sm text-[#0b2545] uppercase">{r.aluno}</h4>
                      <p className="text-xxs font-bold text-slate-500 uppercase mt-0.5">
                        Turma: <strong className="text-[#0b2545]">{r.turma}</strong> • Professor: <strong>{r.prof}</strong>
                      </p>
                      {r.faltas.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-xxs font-black text-red-600 uppercase bg-red-100 border border-red-200 px-2.5 py-1 rounded-md">
                            ⚠️ {r.faltas.length} falta(s) registrada(s): {r.faltas.join(', ')}
                          </span>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <span className="text-xxs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-md inline-block">
                            ✅ Nenhuma falta pendente no Safire
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenAgendamento(r.aluno, r.turma, r.prof, r.faltas)}
                      className="bg-[#0b2545] hover:bg-[#123969] text-[#eebd1a] px-5 py-3 rounded-xl font-black text-xs uppercase shadow transition flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
                    >
                      <CalendarCheck className="w-4 h-4" />
                      <span>Agendar Reposição / Monitoria</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : searched && !searchLoading && (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-400 space-y-1">
                <p className="text-xs font-bold uppercase">Nenhum aluno encontrado para "{searchTerm}".</p>
                <p className="text-xxs font-medium">Verifique a grafia do nome ou tente pesquisar apenas pelo primeiro nome.</p>
              </div>
            )}
          </div>

          {/* Radar Rápido de Retenção (2+ Faltas) */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
            <Radio className="w-12 h-12 text-[#e2001a] mx-auto animate-pulse" />
            <div>
              <h3 className="font-black text-base uppercase text-[#0b2545]">Radar de Retenção (2+ Faltas)</h3>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">
                Varredura automática para identificar alunos com 2 ou mais faltas registradas no Safire
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={handleStartRadar}
                disabled={radarLoading}
                className="bg-[#e2001a] hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {radarLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>{radarLoading ? 'Realizando Varredura...' : 'Iniciar Radar (2+ Faltas)'}</span>
              </button>
            </div>

            {radarProgress && (
              <p className="text-xs font-mono font-bold text-[#0b2545] pt-2">
                {radarProgress}
              </p>
            )}
          </div>

          {/* Radar Results List */}
          {radarResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest">
                Alunos com 2+ Faltas Identificados ({radarResults.length})
              </h3>
              <div className="grid gap-3">
                {radarResults.map((r, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-2xl border-l-4 border-red-500 border-t border-r border-b border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-[#0b2545] transition"
                  >
                    <div>
                      <h4 className="font-black text-sm text-[#0b2545] uppercase">{r.aluno}</h4>
                      <p className="text-xxs font-bold text-slate-400 uppercase mt-0.5">
                        Turma: <strong className="text-[#0b2545]">{r.turma}</strong> • Professor: <strong>{r.prof}</strong>
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {r.faltas.map((f, fIdx) => (
                          <span key={fIdx} className="bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded text-xxs font-black uppercase">
                            Falta: {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenAgendamento(r.aluno, r.turma, r.prof, r.faltas)}
                      className="bg-[#0b2545] hover:bg-black text-[#eebd1a] px-6 py-3 rounded-xl font-black text-xs uppercase shadow transition flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
                    >
                      <CalendarCheck className="w-4 h-4" />
                      <span>Agendar Reposição</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VISÃO 2: GESTÃO DE REPOSIÇÕES COM FILTROS */}
      {visao === 'gestao' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-black text-lg text-[#0b2545] uppercase">Gestão de Agendamentos</h3>
              <p className="text-xxs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Acompanhe o status e cancele sessões se necessário
              </p>
            </div>
            <button
              onClick={loadReposicoes}
              disabled={gestaoLoading}
              className="bg-[#0b2545] text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase hover:bg-black transition flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${gestaoLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>

          {/* Search in Appointments */}
          <input
            type="text"
            value={gestaoSearch}
            onChange={(e) => setGestaoSearch(e.target.value)}
            placeholder="🔍 Filtrar agendamentos por nome do aluno..."
            className="w-full p-4 border-2 border-slate-200 rounded-xl font-bold uppercase text-xs text-[#0b2545] outline-none focus:border-[#0b2545]"
          />

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {['Todos', 'Pendente', 'Realizado', 'Faltou', 'Cancelado'].map((st) => (
              <button
                key={st}
                onClick={() => setGestaoFilter(st)}
                className={`px-5 py-2 rounded-xl text-xxs font-black uppercase transition ${
                  gestaoFilter === st
                    ? 'bg-[#0b2545] text-[#eebd1a] shadow-md scale-105'
                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st === 'Pendente' ? 'Agendados' : st === 'Realizado' ? 'Veio' : st === 'Faltou' ? 'Não Veio' : st}
              </button>
            ))}
          </div>

          {/* Reposições List */}
          {gestaoLoading ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-[#0b2545]" />
              <p className="text-xs font-bold uppercase">Carregando da nuvem...</p>
            </div>
          ) : filteredReposicoes.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
              <p className="text-xs font-bold uppercase">Nenhum agendamento encontrado.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredReposicoes.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-[#0b2545] transition space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-sm text-[#0b2545] uppercase">{rep.aluno}</h4>
                      <p className="text-xxs font-bold text-slate-400 uppercase">Turma: {rep.turma}</p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xxs font-black uppercase ${
                      rep.status === 'Pendente' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      rep.status === 'Realizado' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      rep.status === 'Faltou' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                      'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                      {rep.status === 'Realizado' ? 'Veio' : rep.status === 'Faltou' ? 'Não Veio' : rep.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xxs">
                    <div>
                      <span className="text-slate-400 font-bold uppercase block">Lição</span>
                      <strong className="text-[#e2001a]">{rep.licao}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase block">Data & Hora</span>
                      <strong className="text-slate-700">{rep.data} às {rep.hora}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase block">Prof. Sub</span>
                      <strong className="text-[#0b2545]">{rep.profSub}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase block">Modalidade</span>
                      <strong className="text-slate-700">{rep.modalidade}</strong>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xxs text-slate-400 font-bold pt-1">
                    <span>Criado por: {rep.staff || 'Staff'}</span>
                    {rep.status === 'Pendente' && (
                      <button
                        onClick={() => handleCancelarReposicao(rep.id)}
                        className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg text-xxs font-black uppercase transition cursor-pointer"
                      >
                        Cancelar Agendamento
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL DE AGENDAMENTO */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[#0b2545]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border-4 border-[#eebd1a] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-[#0b2545] uppercase">
                {modalStep === 'form' ? 'Agendar Sessão' : 'Mensagem Pronta'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalStep === 'form' ? (
              <div className="space-y-4 text-xs font-bold text-[#0b2545]">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <p className="text-xxs uppercase text-slate-400 font-bold">Aluno / Turma</p>
                  <p className="font-black text-sm">{selectedStudentInfo?.aluno} - {selectedStudentInfo?.turma}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xxs uppercase text-slate-500 block mb-1">Tipo de Aula</label>
                    <select
                      value={tipoAula}
                      onChange={(e) => setTipoAula(e.target.value as 'Reposição' | 'Monitoria')}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer"
                    >
                      <option value="Reposição">Reposição (1h)</option>
                      <option value="Monitoria">Monitoria (30m)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xxs uppercase text-slate-500 block mb-1">Lição</label>
                    <input
                      type="text"
                      value={licaoDesejada}
                      onChange={(e) => setLicaoDesejada(e.target.value)}
                      placeholder="Ex: Lesson 3B"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xxs uppercase text-slate-500 block mb-1">Prof. Substituto</label>
                    <select
                      value={profSub}
                      onChange={(e) => setProfSub(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer"
                    >
                      <option value="EDIMO">Edimo</option>
                      <option value="IANNE">Ianne</option>
                      <option value="JOÃO">João</option>
                      <option value="MAISA">Maisa</option>
                      <option value="PABLO">Pablo</option>
                      <option value="JOELMA">Joelma</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xxs uppercase text-slate-500 block mb-1">Modalidade</label>
                    <select
                      value={modalidade}
                      onChange={(e) => setModalidade(e.target.value as 'Online' | 'Presencial')}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer"
                    >
                      <option value="Online">Online</option>
                      <option value="Presencial">Presencial</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xxs uppercase text-slate-500 block mb-1">Data</label>
                    <input
                      type="date"
                      value={dataDesejada}
                      onChange={(e) => setDataDesejada(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xxs uppercase text-slate-500 block mb-1">Horário Disponível</label>
                    <select
                      value={horaDesejada}
                      onChange={(e) => setHoraDesejada(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer"
                    >
                      {availableSlots.length > 0 ? (
                        availableSlots.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))
                      ) : (
                        <option value="">Nenhum horário livre</option>
                      )}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSalvarAgendamento}
                  disabled={savingAgendamento || !horaDesejada}
                  className="w-full bg-[#0b2545] hover:bg-black text-[#eebd1a] font-black py-4 rounded-xl text-xs uppercase shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  {savingAgendamento ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CalendarCheck className="w-4 h-4" />}
                  <span>{savingAgendamento ? 'Gravando Agendamento...' : 'Salvar e Gerar Mensagem'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 font-bold uppercase">
                  Agendamento salvo na nuvem! Copie o texto formatado abaixo para enviar via WhatsApp:
                </p>
                <textarea
                  value={textoWpp}
                  onChange={(e) => setTextoWpp(e.target.value)}
                  rows={8}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-mono text-xs text-[#0b2545] outline-none"
                />

                <button
                  onClick={handleCopyWpp}
                  className={`w-full font-black py-4 rounded-xl text-xs uppercase shadow-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                    copied ? 'bg-emerald-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Mensagem Copiada com Sucesso!' : 'Copiar Mensagem para WhatsApp'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
