/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserSession, StudentPerformanceData, StudentPerformanceLesson } from '../types';
import { PERF_MASTER_DB, mapearTurmaParaCertificado } from '../data/database';
import { 
  saveStudentPerformance, 
  deleteStudentPerformance, 
  registrarChamadaNuvem, 
  normalizeString 
} from '../services/api';
import { 
  Search, ClipboardList, Save, Award, Trash2, ArrowLeft, 
  Check, RefreshCw, Sparkles, AlertCircle, UserCheck, Lock, Download, X
} from 'lucide-react';

interface DesempenhoLabProps {
  session: UserSession;
  perfData: StudentPerformanceData;
  onUpdatePerfData: (newData: StudentPerformanceData) => void;
}

export default function DesempenhoLab({ session, perfData, onUpdatePerfData }: DesempenhoLabProps) {
  const isTeacher = session.tipoLoginAtual === 'prof';
  const isStaff = session.tipoLoginAtual === 'staff';

  const [step, setStep] = useState<'turmas' | 'alunos' | 'editor' | 'impressao_relatorio' | 'impressao_cert'>('turmas');
  const [activeTurma, setActiveTurma] = useState<string>('');
  const [activeProfOwner, setActiveProfOwner] = useState<string>('');
  const [activeAluno, setActiveAluno] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'geral' | 'especifico'>('geral');
  const [relatorioTipo, setRelatorioTipo] = useState<'geral' | 'especifico'>('geral');

  // Controle de Abas Discretas para o Staff (Sem o Accordion)
  const [selectedProfStaff, setSelectedProfStaff] = useState<string>(() => {
    if (isTeacher) return session.userLogado;
    const firstProf = Object.keys(PERF_MASTER_DB)[0];
    return firstProf || '';
  });

  // Diário de Classe (Chamada)
  const [modalChamadaOpen, setModalChamadaOpen] = useState(false);
  const [chamadaData, setChamadaData] = useState(new Date().toISOString().split('T')[0]);
  const [chamadaLicao, setChamadaLicao] = useState('');
  const [chamadaPresencas, setChamadaPresencas] = useState<Record<string, boolean>>({});
  const [chamadaLoading, setChamadaLoading] = useState(false);

  // Sync state
  const [saving, setSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Notas e HTML para impressão
  const [currentNotas, setCurrentNotas] = useState<StudentPerformanceLesson[]>([]);
  const [htmlRelatorio, setHtmlRelatorio] = useState('');
  const [htmlCertFrente, setHtmlCertFrente] = useState('');
  const [htmlCertVerso, setHtmlCertVerso] = useState('');

  const getAlunosDaTurma = (turma: string, prof: string) => {
    if (PERF_MASTER_DB[prof] && PERF_MASTER_DB[prof][turma]) return PERF_MASTER_DB[prof][turma];
    for (const p in PERF_MASTER_DB) {
      if (PERF_MASTER_DB[p][turma]) return PERF_MASTER_DB[p][turma];
    }
    return [];
  };

  const calculateStudentPie = (aluno: string, turma: string) => {
    const notas = perfData[aluno] || [];
    const isEspanhol = turma.toUpperCase().startsWith('ESP');
    const maxL = isEspanhol ? 5 : 8;
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let validos = 0;

    for (let i = 0; i < maxL; i++) {
      const lesson = notas[i] || {};
      ['po', 'co', 'pe', 'ce'].forEach((k) => {
        const v = Number(lesson[k as keyof typeof lesson]);
        if (v >= 1 && v <= 5) { counts[v]++; validos++; }
      });
    }

    if (validos === 0) return 'conic-gradient(#cbd5e1 0% 100%)';
    const p1 = (counts[1] / validos) * 100;
    const p2 = (counts[2] / validos) * 100;
    const p3 = (counts[3] / validos) * 100;
    const p4 = (counts[4] / validos) * 100;

    return `conic-gradient(#ef4444 0% ${p1}%, #f97316 ${p1}% ${p1 + p2}%, #eab308 ${p1 + p2}% ${p1 + p2 + p3}%, #3b82f6 ${p1 + p2 + p3}% ${p1 + p2 + p3 + p4}%, #22c55e ${p1 + p2 + p3 + p4}% 100%)`;
  };

  const handleOpenTurma = (turma: string, prof: string) => {
    setActiveTurma(turma);
    setActiveProfOwner(prof);
    setStep('alunos');
  };

  const handleOpenEditor = (aluno: string) => {
    setActiveAluno(aluno);
    const existing = perfData[aluno];
    const initialNotas: StudentPerformanceLesson[] = existing && existing.length > 0
      ? JSON.parse(JSON.stringify(existing))
      : Array(8).fill(null).map(() => ({ po: 0, co: 0, pe: 0, ce: 0, as: 0, obsA: '', obsB: '', obsC: '', obsD: '' }));
    
    setCurrentNotas(initialNotas);
    setStep('editor');
    setActiveTab('geral');
  };

  const setNotaCrit = (lessonIdx: number, crit: string, val: number) => {
    if (!isTeacher) return;
    setCurrentNotas((prev) => {
      const updated = [...prev];
      if (!updated[lessonIdx]) updated[lessonIdx] = { po: 0, co: 0, pe: 0, ce: 0 };
      updated[lessonIdx] = { ...updated[lessonIdx], [crit]: val };
      return updated;
    });
  };

  const setNotaSubCrit = (lessonIdx: number, sub: string, crit: string, val: number) => {
    if (!isTeacher) return;
    const key = `cor${sub}_${crit}`;
    setCurrentNotas((prev) => {
      const updated = [...prev];
      if (!updated[lessonIdx]) updated[lessonIdx] = {};
      updated[lessonIdx] = { ...updated[lessonIdx], [key]: val };
      return updated;
    });
  };

  const setNotaObs = (lessonIdx: number, sub: string, text: string) => {
    if (!isTeacher) return;
    const key = `obs${sub}`;
    setCurrentNotas((prev) => {
      const updated = [...prev];
      if (!updated[lessonIdx]) updated[lessonIdx] = {};
      updated[lessonIdx] = { ...updated[lessonIdx], [key]: text };
      return updated;
    });
  };

  const handleSalvarNotas = async () => {
    if (!isTeacher) return;
    setSaving(true);
    setSyncStatus('Salvando na nuvem...');
    const updatedAll = { ...perfData, [activeAluno]: currentNotas };
    onUpdatePerfData(updatedAll);

    let profToSave = activeProfOwner || session.userLogado;
    const success = await saveStudentPerformance(activeAluno, activeTurma, profToSave, currentNotas);
    setSaving(false);
    setSyncStatus(success ? 'Avaliação salva com sucesso!' : 'Salvo localmente. Verifique sua conexão.');
    setTimeout(() => setSyncStatus(null), 3000);
  };

  const handleDeleteAluno = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir permanentemente o registro de ${activeAluno}?`)) return;
    setSaving(true);
    await deleteStudentPerformance(activeAluno);
    const updated = { ...perfData };
    delete updated[activeAluno];
    onUpdatePerfData(updated);
    setSaving(false);
    setStep('alunos');
  };

  const handleOpenChamadaModal = () => {
    setChamadaData(new Date().toISOString().split('T')[0]);
    setChamadaLicao('');
    const alunos = getAlunosDaTurma(activeTurma, activeProfOwner || session.userLogado);
    const initialPresencas: Record<string, boolean> = {};
    alunos.forEach((a) => { initialPresencas[a] = true; });
    setChamadaPresencas(initialPresencas);
    setModalChamadaOpen(true);
  };

  const handleEnviarChamada = async () => {
    if (!chamadaLicao) { alert('Por favor, selecione qual lição foi ministrada.'); return; }
    setChamadaLoading(true);
    const alunos = getAlunosDaTurma(activeTurma, activeProfOwner || session.userLogado);
    const dados = alunos.map((a) => ({ nome: a, status: chamadaPresencas[a] ? 'Presente' : 'Faltou' }));
    const prof = activeProfOwner || session.userLogado;
    const success = await registrarChamadaNuvem(prof, activeTurma, chamadaData, chamadaLicao, dados);
    setChamadaLoading(false);
    alert(success ? 'Presenças registradas com sucesso!' : 'Gravadas localmente.');
    setModalChamadaOpen(false);
  };

  const isEspanhol = activeTurma.toUpperCase().startsWith('ESP');
  const maxL = isEspanhol ? 5 : 8;
  const isCrianca = activeTurma.toUpperCase().startsWith('EXPLORES') || activeTurma.toUpperCase().startsWith('DISCO');

  let preenchidas = 0;
  for (let i = 0; i < maxL; i++) {
    const l = currentNotas[i];
    if (l && (Number(l.po) > 0 || Number(l.co) > 0 || Number(l.pe) > 0 || Number(l.ce) > 0 || (l.obsA && l.obsA.length > 0))) preenchidas++;
  }
  const percentComplete = Math.round((preenchidas / maxL) * 100);

  const searchResults: { aluno: string; turma: string; prof: string }[] = [];
  if (searchTerm.trim().length > 1) {
    const term = normalizeString(searchTerm);
    for (const prof in PERF_MASTER_DB) {
      if (isTeacher && prof !== session.userLogado) continue;
      for (const turma in PERF_MASTER_DB[prof]) {
        for (const aluno of PERF_MASTER_DB[prof][turma]) {
          if (normalizeString(aluno).includes(term)) searchResults.push({ aluno, turma, prof });
        }
      }
    }
  }

  // ============================================
  // GERAÇÃO DE HTML: CERTIFICADOS E RELATÓRIOS
  // ============================================

  const gerarTextoCertificadoOficial = (dadosCurso: any, nomeAluno: string, tipo: string) => {
    const dataEmissao = new Date().toLocaleDateString('pt-BR');

    // 1. FORÇAR O IDIOMA CORRETO PELA SIGLA DA TURMA (FR, ESP, EN)
    let idiomaTurma = 'en';
    const sigla = activeTurma.toUpperCase();
    if (sigla.startsWith('FR')) idiomaTurma = 'fr';
    else if (sigla.startsWith('ESP')) idiomaTurma = 'es';
    else if (dadosCurso && dadosCurso.idioma) idiomaTurma = dadosCurso.idioma;

    const traducoes: any = {
      'en': { titulo: "CERTIFICATE OF ATTENDANCE AND PROGRESS*", awarded: "Awarded to", texto: `This is to certify that the above student has successfully completed a ${dadosCurso?.horas || '90'}-hour-long<br>General English Course (Standard 2 hours per week) at an (CEFR ${dadosCurso?.nivel || 'A1'}) at OPERA<br>IDIOMAS.`, dataLabel: "Date of issue", rodape: "This certificate is valid for two years" },
      'es': { titulo: "CERTIFICADO DE ASISTENCIA Y PROGRESO*", awarded: "Otorgado a", texto: `Por la presente se certifica que el estudiante mencionado anteriormente ha completado con éxito un ${dadosCurso?.curso || 'Curso de Español'}<br>de ${dadosCurso?.horas || '90'} horas (Estándar 2 horas por semana) en un nivel (MCER ${dadosCurso?.nivel || 'A1'}) en OPERA<br>IDIOMAS.`, dataLabel: "Fecha de emisión", rodape: "Este certificado es válido por dos años" },
      'fr': { titulo: "CERTIFICAT DE PRÉSENCE ET DE PROGRÈS*", awarded: "Décerné à", texto: `Ceci certifie que l'étudiant ci-dessus a terminé avec succès un ${dadosCurso?.curso || 'Cours de Français'}<br>de ${dadosCurso?.horas || '90'} heures (Standard 2 heures par semaine) au niveau (CECRL ${dadosCurso?.nivel || 'A1'}) à OPERA<br>IDIOMAS.`, dataLabel: "Date d'émission", rodape: "Ce certificat est valable deux ans" }
    };
    const t = traducoes[idiomaTurma];

    // 2. TIMBRADO (SÓ TEXTO) VS DIGITAL (COM MARCA D'ÁGUA E ASSINATURA)
    let htmlElementosDigitais = '';
    let marginTopo = '80px'; 
    
    if (tipo === 'digital') {
      marginTopo = '140px';
      htmlElementosDigitais = `
        <img src="https://i.postimg.cc/MGGygYGg/logo_opera_png.png" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 700px; opacity: 0.05; z-index: 0; pointer-events: none; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
        <div style="position: absolute; top: 40px; left: 50%; transform: translateX(-50%); z-index: 20;">
          <img src="https://i.postimg.cc/dQx0d4bk/logo-do-opera-com-nome.png" style="width: 190px;">
        </div>
      `;
    }

    return `
      <div style="width: 297mm; height: 200mm; position: relative; overflow: hidden; background: #fff; margin: 0 auto; page-break-after: always; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; font-family: sans-serif;">
        ${htmlElementosDigitais}
        
        <div style="position: relative; z-index: 10; width: 100%; display: flex; flex-direction: column; align-items: center; margin-top: ${marginTopo};">
          <div style="font-size: 26px; font-weight: 900; text-transform: uppercase; color: #0b2545; margin-bottom: 20px;">${t.titulo}</div>
          <div style="font-size: 18px; font-weight: 400; color: #555; margin-bottom: 10px; font-style: italic;">${t.awarded}</div>
          <div style="font-size: 40px; font-weight: 900; color: #000; text-transform: uppercase; margin-bottom: 30px;">${nomeAluno}</div>
          <div style="font-size: 18px; font-weight: 400; color: #333; line-height: 1.6; margin-bottom: 50px;">${t.texto}</div>
          
          <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 20px;">
            ${tipo === 'digital' ? '<img src="https://i.postimg.cc/fWcV4xpx/Assinatura-em-png.png" style="height: 90px; object-fit: contain; margin-bottom: -20px; position: relative; z-index: 10; -webkit-print-color-adjust: exact; print-color-adjust: exact;">' : '<div style="height: 70px;"></div>'}
            <div style="width: 320px; border-top: 2px solid #000; margin-bottom: 5px;"></div>
            <div style="font-size: 16px; font-weight: 700; color: #000;">Adriana Silva Almeida Borges</div>
            <div style="font-size: 14px; font-weight: 400; color: #555;">General Director</div>
          </div>
          
          <div style="font-size: 16px; font-weight: 900; color: #000; margin-bottom: 20px;">${t.dataLabel}: ${dataEmissao}</div>
          <div style="font-size: 14px; font-weight: 400; color: #666; font-style: italic;">${t.rodape}</div>
        </div>

        ${tipo === 'digital' ? `
        <div style="position: absolute; bottom: 40px; right: 40px; text-align: right; font-size: 12px; font-weight: 700; color: #333; z-index: 20;">
          OPERA Idiomas Ltda.<br>Rua Arnold Silva, 55 Kalilandia<br>Feira de Santana-Estado da Bahia<br>CNPJ: 48.043.598/0001
        </div>` : ''}
      </div>
    `;
  };

  const gerarHtmlDesempenhoOficial = (nome: string, turma: string, tipo: string) => {
    let gridH = '';
    const dbNotasCloud = { ...perfData, [activeAluno]: currentNotas };

    for(let i=0; i<maxL; i++) {
      let l = dbNotasCloud[nome] && dbNotasCloud[nome][i] ? dbNotasCloud[nome][i] : {po:0, co:0, pe:0, ce:0}; 
      gridH += `
      <div style="border: 1px solid #ccc; padding: 10px; border-radius: 8px;">
        <div style="font-weight: 900; font-size: 14px; border-bottom: 1px solid #ccc; margin-bottom: 8px; padding-bottom: 4px;">Lesson ${i+1}</div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${['po','co','pe','ce'].map(k => {
            let v = Number(l[k as keyof typeof l]) || 0;
            let color = v==1?'#ef4444':v==2?'#f97316':v==3?'#eab308':v==4?'#3b82f6':'#22c55e';
            return `<div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="font-size:10px; font-weight:bold; color:#555; text-transform:uppercase;">${k=='po'?'P. Oral':k=='co'?'C. Oral':k=='pe'?'P. Escr':k=='ce'?'C. Escr':''}</div>
              <div style="background-color:${v==0?'#fff':color}; width: 14px; height: 14px; border-radius: 50%; border: 1px solid ${v==0?'#ccc':'#000'}; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }

    return `
      <div style="width: 297mm; height: 200mm; position: relative; overflow: hidden; background: #fff; margin: 0 auto; padding: 40px; box-sizing: border-box; font-family: sans-serif;">
        ${tipo === 'digital' ? `<img src="https://i.postimg.cc/MGGygYGg/logo_opera_png.png" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 600px; opacity: 0.05; z-index: 0; pointer-events: none; -webkit-print-color-adjust: exact; print-color-adjust: exact;">` : ''}
        
        <div style="position: relative; z-index: 10; border: 2px solid #000; padding: 30px; height: 100%; box-sizing: border-box; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0b2545; padding-bottom: 10px; margin-bottom: 20px;">
            ${tipo === 'digital' ? `<img src="https://i.postimg.cc/MGGygYGg/logo-opera-png.png" style="height: 40px; -webkit-print-color-adjust: exact; print-color-adjust: exact;">` : `<div style="height: 40px;"></div>`}
            <div style="text-align: right;"><div style="color: #0b2545; font-weight: 900; font-size: 18px;">RELATÓRIO DE DESEMPENHO</div><div style="font-size: 14px; color: #555; font-weight:bold;">TURMA: ${turma}</div></div>
          </div>
          
          <div style="display: flex; gap: 30px; flex: 1;">
            <div style="flex: 3; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; align-content: start;">${gridH}</div>
            
            <div style="flex: 1; padding-left: 20px; border-left: 2px solid #eee;">
              <div style="font-weight: 900; text-transform: uppercase; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 5px;">Assessment Index</div>
              <div style="font-size: 11px; font-weight: 900; margin-bottom: 8px; display:flex; align-items:center; gap:6px;"><div style="width:12px; height:12px; border-radius:50%; background:#22c55e; border: 1px solid #000; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div> Supera o esperado</div>
              <div style="font-size: 11px; font-weight: 900; margin-bottom: 8px; display:flex; align-items:center; gap:6px;"><div style="width:12px; height:12px; border-radius:50%; background:#3b82f6; border: 1px solid #000; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div> Atende ao esperado</div>
              <div style="font-size: 11px; font-weight: 900; margin-bottom: 8px; display:flex; align-items:center; gap:6px;"><div style="width:12px; height:12px; border-radius:50%; background:#eab308; border: 1px solid #000; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div> Em desenvolvimento</div>
              <div style="font-size: 11px; font-weight: 900; margin-bottom: 8px; display:flex; align-items:center; gap:6px;"><div style="width:12px; height:12px; border-radius:50%; background:#f97316; border: 1px solid #000; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div> Nível básico</div>
              <div style="font-size: 11px; font-weight: 900; margin-bottom: 8px; display:flex; align-items:center; gap:6px;"><div style="width:12px; height:12px; border-radius:50%; background:#ef4444; border: 1px solid #000; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div> Não alcançado</div>
            </div>
          </div>
          
          <div style="margin-top:20px; font-weight:900; font-size:20px; text-transform:uppercase; border-top:3px solid #000; padding-top:10px;">STUDENT: ${nome}</div>
        </div>
      </div>
    `;
  };

  const gerarCertificadoOficial = (tipo: 'impressao' | 'digital') => {
    let dadosCurso = mapearTurmaParaCertificado(activeTurma);
    if (!dadosCurso) { alert("Erro: Regras do certificado não encontradas."); return; }
    
    setHtmlCertFrente(gerarTextoCertificadoOficial(dadosCurso, activeAluno, tipo));
    setHtmlCertVerso(gerarHtmlDesempenhoOficial(activeAluno, activeTurma, tipo));
    setStep('impressao_cert');
    window.scrollTo(0,0);
  };

  const perfGerarPDFRelatorioSimples = (tipoPDF: 'geral' | 'especifico') => {
    const dbNotasCloud = { ...perfData, [activeAluno]: currentNotas };
    setRelatorioTipo(tipoPDF);
    let contentHTML = '';

    if(tipoPDF === 'geral') {
      let gridH = '';
      for(let i=0; i<maxL; i++) {
        let l = dbNotasCloud[activeAluno][i] || {};
        gridH += `
        <div class="lesson-box" style="padding: 15px; border: 1px solid #ccc; border-radius: 8px;">
          <div class="lesson-title" style="font-weight: 900; border-bottom: 1px solid #ccc; margin-bottom: 10px; padding-bottom: 5px;">Lesson ${i+1}</div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${['po','co','pe','ce'].map(k => {
              let v = Number(l[k as keyof typeof l]) || 0;
              let color = v==0?'#fff':v==1?'#ef4444':v==2?'#f97316':v==3?'#eab308':v==4?'#3b82f6':'#22c55e';
              return `<div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="font-size:11px; font-weight:bold; text-transform:uppercase;">${k=='po'?'P. Oral':k=='co'?'C. Oral':k=='pe'?'P. Escr':k=='ce'?'C. Escr':''}</div>
                <div style="background-color:${color}; width: 16px; height: 16px; border-radius: 50%; border: 1px solid ${v==0?'#ccc':'transparent'}; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div>
              </div>`;
            }).join('')}
          </div>
        </div>`;
      }

      contentHTML = `
      <div style="display: flex; gap: 30px;">
        <div style="flex: 3; display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">${gridH}</div>
        <div style="flex: 1; padding-left: 20px; border-left: 2px solid #ccc;">
          <div style="font-weight: 900; text-transform: uppercase; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 5px;">Assessment Index</div>
          <div style="font-size: 11px; font-weight: bold; margin-bottom: 8px; display:flex; align-items:center; gap:5px;"><div style="width:14px; height:14px; border-radius:50%; background:#22c55e; border: 1px solid #000; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div> Supera o esperado</div>
          <div style="font-size: 11px; font-weight: bold; margin-bottom: 8px; display:flex; align-items:center; gap:5px;"><div style="width:14px; height:14px; border-radius:50%; background:#3b82f6; border: 1px solid #000; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div> Atende ao esperado</div>
          <div style="font-size: 11px; font-weight: bold; margin-bottom: 8px; display:flex; align-items:center; gap:5px;"><div style="width:14px; height:14px; border-radius:50%; background:#eab308; border: 1px solid #000; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div> Em desenvolvimento</div>
          <div style="font-size: 11px; font-weight: bold; margin-bottom: 8px; display:flex; align-items:center; gap:5px;"><div style="width:14px; height:14px; border-radius:50%; background:#f97316; border: 1px solid #000; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div> Nível básico</div>
          <div style="font-size: 11px; font-weight: bold; margin-bottom: 8px; display:flex; align-items:center; gap:5px;"><div style="width:14px; height:14px; border-radius:50%; background:#ef4444; border: 1px solid #000; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div> Não alcançado</div>
          <div style="margin-top: 40px; text-align: center;">
            <div style="font-weight: 900; font-size: 11px; text-transform: uppercase; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 5px;">Overall Performance</div>
            <div style="width: 120px; height: 120px; border-radius: 50%; margin: 0 auto; border: 2px solid #0b2545; background: ${calculateStudentPie(activeAluno, activeTurma)}; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div>
          </div>
        </div>
      </div>`;
    } else {
      let obsBlocks = '';
      for(let i=0; i<maxL; i++) {
        let l = dbNotasCloud[activeAluno][i] || {};
        obsBlocks += `
        <div style="border: 1px solid #000; padding: 15px; border-radius: 8px; page-break-inside: avoid; margin-bottom: 15px;">
          <div style="font-weight: 900; text-transform: uppercase; font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Lesson ${i+1}</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            ${['A','B','C','D'].map(sub => {
              let htmlDots = '<div style="display:flex; gap:10px; margin-bottom: 8px;">';
              [{id:'po', l:'PO'}, {id:'co', l:'CO'}, {id:'pe', l:'PE'}, {id:'ce', l:'CE'}].forEach(sc => {
                let v = Number(l[('cor'+sub+'_'+sc.id) as keyof typeof l]) || 0;
                let color = v==0?'#fff':v==1?'#ef4444':v==2?'#f97316':v==3?'#eab308':v==4?'#3b82f6':'#22c55e';
                htmlDots += `<div style="display:flex; align-items:center; gap:4px;"><span style="font-size:10px; font-weight:bold; color:#555;">${sc.l}</span><div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${color}; border: 1px solid ${v==0?'#ccc':'#000'}; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div></div>`;
              });
              htmlDots += '</div>';
              let obsText = (String(l[('obs'+sub) as keyof typeof l] || '')).trim();
              return `
              <div style="display: flex; flex-direction: column; gap: 5px;">
                <div style="font-weight: 900; font-size: 11px; color: #0b2545; text-transform: uppercase;">Sub-lição ${i+1}${sub}</div>
                ${htmlDots}
                <div style="font-size: 11px; color: #333; line-height: 1.4;">${obsText || '<span style="color:#999; font-style:italic;">Nenhuma observação registrada.</span>'}</div>
              </div>`;
            }).join('')}
          </div>
        </div>`;
      }
      contentHTML = `<div style="width: 100%;"><div style="font-weight: 900; font-size: 18px; text-transform: uppercase; margin-bottom: 20px; text-align: center; border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 10px 0;">Relatório de Desenvolvimento Específico</div>${obsBlocks}</div>`;
    }

    setHtmlRelatorio(`
      <div style="padding: 40px; position: relative; background: #fff; width: 297mm; min-height: 200mm; margin: 0 auto;">
        <img src="https://i.postimg.cc/MGGygYGg/logo_opera_png.png" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 700px; opacity: 0.05; z-index: 0; pointer-events: none;">
        <div style="position: relative; z-index: 10;">
          <div style="display:flex; justify-content:space-between; font-weight:bold; margin-bottom: 30px; font-size: 14px; border-bottom: 2px solid #ccc; padding-bottom: 10px;">
            <div>PROFESSOR: ${isStaff ? activeProfOwner : session.userLogado}</div>
            <div>TURMA: ${activeTurma || 'LAB'}</div>
          </div>
          ${contentHTML}
          <div style="margin-top:30px; font-weight:900; font-size:1.4rem; text-transform:uppercase; border-bottom:3px solid #000; padding-bottom:10px;">STUDENT: ${activeAluno}</div>
        </div>
      </div>
    `);
    setStep('impressao_relatorio');
    window.scrollTo(0,0);
  };

  return (
    <div className="page-content w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {syncStatus && (
        <div className="fixed bottom-6 right-6 bg-[#0b2545] text-white px-5 py-3 rounded-full font-black text-xs uppercase shadow-2xl z-50 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#eebd1a]" /><span>{syncStatus}</span>
        </div>
      )}

      {step === 'turmas' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-slate-200 pb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#0b2545]">Performance Lab</h1>
            </div>
            {isStaff && (
              <div className="bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl flex items-center gap-2 text-[#0b2545] text-xxs font-black uppercase">
                <Lock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Modo Staff: Auditoria Completa</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest border-t-2 border-slate-200 pt-6">
              {isTeacher ? 'Suas Turmas Ativas' : 'Selecione o Professor'}
            </h3>

            {isTeacher ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {PERF_MASTER_DB[session.userLogado] && Object.keys(PERF_MASTER_DB[session.userLogado]).map((turma) => (
                  <button key={turma} onClick={() => handleOpenTurma(turma, session.userLogado)} className="bg-white hover:bg-[#0b2545] text-[#0b2545] hover:text-white border-2 border-slate-200 hover:border-[#0b2545] p-6 rounded-2xl font-black text-xs uppercase transition shadow-sm text-center cursor-pointer group">
                    <span className="block text-sm">{turma}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {Object.keys(PERF_MASTER_DB).map(prof => (
                    <button
                      key={prof}
                      onClick={() => setSelectedProfStaff(prof)}
                      className={`px-5 py-2.5 rounded-full text-xs font-black uppercase transition border-2 cursor-pointer ${
                        selectedProfStaff === prof ? 'bg-[#0b2545] text-[#eebd1a] border-[#0b2545]' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {prof}
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  {PERF_MASTER_DB[selectedProfStaff] && Object.keys(PERF_MASTER_DB[selectedProfStaff]).map((turma) => (
                    <button key={turma} onClick={() => handleOpenTurma(turma, selectedProfStaff)} className="bg-white hover:bg-[#0b2545] text-[#0b2545] hover:text-white border border-slate-200 hover:border-[#0b2545] p-4 rounded-xl font-black text-xs uppercase transition shadow-sm text-left cursor-pointer group">
                      <span className="font-black text-xs block">{turma}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 'alunos' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b-2 border-slate-200 pb-4">
            <button onClick={() => setStep('turmas')} className="flex items-center gap-1.5 text-xs font-black uppercase text-[#0b2545] hover:text-red-500 cursor-pointer">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <h2 className="text-xl font-black uppercase text-[#0b2545]">Turma: <span className="text-[#eebd1a]">{activeTurma}</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getAlunosDaTurma(activeTurma, activeProfOwner || session.userLogado).map((aluno) => (
              <div key={aluno} onClick={() => handleOpenEditor(aluno)} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#0b2545] shadow-sm cursor-pointer flex justify-between">
                <h4 className="font-black text-xs text-[#0b2545] uppercase">{aluno}</h4>
                <div className="w-8 h-8 rounded-full border-2 border-[#0b2545]" style={{ background: calculateStudentPie(aluno, activeTurma) }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'editor' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-slate-200 pb-4 gap-4">
            <button onClick={() => setStep('alunos')} className="flex items-center gap-1.5 text-xs font-black uppercase text-[#0b2545] hover:text-red-500 cursor-pointer">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <div className="flex flex-wrap gap-2">
              {isStaff && percentComplete === 100 && !isCrianca && (
                <>
                  <button onClick={() => gerarCertificadoOficial('impressao')} className="bg-white border-2 border-[#0b2545] text-[#0b2545] hover:bg-[#0b2545] hover:text-[#eebd1a] px-4 py-2.5 rounded-xl text-xs font-black uppercase shadow transition cursor-pointer flex items-center gap-1">
                    <Award className="w-4 h-4" /> Certificado Timbrado
                  </button>
                  <button onClick={() => gerarCertificadoOficial('digital')} className="bg-[#0b2545] text-[#eebd1a] hover:bg-black px-4 py-2.5 rounded-xl text-xs font-black uppercase shadow transition cursor-pointer flex items-center gap-1">
                    <Download className="w-4 h-4" /> Certificado Digital
                  </button>
                </>
              )}
              <button onClick={() => perfGerarPDFRelatorioSimples(activeTab)} className="bg-slate-800 text-white hover:bg-black px-4 py-2.5 rounded-xl text-xs font-black uppercase shadow transition cursor-pointer flex items-center gap-1">
                 <Download className="w-4 h-4 text-[#eebd1a]" /> Baixar Relatório
              </button>
              {isTeacher && (
                <button onClick={handleSalvarNotas} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase shadow cursor-pointer flex items-center gap-1">
                  <Save className="w-4 h-4" /> Salvar
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-4 border-b-2 border-slate-200 pb-2">
            <button onClick={() => setActiveTab('geral')} className={`font-black uppercase text-xs pb-2 border-b-4 cursor-pointer transition ${activeTab === 'geral' ? 'border-[#0b2545] text-[#0b2545]' : 'border-transparent text-slate-400 hover:text-[#0b2545]'}`}>Overall (Geral)</button>
            <button onClick={() => setActiveTab('especifico')} className={`font-black uppercase text-xs pb-2 border-b-4 cursor-pointer transition ${activeTab === 'especifico' ? 'border-[#0b2545] text-[#0b2545]' : 'border-transparent text-slate-400 hover:text-[#0b2545]'}`}>Específico</button>
          </div>

          {activeTab === 'geral' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: maxL }).map((_, lIdx) => (
                <div key={lIdx} className="bg-white border-2 border-slate-200 p-4 rounded-2xl space-y-3">
                  <h4 className="text-center font-black text-xs uppercase text-[#0b2545] border-b pb-2">Lesson {lIdx + 1}</h4>
                  {['po', 'co', 'pe', 'ce'].map((c) => (
                    <div key={c} className="flex justify-between items-center">
                      <span className="text-xxs font-bold uppercase">{c}</span>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4, 5].map((val) => (
                          <button key={val} onClick={() => setNotaCrit(lIdx, c, val)} className={`color-dot btn-${val === 0 ? 'white' : val === 1 ? 'red' : val === 2 ? 'orange' : val === 3 ? 'yellow' : val === 4 ? 'blue' : 'green'} ${Number(currentNotas[lIdx]?.[c as keyof typeof currentNotas[0]]) === val ? 'selected' : ''}`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'especifico' && (
            <div className="space-y-6">
              {Array.from({ length: maxL }).map((_, lIdx) => (
                <div key={lIdx} className="bg-white border-2 border-slate-200 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['A', 'B', 'C', 'D'].map((sub) => (
                    <div key={sub} className="bg-slate-50 p-3 rounded-xl border space-y-2">
                      <span className="text-xxs font-black uppercase bg-[#0b2545] text-[#eebd1a] px-2 py-1 rounded">Sub-lição {lIdx + 1}{sub}</span>
                      
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {['po', 'co', 'pe', 'ce'].map(sc => (
                          <div key={sc} className="flex justify-between items-center bg-white p-1 rounded border">
                            <span className="text-[10px] font-black uppercase text-slate-500">{sc}</span>
                            <div className="flex gap-[2px]">
                              {[0, 1, 2, 3, 4, 5].map((val) => (
                                <button key={val} onClick={() => setNotaSubCrit(lIdx, sub, sc, val)} className={`mini-color-dot btn-${val === 0 ? 'white' : val === 1 ? 'red' : val === 2 ? 'orange' : val === 3 ? 'yellow' : val === 4 ? 'blue' : 'green'} ${Number(currentNotas[lIdx]?.[`cor${sub}_${sc}` as keyof typeof currentNotas[0]]) === val ? 'selected' : ''}`} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <textarea value={(currentNotas[lIdx]?.[`obs${sub}` as keyof typeof currentNotas[0]] as string) || ''} onChange={(e) => setNotaObs(lIdx, sub, e.target.value)} rows={2} className="w-full text-xs p-2 rounded border" placeholder="Observações pedagógicas..." />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ÁREA DE IMPRESSÃO NATIVA - RELATÓRIO */}
      {step === 'impressao_relatorio' && (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center no-print bg-slate-100 p-4 rounded-xl">
            <button onClick={() => setStep('editor')} className="text-xs font-black uppercase text-[#0b2545] hover:text-red-500 cursor-pointer flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> VOLTAR AO EDITOR</button>
            <button onClick={() => window.print()} className="bg-[#0b2545] text-[#eebd1a] px-8 py-3 rounded-xl text-xs font-black uppercase shadow cursor-pointer">IMPRIMIR / SALVAR PDF (A4)</button>
          </div>
          <div className="print-area" dangerouslySetInnerHTML={{ __html: htmlRelatorio }} />
        </div>
      )}

      {/* ÁREA DE IMPRESSÃO NATIVA - CERTIFICADO */}
      {step === 'impressao_cert' && (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center no-print bg-slate-100 p-4 rounded-xl">
            <button onClick={() => setStep('editor')} className="text-xs font-black uppercase text-[#0b2545] hover:text-red-500 cursor-pointer flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> VOLTAR AO EDITOR</button>
            <button onClick={() => window.print()} className="bg-[#0b2545] text-[#eebd1a] px-8 py-3 rounded-xl text-xs font-black uppercase shadow cursor-pointer">IMPRIMIR / SALVAR PDF (A4)</button>
          </div>
          <div className="print-area flex flex-col gap-8">
            <div dangerouslySetInnerHTML={{ __html: htmlCertFrente }} />
            <div dangerouslySetInnerHTML={{ __html: htmlCertVerso }} />
          </div>
        </div>
      )}
    </div>
  );
}
