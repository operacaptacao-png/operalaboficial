/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { UserSession, StudentPerformanceData } from './types';
import { fetchDesempenhoData } from './services/api';

import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import DashboardAluno from './components/DashboardAluno';
import AgendaProfessor from './components/AgendaProfessor';
import DesempenhoLab from './components/DesempenhoLab';
import RetencaoPanel from './components/RetencaoPanel';
import CoordenacaoPanel from './components/CoordenacaoPanel';
import AudiosPortal from './components/AudiosPortal';
import CalendarioLetivo from './components/CalendarioLetivo';
import TutorialPortal from './components/TutorialPortal';
import FaleConosco from './components/FaleConosco';
import OperaPlay from './components/OperaPlay';
import FloatingSocialMenu from './components/FloatingSocialMenu';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('opera_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [perfData, setPerfData] = useState<StudentPerformanceData>({});
  const [hasAbsenceAlert, setHasAbsenceAlert] = useState(false);

  // Inicializa dados de desempenho
  useEffect(() => {
    async function loadData() {
      const data = await fetchDesempenhoData();
      setPerfData(data);
    }
    loadData();
  }, []);

  // Ajusta aba padrão de acordo com o perfil logado
  useEffect(() => {
    if (session) {
      if (session.tipoLoginAtual === 'prof') {
        setActiveTab('agenda');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [session?.tipoLoginAtual]);

  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    localStorage.setItem('opera_session', JSON.stringify(newSession));
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('opera_session');
  };

  const handleUpdateAvatar = (dataUrl: string) => {
    if (session) {
      const updated = { ...session, avatar: dataUrl };
      setSession(updated);
      localStorage.setItem('opera_session', JSON.stringify(updated));
    }
  };

  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] text-[#0b2545] flex flex-col justify-between selection:bg-[#eebd1a] selection:text-[#0b2545]">
      {/* Role-Aware Navigation Bar */}
      <Header
        session={session}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLogout={handleLogout}
        hasAbsenceAlert={hasAbsenceAlert}
        onUpdateAvatar={handleUpdateAvatar}
      />

      {/* Main App Body */}
      <main className="flex-1 py-6">
        {activeTab === 'dashboard' && (
          <DashboardAluno
            session={session}
            perfData={perfData}
            onNavigate={setActiveTab}
            onAbsenceStatusChange={setHasAbsenceAlert}
          />
        )}

        {activeTab === 'agenda' && (
          <AgendaProfessor session={session} />
        )}

        {activeTab === 'desempenho' && (
          <DesempenhoLab
            session={session}
            perfData={perfData}
            onUpdatePerfData={setPerfData}
          />
        )}

        {activeTab === 'retencao' && (
          <RetencaoPanel session={session} />
        )}

        {activeTab === 'coordenacao' && (
          <CoordenacaoPanel session={session} perfData={perfData} />
        )}

        {activeTab === 'audios' && (
          <AudiosPortal session={session} />
        )}

        {activeTab === 'calendario' && (
          <CalendarioLetivo session={session} />
        )}

        {activeTab === 'tutorial' && (
          <TutorialPortal />
        )}

        {activeTab === 'operaplay' && (
          <OperaPlay session={session} />
        )}

        {activeTab === 'contato' && (
          <FaleConosco session={session} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0b2545] border-t-2 border-[#eebd1a] py-6 px-4 text-center text-white no-print">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-wider text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-white font-black">OPERALAB</span>
            <span>• Portal Integrado Pedagógico</span>
          </div>
          <p className="text-xxs">
            © 2026 OPERA Idiomas Ltda. • Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Floating Social Media Buttons */}
      <FloatingSocialMenu />
    </div>
  );
}
