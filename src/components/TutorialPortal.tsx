/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HelpCircle, Play, Smartphone, Laptop, CheckCircle2 } from 'lucide-react';

export default function TutorialPortal() {
  const tutorials = [
    {
      title: "Como Acessar e Praticar os Áudios do seu Livro",
      desc: "Aprenda a desbloquear as faixas do Target, Teens XP e Expert através do portal.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // placeholder video
      badge: "Áudios & Listening"
    },
    {
      title: "Como Instalar o Aplicativo OPERALAB no Celular (PWA)",
      desc: "Tenha acesso rápido direto da tela inicial do seu Android ou iPhone sem ocupar memória.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      badge: "App no Celular"
    }
  ];

  return (
    <div className="page-content max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="border-b-2 border-slate-200 pb-6">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#0b2545] flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-[#eebd1a]" />
          <span>Tutoriais & Suporte</span>
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
          Orientações passo a passo para aproveitar ao máximo a sua experiência no OPERALAB
        </p>
      </div>

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tutorials.map((tut, idx) => (
          <div key={idx} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="aspect-video bg-slate-900 flex items-center justify-center relative">
                <div className="text-center p-6 text-white space-y-2">
                  <Play className="w-12 h-12 text-[#eebd1a] mx-auto opacity-80 hover:opacity-100 hover:scale-110 transition cursor-pointer" />
                  <p className="text-xs font-black uppercase tracking-wider">Vídeo Demonstrativo</p>
                </div>
              </div>

              <div className="p-6 space-y-2">
                <span className="bg-blue-100 text-blue-800 text-xxs font-black px-2.5 py-1 rounded-full uppercase">
                  {tut.badge}
                </span>
                <h3 className="font-black text-base uppercase text-[#0b2545]">{tut.title}</h3>
                <p className="text-xs font-semibold text-slate-500 leading-relaxed">{tut.desc}</p>
              </div>
            </div>

            <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center justify-between text-xxs text-slate-400 font-bold uppercase">
              <span>OPERALAB Guia Oficial</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        ))}
      </div>

      {/* Guia de Instalação PWA */}
      <div className="bg-gradient-to-br from-[#0b2545] to-[#123969] rounded-3xl p-6 md:p-8 text-white shadow-xl space-y-4">
        <h3 className="text-lg font-black uppercase text-[#eebd1a] flex items-center gap-2">
          <Smartphone className="w-6 h-6" />
          <span>Instalar no Smartphone ou Tablet</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-200">
          <div className="bg-white/10 p-4 rounded-2xl border border-white/20 space-y-2">
            <h4 className="font-black text-sm text-white uppercase flex items-center gap-2">
              <Laptop className="w-4 h-4 text-[#eebd1a]" /> No Android (Chrome)
            </h4>
            <p>1. Abra o portal no navegador Chrome.</p>
            <p>2. Toque nos 3 pontinhos no canto superior direito.</p>
            <p>3. Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl border border-white/20 space-y-2">
            <h4 className="font-black text-sm text-white uppercase flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#eebd1a]" /> No iPhone / iPad (Safari)
            </h4>
            <p>1. Abra o portal no navegador Safari.</p>
            <p>2. Toque no botão de <strong>Compartilhar</strong> (ícone do quadrado com seta para cima).</p>
            <p>3. Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
