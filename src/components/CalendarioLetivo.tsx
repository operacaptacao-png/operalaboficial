/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { UserSession, CalendarEvent } from '../types';
import { eventsDB } from '../data/database';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Flag, 
  Coffee,
  Bookmark
} from 'lucide-react';

interface CalendarioLetivoProps {
  session: UserSession;
}

export default function CalendarioLetivo({ session }: CalendarioLetivoProps) {
  const [currentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getEventForDate = (dateStr: string): CalendarEvent | null => {
    for (const ev of eventsDB) {
      if (ev.date === dateStr) return ev;
      if (ev.start && ev.end && dateStr >= ev.start && dateStr <= ev.end) {
        return ev;
      }
    }
    return null;
  };

  const hoje = new Date();
  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => (prev > 0 ? prev - 1 : 11));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => (prev < 11 ? prev + 1 : 0));
  };

  // Eventos do mês selecionado
  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const eventosDoMes = eventsDB.filter((ev) => {
    if (ev.date && ev.date.startsWith(monthPrefix)) return true;
    if (ev.start && ev.end) {
      const s = ev.start.substring(0, 7);
      const e = ev.end.substring(0, 7);
      if (monthPrefix >= s && monthPrefix <= e) return true;
    }
    return false;
  });

  return (
    <div className="page-content max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-slate-200 pb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#0b2545] flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-[#eebd1a]" />
            <span>Calendário Letivo 2026</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            Datas Comemorativas, Início de Aulas, Plantões Pedagógicos e Recessos
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 text-xxs font-black uppercase">
          <span className="flex items-center gap-1.5 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full border border-blue-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Aulas & Retorno
          </span>
          <span className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full border border-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Eventos & Plantão
          </span>
          <span className="flex items-center gap-1.5 bg-red-100 text-red-800 px-3 py-1.5 rounded-full border border-red-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Recesso & Feriados
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {/* Month Navigator */}
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-2 bg-white hover:bg-[#0b2545] hover:text-white rounded-xl border border-slate-200 transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-[#0b2545]">
              {monthNames[currentMonth]} {currentYear}
            </h2>

            <button
              onClick={handleNextMonth}
              className="p-2 bg-white hover:bg-[#0b2545] hover:text-white rounded-xl border border-slate-200 transition cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-black text-xxs uppercase text-slate-400">
            <span>Dom</span>
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blanks */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="h-16 md:h-20 bg-slate-50/50 rounded-xl border border-dashed border-slate-200/50"></div>
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const ev = getEventForDate(dateStr);
              const isToday = dateStr === hojeStr;
              const isPast = dateStr < hojeStr;

              let bgClass = 'bg-slate-50 border-slate-200 text-slate-700';
              let badgeCol = '';

              if (ev) {
                if (ev.type === 'blue') {
                  bgClass = 'bg-blue-50 border-blue-400 text-blue-900 font-black shadow-sm';
                  badgeCol = 'bg-blue-600 text-white';
                } else if (ev.type === 'gold') {
                  bgClass = 'bg-amber-50 border-amber-400 text-amber-900 font-black shadow-sm';
                  badgeCol = 'bg-amber-500 text-white';
                } else if (ev.type === 'red') {
                  bgClass = 'bg-red-50 border-red-300 text-red-900 font-black shadow-sm';
                  badgeCol = 'bg-red-500 text-white';
                }
              }

              return (
                <div
                  key={day}
                  className={`h-16 md:h-20 p-2 rounded-xl border transition flex flex-col justify-between relative overflow-hidden ${bgClass} ${
                    isToday ? 'ring-2 ring-[#eebd1a] border-[#0b2545]' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black">{day}</span>
                    {isToday && (
                      <span className="bg-[#eebd1a] text-[#0b2545] text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                        Hoje
                      </span>
                    )}
                    {isPast && !ev && (
                      <span className="text-[10px] text-slate-300 font-bold">✕</span>
                    )}
                  </div>

                  {ev && (
                    <div className="mt-auto">
                      <span className={`text-[9px] leading-tight px-1 py-0.5 rounded truncate block ${badgeCol}`} title={ev.title}>
                        {ev.title}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Eventos do Mês */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-black text-sm uppercase text-[#0b2545] border-b border-slate-100 pb-3 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#eebd1a]" />
              <span>Eventos em {monthNames[currentMonth]}</span>
            </h3>

            {eventosDoMes.length > 0 ? (
              <div className="space-y-3">
                {eventosDoMes.map((ev, idx) => {
                  let dateLabel = ev.date;
                  if (ev.start && ev.end) {
                    dateLabel = `${ev.start.split('-')[2]}/${ev.start.split('-')[1]} a ${ev.end.split('-')[2]}/${ev.end.split('-')[1]}`;
                  } else if (ev.date) {
                    dateLabel = `${ev.date.split('-')[2]}/${ev.date.split('-')[1]}`;
                  }

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        ev.type === 'blue'
                          ? 'bg-blue-50 border-blue-200 text-blue-900'
                          : ev.type === 'gold'
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-red-50 border-red-200 text-red-900'
                      }`}
                    >
                      <div className="flex justify-between items-center font-black">
                        <span className="uppercase">{ev.title}</span>
                        <span className="text-xxs font-mono bg-white px-2 py-0.5 rounded border">
                          {dateLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Coffee className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold uppercase">Nenhum evento especial previsto neste mês.</p>
              </div>
            )}
          </div>

          {session?.tipoLoginAtual === 'aluno' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xxs font-bold text-slate-500 uppercase leading-relaxed">
              💡 Dica: Mantenha sua frequência em dia. Em caso de ausência por feriado ou recesso, não é necessária reposição.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
