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
  LogOut, 
  Camera, 
  Bell, 
  ChevronDown,
  Menu, 
  X,
  Home,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Check
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Controle de leitura das notificações para sumir a bolinha
  const storageKey = `opera_notifs_dismissed_${session.tipoLoginAtual}_${session.userLogado}`;
  const [hasUnread, setHasUnread] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved !== 'true';
    } catch {
      return true;
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDismissNotifications = () => {
    setHasUnread(false);
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {
      // ignore
    }
  };

  const handleToggleNotifications = () => {
    const nextState = !notificationsOpen;
    setNotificationsOpen(nextState);
    if (nextState) {
      // Ao abrir as notificações, limpa a bolinha amarela
      handleDismissNotifications();
    }
  };

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

  const notifCount = session.tipoLoginAtual === 'aluno' 
    ? (hasAbsenceAlert ? 2 : 1) 
    : 1;

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
      <div className="flex items-center gap-3 relative">
        {/* Sininho com Dropdown de Avisos Informativos (Sem redirecionamento) */}
        <div className="relative" ref={notifRef}>
          <button 
            id="btn-header-bell"
            onClick={handleToggleNotifications}
            className="relative text-white/80 hover:text-[#eebd1a] p-2 transition cursor-pointer rounded-full hover:bg-white/10 select-none"
            title="Avisos & Notificações"
          >
            <Bell className={`w-5 h-5 ${hasUnread ? 'text-[#eebd1a]' : 'text-white/80'}`} />
            {hasUnread && (
              <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center pointer-events-none">
                {hasAbsenceAlert && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-4 w-4 text-[9px] font-black text-white items-center justify-center ${hasAbsenceAlert ? 'bg-[#e2001a]' : 'bg-[#eebd1a] text-[#0b2545]'}`}>
                  {notifCount}
                </span>
              </span>
            )}
          </button>

          {/* Modal / Dropdown de Avisos Puramente Informativos */}
          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 text-slate-800">
              <div className="bg-[#0b2545] p-3.5 text-white flex items-center justify-between border-b border-[#eebd1a]">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#eebd1a]" />
                  <h4 className="font-black text-xs uppercase tracking-wider">Avisos & Lembretes</h4>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20 text-[#eebd1a]">
                  {session.tipoLoginAtual === 'prof' ? 'Professor' : session.tipoLoginAtual === 'staff' ? 'Staff' : 'Aluno'}
                </span>
              </div>

              <div className="p-3.5 space-y-3 max-h-[380px] overflow-y-auto">
                {/* AVISOS DO PROFESSOR */}
                {session.tipoLoginAtual === 'prof' && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-amber-500 text-white rounded-lg flex-shrink-0 mt-0.5">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-black text-xs uppercase text-[#0b2545]">
                        Atualizar o Desempenho
                      </h5>
                      <p className="text-xxs text-slate-600 font-medium mt-1 leading-relaxed">
                        Lembrete para manter o preenchimento das notas de produção e compreensão dos seus alunos em dia.
                      </p>
                    </div>
                  </div>
                )}

                {/* AVISOS DO STAFF */}
                {session.tipoLoginAtual === 'staff' && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-[#e2001a] text-white rounded-lg flex-shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-black text-xs uppercase text-[#0b2545]">
                        Verificar Alunos Faltosos
                      </h5>
                      <p className="text-xxs text-slate-600 font-medium mt-1 leading-relaxed">
                        Lembrete para checar o painel de retenção e acompanhar os alunos com 2+ faltas ou reposições pendentes.
                      </p>
                    </div>
                  </div>
                )}

                {/* AVISOS DO ALUNO (2 Avisos Informativos) */}
                {session.tipoLoginAtual === 'aluno' && (
                  <>
                    {/* Aviso 1: Prática diária */}
                    <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                      <div className="p-2 bg-blue-600 text-white rounded-lg flex-shrink-0 mt-0.5">
                        <Headphones className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-black text-xs uppercase text-[#0b2545]">
                          Já praticou o idioma hoje?
                        </h5>
                        <p className="text-xxs text-slate-600 font-medium mt-1 leading-relaxed">
                          Não se esqueça de ouvir os áudios e histórias das suas lições diárias para manter o ritmo e pronúncia.
                        </p>
                      </div>
                    </div>

                    {/* Aviso 2: Frequência */}
                    {hasAbsenceAlert ? (
                      <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                        <div className="p-2 bg-[#e2001a] text-white rounded-lg flex-shrink-0 mt-0.5">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-black text-xs uppercase text-[#e2001a]">
                            Reposições Pendentes
                          </h5>
                          <p className="text-xxs text-slate-600 font-medium mt-1 leading-relaxed">
                            Você possui faltas registradas. Fique atento às lições pendentes para repor seu conteúdo.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                        <div className="p-2 bg-emerald-600 text-white rounded-lg flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-black text-xs uppercase text-emerald-800">
                            Frequência 100% em Dia
                          </h5>
                          <p className="text-xxs text-slate-600 font-medium mt-1 leading-relaxed">
                            Parabéns pela assiduidade! Nenhuma falta pendente registrada no momento.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Botão de Ação OK / Entendido para tirar a notificação */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                <span className="text-3xs font-bold text-slate-400 uppercase">
                  Aviso visual
                </span>
                <button
                  onClick={() => {
                    handleDismissNotifications();
                    setNotificationsOpen(false);
                  }}
                  className="bg-[#0b2545] hover:bg-black text-[#eebd1a] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>OK, Entendido</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Pill */}
        <div className="relative" ref={dropdownRef}>
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
                className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-[#0b2545] hover:bg-slate-50 hover:text-[#e2001a] border-b border-slate-100 transition text-left cursor-pointer"
              >
                <Camera className="w-4 h-4 text-slate-500" />
                <span>Alterar Foto</span>
              </button>
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-black text-[#e2001a] hover:bg-red-50 transition text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair do Portal</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
