/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserSession, AudioItem } from '../types';
import { audioDB } from '../data/database';
import { 
  Headphones, 
  Lock, 
  ExternalLink, 
  Key, 
  Check, 
  BookOpen, 
  Gamepad2, 
  Globe, 
  Sparkles,
  X
} from 'lucide-react';

interface AudiosPortalProps {
  session: UserSession;
}

export default function AudiosPortal({ session }: AudiosPortalProps) {
  const isPrivileged = session.tipoLoginAtual === 'prof' || session.tipoLoginAtual === 'staff';
  const [activeCategory, setActiveCategory] = useState<'target' | 'teens' | 'expert' | 'espanhol'>('target');
  
  // Password modal
  const [modalItem, setModalItem] = useState<AudioItem | null>(null);
  const [enteredPass, setEnteredPass] = useState('');
  const [passError, setPassError] = useState(false);

  const handleOpenAudio = (item: AudioItem) => {
    // Se não tem senha ou é prof/staff, abre direto
    if (!item.pass || isPrivileged) {
      window.open(item.url, '_blank');
      return;
    }

    // Aluno precisa informar senha
    setModalItem(item);
    setEnteredPass('');
    setPassError(false);
  };

  const handleVerifyPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalItem) return;

    if (enteredPass.trim().toUpperCase() === modalItem.pass?.toUpperCase()) {
      window.open(modalItem.url, '_blank');
      setModalItem(null);
    } else {
      setPassError(true);
    }
  };

  const categoryTitles = {
    target: { title: 'Target Series', desc: 'Adults & Professional English' },
    teens: { title: 'Teens Experience (XP)', desc: 'Young Learners & Teens' },
    expert: { title: 'Expert Levels', desc: 'Advanced & Mastery Programs' },
    espanhol: { title: 'Español', desc: 'Gente Hoy & Hispanophone Practice' }
  };

  return (
    <div className="page-content max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-slate-200 pb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#0b2545] flex items-center gap-3">
            <Headphones className="w-8 h-8 text-[#eebd1a]" />
            <span>Portal de Áudios</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            Faixas de Áudio e Material de Prática Auditiva para o seu Curso
          </p>
        </div>

        {isPrivileged && (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-full text-xxs font-black uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Acesso VIP Desbloqueado
          </span>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {(['target', 'teens', 'expert', 'espanhol'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-3 rounded-2xl font-black text-xs uppercase transition shadow-sm cursor-pointer ${
              activeCategory === cat
                ? 'bg-[#0b2545] text-[#eebd1a] shadow-md scale-105'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {categoryTitles[cat].title}
          </button>
        ))}
      </div>

      {/* Category Banner */}
      <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
        <div>
          <h3 className="font-black text-sm uppercase text-[#0b2545]">
            {categoryTitles[activeCategory].title}
          </h3>
          <p className="text-xxs font-bold text-slate-400 uppercase">
            {categoryTitles[activeCategory].desc}
          </p>
        </div>
      </div>

      {/* Audio Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {audioDB[activeCategory]?.map((audio, idx) => (
          <div
            key={idx}
            onClick={() => handleOpenAudio(audio)}
            className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-[#0b2545] shadow-sm hover:shadow-lg transition cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#0b2545] group-hover:text-[#e2001a] group-hover:border-[#e2001a] transition">
                <i className={`fas ${audio.icon} text-xl`} />
              </div>
              {audio.pass && !isPrivileged && (
                <span className="bg-amber-100 text-amber-800 p-1.5 rounded-lg text-xxs font-black" title="Requer senha">
                  <Lock className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            <div>
              <h4 className="font-black text-base text-[#0b2545] uppercase group-hover:text-[#0b2545] transition">
                {audio.name}
              </h4>
              <p className="text-xxs font-bold text-slate-400 uppercase mt-0.5">
                Faixas de escuta e listening
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xxs font-black uppercase text-[#0b2545] group-hover:text-[#e2001a] transition">
              <span>Abrir Reprodutor</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Password Modal */}
      {modalItem && (
        <div className="fixed inset-0 bg-[#0b2545]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border-4 border-[#eebd1a] shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-[#0b2545] uppercase flex items-center gap-2">
                <Key className="w-5 h-5 text-[#eebd1a]" />
                <span>Acesso ao Áudio</span>
              </h3>
              <button onClick={() => setModalItem(null)} className="text-slate-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifyPass} className="space-y-4">
              <p className="text-xs font-semibold text-slate-600">
                Para acessar as faixas de <strong>{modalItem.name}</strong>, insira a senha fornecida pelo seu professor ou pela coordenação:
              </p>

              <div>
                <input
                  type="password"
                  value={enteredPass}
                  onChange={(e) => setEnteredPass(e.target.value)}
                  placeholder="Digite a senha aqui..."
                  autoFocus
                  className="w-full p-4 border-2 border-slate-200 rounded-xl font-bold uppercase text-center text-[#0b2545] outline-none focus:border-[#0b2545] tracking-widest text-sm"
                />
                {passError && (
                  <p className="text-xxs font-bold text-red-500 mt-1.5 uppercase text-center">
                    ❌ Senha incorreta. Consulte seu professor.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#0b2545] hover:bg-black text-[#eebd1a] font-black py-4 rounded-xl text-xs uppercase shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Desbloquear Áudios</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
