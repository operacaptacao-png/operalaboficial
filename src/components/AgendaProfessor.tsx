/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { UserSession, ReposicaoItem } from '../types';
import { fetchReposicoes, updateReposicaoStatus } from '../services/api';
import { 
  CalendarCheck, 
  Clock, 
  CheckCircle, 
  UserX, 
  RefreshCw, 
  Coffee, 
  AlertCircle,
  MapPin,
  Calendar as CalendarIcon,
  BookOpen,
  Check
} from 'lucide-react';

interface AgendaProfessorProps {
  session: UserSession;
}

export default function AgendaProfessor({ session }: AgendaProfessorProps) {
  const [reposicoes, setReposicoes] = useState<ReposicaoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadAgenda = async () => {
    setLoading(true);
    setFeedbackMessage(null);
    try {
      const data = await fetchReposicoes();
      setReposicoes(data);
    } catch {
      setFeedbackMessage({ type: 'error', text: 'Falha ao sincronizar agenda com a nuvem.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgenda();
  }, [session.userLogado]);

  // Filtra apenas para o professor autenticado e que não estejam canceladas
  const agendaDoProfessor = reposicoes.filter((rep) => {
    return (
      rep.profSub.trim().toUpperCase() === session.userLogado.trim().toUpperCase() &&
      rep.status !== 'Cancelado'
    );
  });

  const handleUpdatePresenca = async (id: string, novoStatus: 'Realizado' | 'Faltou', nomeAluno: string) => {
    const acao = novoStatus === 'Realizado' ? 'VEIO' : 'NÃO VEIO';
    if (!window.confirm(`Deseja confirmar que o aluno ${nomeAluno} ${acao} para a reposição/monitoria?`)) {
      return;
    }

    setActionLoadingId(id);

    // Atualização otimista
    setReposicoes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: novoStatus } : r))
    );

    const success = await updateReposicaoStatus(id, novoStatus, `${session.userLogado} (Prof)`);
    setActionLoadingId(null);

    if (success) {
      setFeedbackMessage({
        type: 'success',
        text: `Presença de ${nomeAluno} atualizada com sucesso para "${novoStatus === 'Realizado' ? 'Veio' : 'Não Veio'}".`
      });
    } else {
      setFeedbackMessage({
        type: 'error',
        text: 'Não foi possível salvar na nuvem agora. O status local foi atualizado.'
      });
    }

    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const pendentesCount = agendaDoProfessor.filter(r => r.status === 'Pendente').length;
  const realizadosCount = agendaDoProfessor.filter(r => r.status === 'Realizado').length;

  return (
    <div className="page-content max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-slate-200 pb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#0b2545] flex items-center gap-3">
            <CalendarCheck className="w-8 h-8 text-[#eebd1a]" />
            <span>Minha Agenda</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            Reposições e Monitorias • Professor {session.nomeDisplay}
          </p>
        </div>

        <button
          onClick={loadAgenda}
          disabled={loading}
          className="bg-[#0b2545] text-[#eebd1a] hover:bg-[#123969] px-6 py-3 rounded-xl font-black text-xs uppercase shadow-md hover:scale-105 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar Agenda</span>
        </button>
      </div>

      {/* Info Notice */}
      <div className="bg-blue-50 border-l-4 border-[#0b2545] p-4 rounded-r-xl shadow-sm text-xs font-bold text-[#0b2545] flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#eebd1a] flex-shrink-0 mt-0.5" />
        <p className="uppercase leading-relaxed">
          Lembrete: Mantenha a aba de desempenho sempre atualizada com as avaliações dos alunos e confirme a presença nas reposições clicando em <strong>"O Aluno Veio"</strong> ou <strong>"O Aluno Faltou"</strong> após a aula.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Total Agendado</span>
          <span className="text-2xl font-black text-[#0b2545]">{agendaDoProfessor.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Aulas Pendentes</span>
          <span className="text-2xl font-black text-amber-500">{pendentesCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center col-span-2 md:col-span-1">
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Realizadas / Veio</span>
          <span className="text-2xl font-black text-emerald-600">{realizadosCount}</span>
        </div>
      </div>

      {feedbackMessage && (
        <div className={`p-4 rounded-xl text-xs font-bold uppercase transition ${
          feedbackMessage.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {feedbackMessage.text}
        </div>
      )}

      {/* Content List */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-10 h-10 text-slate-300 animate-spin mx-auto mb-3" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Sincronizando agendamentos com a nuvem...
          </p>
        </div>
      ) : agendaDoProfessor.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Coffee className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="font-black text-slate-500 uppercase tracking-widest text-base">
            Sua agenda está livre!
          </h3>
          <p className="text-xs font-bold text-slate-400 mt-2">
            Nenhum agendamento pendente para você no momento.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {agendaDoProfessor.map((rep) => {
            const isPendente = rep.status === 'Pendente';
            const isRealizado = rep.status === 'Realizado';
            const isFaltou = rep.status === 'Faltou';

            return (
              <div
                key={rep.id}
                className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-[#0b2545] hover:shadow-md transition"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-black text-lg text-[#0b2545] uppercase tracking-tight">
                      {rep.aluno}
                    </h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Turma: <span className="text-[#0b2545]">{rep.turma}</span>
                    </p>
                  </div>

                  <div>
                    {isPendente && (
                      <span className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded-full text-xxs font-black uppercase inline-flex items-center gap-1 shadow-sm">
                        <Clock className="w-3 h-3" /> Pendente
                      </span>
                    )}
                    {isRealizado && (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-xxs font-black uppercase inline-flex items-center gap-1 shadow-sm">
                        <CheckCircle className="w-3 h-3" /> Veio
                      </span>
                    )}
                    {isFaltou && (
                      <span className="bg-orange-100 text-orange-800 border border-orange-300 px-3 py-1 rounded-full text-xxs font-black uppercase inline-flex items-center gap-1 shadow-sm">
                        <UserX className="w-3 h-3" /> Não Veio
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-3">
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-xxs text-slate-400 font-bold uppercase mb-1">Lição a Repor</p>
                    <span className="text-xs font-black text-[#e2001a] bg-red-50 py-1 px-2.5 rounded-md inline-block border border-red-200">
                      {rep.licao}
                    </span>
                  </div>

                  <div>
                    <p className="text-xxs text-slate-400 font-bold uppercase mb-1">Data</p>
                    <p className="text-xs font-black text-slate-700 flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                      {rep.data.includes('-') ? rep.data.split('-').reverse().join('/') : rep.data}
                    </p>
                  </div>

                  <div>
                    <p className="text-xxs text-slate-400 font-bold uppercase mb-1">Horário</p>
                    <p className="text-xs font-black text-[#0b2545] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#eebd1a]" />
                      {rep.hora}
                    </p>
                  </div>

                  <div>
                    <p className="text-xxs text-slate-400 font-bold uppercase mb-1">Modalidade</p>
                    <p className="text-xs font-black text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {rep.modalidade}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-between items-center text-xxs text-slate-400 font-bold gap-2">
                  <span className="italic">Registrado em: {rep.historico || 'Nuvem'}</span>
                  <span className="bg-blue-50 text-[#0b2545] border border-blue-200 px-2 py-0.5 rounded">
                    Staff: <strong className="text-red-600">{rep.staff || 'N/A'}</strong>
                  </span>
                </div>

                {/* Actions */}
                {isPendente && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleUpdatePresenca(rep.id, 'Realizado', rep.aluno)}
                      disabled={actionLoadingId === rep.id}
                      className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-600 hover:text-white py-3 rounded-xl font-black text-xs uppercase transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>O Aluno Veio</span>
                    </button>
                    <button
                      onClick={() => handleUpdatePresenca(rep.id, 'Faltou', rep.aluno)}
                      disabled={actionLoadingId === rep.id}
                      className="flex-1 bg-orange-50 text-orange-700 border border-orange-300 hover:bg-orange-600 hover:text-white py-3 rounded-xl font-black text-xs uppercase transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <UserX className="w-4 h-4" />
                      <span>O Aluno Faltou</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
