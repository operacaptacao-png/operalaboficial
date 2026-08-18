/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { UserSession, StudentPerformanceData } from '../types';
import { checkSafireFaltas } from '../services/api';
import { eventsDB } from '../data/database';
import { 
  CheckCircle2, 
  AlertCircle, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Sparkles, 
  Headphones, 
  HelpCircle, 
  MessageSquare,
  RefreshCw,
  AlertTriangle,
  ClipboardCheck,
  BarChart3,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface DashboardAlunoProps {
  session: UserSession;
  perfData: StudentPerformanceData;
  onNavigate: (tab: string) => void;
  onAbsenceStatusChange?: (hasAbsences: boolean) => void;
}

export default function DashboardAluno({
  session,
  perfData,
  onNavigate,
  onAbsenceStatusChange
}: DashboardAlunoProps) {
  const isStaff = session.tipoLoginAtual === 'staff';
  const isProf = session.tipoLoginAtual === 'prof';
  const [safireLoading, setSafireLoading] = useState(!isStaff && !isProf);
  const [safireFaltas, setSafireFaltas] = useState<string[]>([]);
  const [safireError, setSafireError] = useState(false);

  // Calcula a pizza de notas (PO, CO, PE, CE)
  const calculatePieGradient = () => {
    const alunoNotas = perfData[session.userLogado] || [];
    const isEspanhol = session.turmaDisplay.toUpperCase().startsWith('ESP');
    const maxLessons = isEspanhol ? 5 : 8;

    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let validos = 0;

    for (let i = 0; i < maxLessons; i++) {
      const lesson = alunoNotas[i];
      if (lesson) {
        ['po', 'co', 'pe', 'ce'].forEach((crit) => {
          const val = Number(lesson[crit]);
          if (val >= 1 && val <= 5) {
            counts[val]++;
            validos++;
          }
        });
      }
    }

    if (validos === 0) {
      return 'conic-gradient(#cbd5e1 0% 100%)';
    }

    const p1 = (counts[1] / validos) * 100;
    const p2 = (counts[2] / validos) * 100;
    const p3 = (counts[3] / validos) * 100;
    const p4 = (counts[4] / validos) * 100;

    return `conic-gradient(#ef4444 0% ${p1}%, #f97316 ${p1}% ${p1 + p2}%, #eab308 ${p1 + p2}% ${p1 + p2 + p3}%, #3b82f6 ${p1 + p2 + p3}% ${p1 + p2 + p3 + p4}%, #22c55e ${p1 + p2 + p3 + p4}% 100%)`;
  };

  const loadSafire = async () => {
    if (isStaff || isProf) return;
    setSafireLoading(true);
    setSafireError(false);
    try {
      const res = await checkSafireFaltas(session.userLogado);
      if (!res.error && res.quaisFaltou) {
        setSafireFaltas(res.quaisFaltou);
        if (onAbsenceStatusChange) {
          onAbsenceStatusChange(res.quaisFaltou.length > 0);
        }
      } else {
        setSafireFaltas([]);
        if (onAbsenceStatusChange) {
          onAbsenceStatusChange(false);
        }
      }
    } catch {
      setSafireError(true);
    } finally {
      setSafireLoading(false);
    }
  };

  useEffect(() => {
    if (!isStaff && !isProf) {
      loadSafire();
    }
  }, [session.userLogado, isStaff, isProf]);

  // Próximos eventos
  const hoje = new Date();
  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

  const proximosEventos = eventsDB
    .filter((e) => (e.date || e.start || '') >= hojeStr)
    .sort((a, b) => (a.date || a.start || '').localeCompare(b.date || b.start || ''))
    .slice(0, 3);

  const pieGradient = calculatePieGradient();

  return (
    <div className="page-content max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0b2545] via-[#123969] to-[#0b2545] rounded-3xl p-6 md:p-8 text-white shadow-xl border-b-4 border-[#eebd1a] flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xxs font-black bg-[#eebd1a] text-[#0b2545] uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" /> {isStaff ? 'Portal da Equipe • Staff' : isProf ? 'Portal do Professor' : 'Portal do Aluno'}
          </span>
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white">
            Olá, {session.nomeDisplay}!
          </h2>
          <p className="text-xs md:text-sm font-semibold text-slate-300 mt-1">
            {isStaff ? (
              <>Cargo: <strong className="text-[#eebd1a] font-black">{session.turmaDisplay}</strong> • Bem-vindo(a) à Central Integrada Opera</>
            ) : isProf ? (
              <>Docente: <strong className="text-[#eebd1a] font-black">{session.userLogado}</strong> • Central de Aulas e Diário</>
            ) : (
              <>Turma: <strong className="text-[#eebd1a] font-black">{session.turmaDisplay}</strong> • Acompanhe seu progresso e agenda</>
            )}
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2">
          {isStaff ? (
            <>
              <button
                onClick={() => onNavigate('retencao')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase shadow-md transition flex items-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4 text-[#eebd1a]" />
                <span>Painel Retenção</span>
              </button>
              <button
                onClick={() => onNavigate('coordenacao')}
                className="bg-[#eebd1a] text-[#0b2545] hover:bg-yellow-400 px-4 py-2.5 rounded-xl font-black text-xs uppercase shadow-md transition flex items-center gap-1.5"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Coordenação</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => onNavigate('audios')}
              className="bg-[#eebd1a] text-[#0b2545] hover:bg-yellow-400 px-5 py-2.5 rounded-xl font-black text-xs uppercase shadow-md transition flex items-center gap-2"
            >
              <Headphones className="w-4 h-4" />
              <span>Praticar Áudios</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Colunas Principais */}
      {isStaff ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 Staff: Gestão de Retenção */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-xs md:text-sm uppercase tracking-wider text-[#0b2545] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>Gestão de Retenção</span>
                </h3>
                <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Ativo</span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Monitore alunos em risco de evasão, ausências consecutivas e alertas integrados com o Safire.
              </p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xxs font-bold text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Sincronização Safire:</span>
                  <span className="text-emerald-600 font-black">Conectado</span>
                </div>
                <div className="flex justify-between">
                  <span>Acompanhamento:</span>
                  <span className="text-[#0b2545] font-black">Tempo Real</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => onNavigate('retencao')}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-bold text-xs uppercase transition flex items-center justify-center gap-1.5"
              >
                <span>Acessar Painel de Retenção</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2 Staff: Coordenação & Desempenho */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-xs md:text-sm uppercase tracking-wider text-[#0b2545] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#eebd1a]" />
                  <span>Auditoria & Notas</span>
                </h3>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Auditoria</span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Audite diários de classe dos professores, acompanhe o preenchimento de notas e emita certificados oficiais.
              </p>
              <div className="grid grid-cols-2 gap-2 text-center text-xxs font-bold text-slate-700">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="block text-slate-400 font-medium">Relatórios</span>
                  <span className="text-xs font-black text-[#0b2545]">PDF A4</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="block text-slate-400 font-medium">Certificados</span>
                  <span className="text-xs font-black text-[#0b2545]">Oficiais</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => onNavigate('desempenho')}
                className="flex-1 bg-[#0b2545] hover:bg-black text-[#eebd1a] py-2.5 rounded-xl font-bold text-xs uppercase transition text-center"
              >
                Desempenho
              </button>
              <button
                onClick={() => onNavigate('coordenacao')}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-[#0b2545] py-2.5 rounded-xl font-bold text-xs uppercase transition text-center"
              >
                Coordenação
              </button>
            </div>
          </div>

          {/* Card 3 Staff: Próximos Eventos */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="font-black text-xs md:text-sm uppercase tracking-wider text-[#0b2545] flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#eebd1a]" />
                  <span>Próximos Eventos</span>
                </h3>
                <button 
                  onClick={() => onNavigate('calendario')}
                  className="text-xxs font-bold text-[#0b2545] hover:underline uppercase"
                >
                  Ver todos
                </button>
              </div>

              <div className="space-y-3">
                {proximosEventos.length > 0 ? (
                  proximosEventos.map((ev, idx) => {
                    const datePart = (ev.date || ev.start || '').split('-');
                    const formattedDate = datePart.length === 3 ? `${datePart[2]}/${datePart[1]}` : datePart.join('/');
                    
                    return (
                      <div 
                        key={idx} 
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 transition"
                      >
                        <div className="bg-[#0b2545] text-[#eebd1a] font-black text-xs px-2.5 py-1.5 rounded-lg flex-shrink-0">
                          {formattedDate}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-slate-800 uppercase leading-snug truncate">
                            {ev.title}
                          </p>
                          <span className={`text-xxs font-bold uppercase ${
                            ev.type === 'gold' ? 'text-amber-600' : ev.type === 'red' ? 'text-red-500' : 'text-blue-600'
                          }`}>
                            {ev.type === 'gold' ? 'Evento Opera' : ev.type === 'red' ? 'Recesso / Feriado' : 'Calendário Letivo'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6 font-bold uppercase">
                    Sem eventos futuros próximos.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => onNavigate('calendario')}
                className="w-full bg-slate-100 hover:bg-[#0b2545] hover:text-white text-[#0b2545] py-2.5 rounded-xl font-bold text-xs uppercase transition text-center"
              >
                Abrir Calendário Letivo 2026
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Pizza de Desempenho */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col items-center text-center justify-between">
            <div className="w-full">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="font-black text-xs md:text-sm uppercase tracking-wider text-[#0b2545] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#eebd1a]" />
                  <span>Seu Desempenho</span>
                </h3>
                <span className="text-xxs font-bold text-slate-400 uppercase">Habilidades</span>
              </div>

              <div className="my-4 flex justify-center">
                <div 
                  className="w-36 h-36 rounded-full border-4 border-[#0b2545] shadow-lg transition-all duration-700 relative"
                  style={{ background: pieGradient }}
                />
              </div>
            </div>

            <div className="w-full mt-2">
              <div className="grid grid-cols-2 gap-1.5 text-xxs font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 text-left">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span><span>Supera</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span><span>Atende</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#eab308]"></span><span>Em Desenv.</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span><span>Não Alcançado</span></div>
              </div>
              <p className="text-xxs text-slate-400 font-bold uppercase tracking-wider">
                Produção & Compreensão Oral e Escrita
              </p>
            </div>
          </div>

          {/* Card 2: Frequência & Assiduidade */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="font-black text-xs md:text-sm uppercase tracking-wider text-[#0b2545] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#eebd1a]" />
                  <span>Assiduidade & Faltas</span>
                </h3>
                <button 
                  onClick={loadSafire}
                  className="text-slate-400 hover:text-[#0b2545] transition p-1"
                  title="Recarregar status"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${safireLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {safireLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-[#0b2545]" />
                  <p className="text-xs font-bold uppercase tracking-wider">Consultando frequência...</p>
                </div>
              ) : safireError ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-center">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                  <p className="text-xs font-bold uppercase">Não foi possível verificar no momento.</p>
                </div>
              ) : safireFaltas.length > 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 space-y-2">
                  <div className="flex items-center gap-2 font-black text-sm uppercase text-red-600">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>Pendência de Faltas</span>
                  </div>
                  <p className="text-xs font-semibold leading-relaxed">
                    Você possui <strong>{safireFaltas.length} falta(s)</strong> registrada(s):
                  </p>
                  <div className="flex flex-wrap gap-1.5 my-2">
                    {safireFaltas.map((f, idx) => (
                      <span key={idx} className="bg-red-200 text-red-900 px-2 py-0.5 rounded text-xxs font-black uppercase">
                        {f}
                      </span>
                    ))}
                  </div>
                  <p className="text-xxs font-bold text-red-700 pt-1 border-t border-red-200">
                    ⚠️ Agende sua reposição com a coordenação pedagógica.
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center text-emerald-800">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                  <h4 className="font-black text-sm uppercase">Frequência 100% em dia!</h4>
                  <p className="text-xs font-medium text-emerald-600 mt-1">Parabéns pela dedicação e assiduidade nas aulas.</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xxs text-slate-400 font-bold uppercase">
              <span>Sincronizado via Safire</span>
              <button onClick={() => onNavigate('contato')} className="text-[#0b2545] hover:underline font-extrabold">
                Falar com coordenação →
              </button>
            </div>
          </div>

          {/* Card 3: Próximos Eventos */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="font-black text-xs md:text-sm uppercase tracking-wider text-[#0b2545] flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#eebd1a]" />
                  <span>Próximos Eventos</span>
                </h3>
                <button 
                  onClick={() => onNavigate('calendario')}
                  className="text-xxs font-bold text-[#0b2545] hover:underline uppercase"
                >
                  Ver todos
                </button>
              </div>

              <div className="space-y-3">
                {proximosEventos.length > 0 ? (
                  proximosEventos.map((ev, idx) => {
                    const datePart = (ev.date || ev.start || '').split('-');
                    const formattedDate = datePart.length === 3 ? `${datePart[2]}/${datePart[1]}` : datePart.join('/');
                    
                    return (
                      <div 
                        key={idx} 
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 transition"
                      >
                        <div className="bg-[#0b2545] text-[#eebd1a] font-black text-xs px-2.5 py-1.5 rounded-lg flex-shrink-0">
                          {formattedDate}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-slate-800 uppercase leading-snug truncate">
                            {ev.title}
                          </p>
                          <span className={`text-xxs font-bold uppercase ${
                            ev.type === 'gold' ? 'text-amber-600' : ev.type === 'red' ? 'text-red-500' : 'text-blue-600'
                          }`}>
                            {ev.type === 'gold' ? 'Evento Opera' : ev.type === 'red' ? 'Recesso / Feriado' : 'Calendário Letivo'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6 font-bold uppercase">
                    Sem eventos futuros próximos.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => onNavigate('calendario')}
                className="w-full bg-slate-100 hover:bg-[#0b2545] hover:text-white text-[#0b2545] py-2.5 rounded-xl font-bold text-xs uppercase transition text-center"
              >
                Abrir Calendário Letivo 2026
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Acesso Rápido / Recursos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isStaff ? (
          <>
            <button
              onClick={() => onNavigate('retencao')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-red-500 hover:shadow-md transition text-left group"
            >
              <AlertTriangle className="w-8 h-8 text-red-500 group-hover:scale-110 transition mb-2" />
              <h4 className="font-black text-xs uppercase text-[#0b2545]">Painel de Retenção</h4>
              <p className="text-xxs text-slate-400 font-bold mt-1">Alertas e monitoramento de alunos</p>
            </button>

            <button
              onClick={() => onNavigate('coordenacao')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-[#eebd1a] hover:shadow-md transition text-left group"
            >
              <ClipboardCheck className="w-8 h-8 text-[#0b2545] group-hover:text-[#eebd1a] group-hover:scale-110 transition mb-2" />
              <h4 className="font-black text-xs uppercase text-[#0b2545]">Coordenação Pedagógica</h4>
              <p className="text-xxs text-slate-400 font-bold mt-1">Status de turmas e auditoria docente</p>
            </button>

            <button
              onClick={() => onNavigate('desempenho')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition text-left group"
            >
              <BarChart3 className="w-8 h-8 text-[#0b2545] group-hover:text-blue-500 group-hover:scale-110 transition mb-2" />
              <h4 className="font-black text-xs uppercase text-[#0b2545]">Desempenho & Certificados</h4>
              <p className="text-xxs text-slate-400 font-bold mt-1">Emissão de relatórios e PDFs oficiais</p>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onNavigate('audios')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-[#e2001a] hover:shadow-md transition text-left group"
            >
              <Headphones className="w-8 h-8 text-[#0b2545] group-hover:text-[#e2001a] transition mb-2" />
              <h4 className="font-black text-xs uppercase text-[#0b2545]">Prática de Áudio</h4>
              <p className="text-xxs text-slate-400 font-bold mt-1">Target, Teens XP e Expert</p>
            </button>

            <button
              onClick={() => onNavigate('tutorial')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition text-left group"
            >
              <HelpCircle className="w-8 h-8 text-[#0b2545] group-hover:text-blue-500 transition mb-2" />
              <h4 className="font-black text-xs uppercase text-[#0b2545]">Tutoriais</h4>
              <p className="text-xxs text-slate-400 font-bold mt-1">Vídeos de apoio e PWA</p>
            </button>

            <button
              onClick={() => onNavigate('contato')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition text-left group"
            >
              <MessageSquare className="w-8 h-8 text-[#0b2545] group-hover:text-emerald-500 transition mb-2" />
              <h4 className="font-black text-xs uppercase text-[#0b2545]">Fale Conosco</h4>
              <p className="text-xxs text-slate-400 font-bold mt-1">Pedagógico Opera</p>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
