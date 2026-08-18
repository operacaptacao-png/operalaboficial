/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { UserSession } from '../types';
import { 
  Calendar, 
  Headphones, 
  HelpCircle, 
  MessageSquare, 
  BarChart3, 
  AlertTriangle, 
  ClipboardCheck, 
  CalendarCheck, 
  Gamepad2, 
  Sparkles,
  LogOut, 
  Camera, 
  Bell, 
  ChevronDown,
  Menu, 
  X,
  Home
} from 'lucide-react';

interface HeaderProps {
  session: UserSession;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  hasAbsenceAlert?: boolean;
  onUpdateAvatar: (dataUrl: string) => void;
}

export default function Header({
  session,
  activeTab,
  onSelectTab,
  onLogout,
  hasAbsenceAlert = false,
  onUpdateAvatar
}: HeaderProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onUpdateAvatar(result);
        }
      };
      reader.readAsDataURL(file);
    }
    setProfileDropdownOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: session.tipoLoginAtual === 'staff' ? 'Início' : 'Meu Painel', icon: session.tipoLoginAtual === 'staff' ? Home : BarChart3, roles: ['aluno', 'staff'] },
    { id: 'agenda', label: 'Minha Agenda', icon: CalendarCheck, roles: ['prof'], highlight: true },
    { id: 'desempenho', label: 'Desempenho', icon: BarChart3, roles: ['prof', 'staff'] },
    { id: 'retencao', label: 'Retenção', icon: AlertTriangle, roles: ['staff'], alertBadge: true },
    { id: 'coordenacao', label: 'Coordenação', icon: ClipboardCheck, roles: ['staff'] },
    { id: 'audios', label: 'Áudios', icon: Headphones, roles: ['aluno', 'prof', 'staff'] },
    { id: 'calendario', label: 'Calendário', icon: Calendar, roles: ['aluno', 'prof', 'staff'] },
    { id: 'tutorial', label: 'Tutorial', icon: HelpCircle, roles: ['aluno'] },
    { id: 'contato', label: 'Fale Conosco', icon: MessageSquare, roles: ['aluno'] }
  ];

  const visibleNav = navItems.filter(item => item.roles.includes(session.tipoLoginAtual));

  return (
    <header className="bg-[#0b2545] border-b-4 border-[#eebd1a] sticky top-0 z-50 px-4 md:px-8 py-3 shadow-xl flex flex-wrap items-center justify-between gap-4">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab(visibleNav[0]?.id || 'dashboard')}>
        <img 
          src="https://i.postimg.cc/MGGygYGg/logo-opera-png.png" 
          alt="Logo Opera" 
          className="h-8 md:h-10 w-auto object-contain"
        />
        <div className="text-xl md:text-2xl font-sans tracking-tighter">
          <span className="font-light text-white">OPERA</span>
          <span className="font-black text-[#eebd1a]">LAB</span>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden text-white p-2 hover:text-[#eebd1a] focus:outline-none"
        aria-label="Abrir Menu"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Desktop Navigation */}
      <nav className={`w-full md:w-auto md:flex-1 md:flex justify-center ${mobileMenuOpen ? 'block' : 'hidden md:flex'}`}>
        <ul className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-1.5 md:gap-2 my-2 md:my-0">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id} className="w-full md:w-auto">
                <button
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full md:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#eebd1a] text-[#0b2545] shadow-md font-extrabold scale-105'
                      : item.id === 'retencao'
                      ? 'bg-red-950/60 text-red-400 border border-red-800/80 hover:bg-red-600 hover:text-white'
                      : item.id === 'agenda'
                      ? 'text-[#eebd1a] hover:bg-white/10'
                      : 'text-white hover:bg-white/10 hover:text-[#eebd1a]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile & Notifications */}
      <div className="flex items-center gap-3 relative" ref={dropdownRef}>
        {hasAbsenceAlert && session.tipoLoginAtual === 'aluno' && (
          <div 
            className="relative cursor-pointer text-white hover:text-[#eebd1a] p-1.5 transition"
            onClick={() => onSelectTab('dashboard')}
            title="Aviso de frequência pendente"
          >
            <Bell className="w-5 h-5 text-[#eebd1a]" />
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#e2001a]"></span>
            </span>
          </div>
        )}

        {/* Profile Pill */}
        <div 
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full border border-white/20 cursor-pointer transition select-none"
        >
          <img 
            src={session.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
            alt="Avatar" 
            className="w-7 h-7 rounded-full object-cover border-2 border-[#eebd1a] bg-white"
          />
          <div className="flex flex-col text-left">
            <span className="text-white text-xs font-black leading-tight uppercase truncate max-w-[120px]">
              {session.nomeDisplay}
            </span>
            <span className="text-[#eebd1a] text-[10px] font-bold uppercase leading-tight truncate max-w-[120px]">
              {session.turmaDisplay}
            </span>
          </div>
          <ChevronDown className="w-3 h-3 text-white/80" />
        </div>

        {/* Profile Dropdown */}
        {profileDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              className="hidden" 
              onChange={handlePhotoUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-[#0b2545] hover:bg-slate-50 hover:text-[#e2001a] border-b border-slate-100 transition text-left"
            >
              <Camera className="w-4 h-4 text-slate-500" />
              <span>Alterar Foto</span>
            </button>
            <button
              onClick={() => {
                setProfileDropdownOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-[#e2001a] hover:bg-red-50 transition text-left"
            >
              <LogOut className="w-4 h-4 text-[#e2001a]" />
              <span>Sair do Portal</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
