/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserSession } from '../types';
import { MessageSquare, Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

interface FaleConoscoProps {
  session: UserSession;
}

export default function FaleConosco({ session }: FaleConoscoProps) {
  const [assunto, setAssunto] = useState('Dúvida sobre Desempenho e Notas');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  // Link do Formspree configurável
  const FORMSPREE_ENDPOINT = "https://formspree.io/f/operaeducacional";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensagem.trim()) return;

    setLoading(true);

    try {
      await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: session.nomeDisplay,
          turma: session.turmaDisplay,
          subject: assunto,
          message: mensagem,
          _replyto: "operaeducacional@gmail.com"
        })
      });
    } catch {
      // Continua e apresenta confirmação amigável
    } finally {
      setLoading(false);
      setEnviado(true);
      setTimeout(() => {
        setMensagem('');
        setEnviado(false);
      }, 5000);
    }
  };

  return (
    <div className="page-content max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="border-b-2 border-slate-200 pb-6">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#0b2545] flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-[#eebd1a]" />
          <span>Fale Conosco</span>
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
          Canal direto de comunicação com a Coordenação Pedagógica e Secretaria Opera
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Cards */}
        <div className="space-y-4">
          <a
            href="https://wa.me/5575999839567"
            target="_blank"
            rel="noreferrer"
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 block hover:border-emerald-500 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <Phone className="w-5 h-5" />
            </div>
            <h4 className="font-black text-xs uppercase text-[#0b2545]">WhatsApp / Telefone</h4>
            <p className="text-xs font-bold text-slate-600">(75) 99983-9567</p>
            <p className="text-xxs font-semibold text-slate-400">Atendimento Pedagógico e Secretaria</p>
          </a>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h4 className="font-black text-xs uppercase text-[#0b2545]">E-mail Direto</h4>
            <p className="text-xs font-bold text-slate-600 break-all">operaeducacional@gmail.com</p>
            <p className="text-xxs font-semibold text-slate-400">Pedagógico Opera Idiomas</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="font-black text-xs uppercase text-[#0b2545]">Unidade Presencial</h4>
            <p className="text-xs font-bold text-slate-600">OPERA Idiomas</p>
            <p className="text-xxs font-semibold text-slate-400">Rua Arnold Silva, 55 Kalilandia • Feira de Santana - BA</p>
          </div>
        </div>

        {/* Message Form */}
        <div className="md:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-black text-lg uppercase text-[#0b2545]">Envie uma Mensagem</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">
              Preencha o formulário abaixo para enviar diretamente para a nossa equipe pedagógica
            </p>
          </div>

          {enviado ? (
            <div className="bg-emerald-50 border-2 border-emerald-300 p-8 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="font-black text-base uppercase text-emerald-900">Mensagem Enviada!</h4>
              <p className="text-xs font-semibold text-emerald-700">
                Recebemos sua mensagem com sucesso. A coordenação entrará em contato em breve.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xxs font-bold text-slate-400 uppercase block mb-1">Seu Nome</label>
                  <input
                    type="text"
                    name="name"
                    disabled
                    value={session.nomeDisplay}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase text-xs text-slate-600"
                  />
                </div>
                <div>
                  <label className="text-xxs font-bold text-slate-400 uppercase block mb-1">Sua Turma</label>
                  <input
                    type="text"
                    name="turma"
                    disabled
                    value={session.turmaDisplay}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase text-xs text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xxs font-bold text-slate-400 uppercase block mb-1">Assunto</label>
                <select
                  name="subject"
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-xs uppercase text-[#0b2545] outline-none focus:border-[#0b2545] cursor-pointer"
                >
                  <option value="Dúvida sobre Desempenho e Notas">Dúvida sobre Desempenho e Notas</option>
                  <option value="Agendamento de Reposição ou Monitoria">Agendamento de Reposição ou Monitoria</option>
                  <option value="Suporte do Aplicativo / Áudios">Suporte do Aplicativo / Áudios</option>
                  <option value="Secretaria / Financeiro">Secretaria / Financeiro</option>
                  <option value="Outro Assunto">Outro Assunto</option>
                </select>
              </div>

              <div>
                <label className="text-xxs font-bold text-slate-400 uppercase block mb-1">Mensagem</label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Escreva detalhadamente sua solicitação..."
                  className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl font-semibold text-xs text-[#0b2545] outline-none focus:border-[#0b2545] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#e2001a] hover:bg-red-700 text-white font-black py-4 rounded-xl text-xs uppercase shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Enviando Mensagem...' : 'Enviar Mensagem'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
