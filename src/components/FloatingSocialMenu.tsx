/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Share2, Globe, MessageCircle, Youtube, Instagram, X } from 'lucide-react';

export default function FloatingSocialMenu() {
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: "WhatsApp",
      icon: MessageCircle,
      url: "https://wa.me/557599839567",
      bgColor: "bg-emerald-500 hover:bg-emerald-600",
      textColor: "text-white"
    },
    {
      label: "Instagram",
      icon: Instagram,
      url: "https://www.instagram.com/operaidiomas",
      bgColor: "bg-pink-600 hover:bg-pink-700",
      textColor: "text-white"
    },
    {
      label: "YouTube",
      icon: Youtube,
      url: "https://www.youtube.com/@operaidiomas",
      bgColor: "bg-red-600 hover:bg-red-700",
      textColor: "text-white"
    },
    {
      label: "Site Oficial",
      icon: Globe,
      url: "https://www.operaidiomas.com.br",
      bgColor: "bg-[#0b2545] hover:bg-black",
      textColor: "text-[#eebd1a]"
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 no-print">
      {/* Expanded items */}
      {open && (
        <div className="flex flex-col gap-2 mb-2 animate-in fade-in slide-in-from-bottom-3">
          {links.map((l, idx) => {
            const Icon = l.icon;
            return (
              <a
                key={idx}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-lg text-xs font-black uppercase tracking-wider transition hover:scale-105 ${l.bgColor} ${l.textColor}`}
              >
                <Icon className="w-4 h-4" />
                <span>{l.label}</span>
              </a>
            );
          })}
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-[#0b2545] border-2 border-[#eebd1a] text-[#eebd1a] shadow-2xl flex items-center justify-center hover:scale-110 transition cursor-pointer"
        aria-label="Redes e Contatos"
        title="Redes Sociais & Contatos"
      >
        {open ? <X className="w-6 h-6" /> : <Share2 className="w-6 h-6" />}
      </button>
    </div>
  );
}
