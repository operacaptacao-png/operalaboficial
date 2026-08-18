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
  Search, 
  ClipboardList, 
  Save, 
  Printer, 
  Award, 
  Trash2, 
  ArrowLeft, 
  Check, 
  RefreshCw, 
  Sparkles, 
  AlertCircle,
  ChevronDown,
  ChevronRight,
  UserCheck,
  Lock,
  Download,
  BookOpen,
  FileText,
  X
} from 'lucide-react';

interface DesempenhoLabProps {
  session: UserSession;
  perfData: StudentPerformanceData;
  onUpdatePerfData: (newData: StudentPerformanceData) => void;
}

export default function DesempenhoLab({
  session,
  perfData,
  onUpdatePerfData
}: DesempenhoLabProps) {
  const isTeacher = session.tipoLoginAtual === 'prof';
  const isStaff = session.tipoLoginAtual === 'staff';

  const [step, setStep] = useState<'turmas' | 'alunos' | 'editor' | 'impressao_relatorio' | 'impressao_cert'>('turmas');
  const [activeTurma, setActiveTurma] = useState<string>('');
  const [activeProfOwner, setActiveProfOwner] = useState<string>('');
  const [activeAluno, setActiveAluno] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'geral' | 'especifico'>('geral');
  const [relatorioTipo, setRelatorioTipo] = useState<'geral' | 'especifico'>('geral');
  const [periodoFiltro, setPeriodoFiltro] = useState<string>('TODAS');

  // Accordion state for teachers in turmas view
  const [expandedProfs, setExpandedProfs] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (isTeacher) {
      initial[session.userLogado] = true;
    } else {
      // First teacher open by default for staff
      const firstProf = Object.keys(PERF_MASTER_DB)[0];
      if (firstProf) initial[firstProf] = true;
    }
    return initial;
  });

  const toggleProf = (profName: string) => {
    setExpandedProfs(prev => ({ ...prev, [profName]: !prev[profName] }));
  };

  // Diário de Classe (Chamada)
  const [modalChamadaOpen, setModalChamadaOpen] = useState(false);
  const [chamadaData, setChamadaData] = useState(new Date().toISOString().split('T')[0]);
  const [chamadaLicao, setChamadaLicao] = useState('');
  const [chamadaPresencas, setChamadaPresencas] = useState<Record<string, boolean>>({});
  const [chamadaLoading, setChamadaLoading] = useState(false);

  // Sync state
  const [saving, setSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Local working copy of active student notes
  const [currentNotas, setCurrentNotas] = useState<StudentPerformanceLesson[]>([]);
  const [certTipo, setCertTipo] = useState<'impressao' | 'digital'>('digital');

  const getAlunosDaTurma = (turma: string, prof: string) => {
    if (PERF_MASTER_DB[prof] && PERF_MASTER_DB[prof][turma]) {
      return PERF_MASTER_DB[prof][turma];
    }
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
        const v = Number(lesson[k]);
        if (v >= 1 && v <= 5) {
          counts[v]++;
          validos++;
        }
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
    // Bloqueia edição pelo Staff
    if (!isTeacher) return;

    setCurrentNotas((prev) => {
      const updated = [...prev];
      if (!updated[lessonIdx]) {
        updated[lessonIdx] = { po: 0, co: 0, pe: 0, ce: 0 };
      }
      updated[lessonIdx] = { ...updated[lessonIdx], [crit]: val };
      return updated;
    });
  };

  const setNotaSubCrit = (lessonIdx: number, sub: string, crit: string, val: number) => {
    // Bloqueia edição pelo Staff
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
    // Bloqueia edição pelo Staff
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

    // Atualização otimista no estado pai
    const updatedAll = { ...perfData, [activeAluno]: currentNotas };
    onUpdatePerfData(updatedAll);

    let profToSave = isTeacher ? session.userLogado : activeProfOwner;
    if (!profToSave) profToSave = session.userLogado;

    const success = await saveStudentPerformance(activeAluno, activeTurma, profToSave, currentNotas);
    setSaving(false);

    if (success) {
      setSyncStatus('Avaliação salva com sucesso!');
    } else {
      setSyncStatus('Salvo localmente. Verifique sua conexão.');
    }
    setTimeout(() => setSyncStatus(null), 3000);
  };

  const handleDeleteAluno = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir permanentemente o registro de ${activeAluno}?`)) {
      return;
    }
    setSaving(true);
    await deleteStudentPerformance(activeAluno);
    const updated = { ...perfData };
    delete updated[activeAluno];
    onUpdatePerfData(updated);
    setSaving(false);
    setStep('alunos');
  };

  // Diário de Classe Modal
  const handleOpenChamadaModal = () => {
    const hoje = new Date().toISOString().split('T')[0];
    setChamadaData(hoje);
    setChamadaLicao('');
    const alunos = getAlunosDaTurma(activeTurma, activeProfOwner || session.userLogado);
    const initialPresencas: Record<string, boolean> = {};
    alunos.forEach((a) => {
      initialPresencas[a] = true;
    });
    setChamadaPresencas(initialPresencas);
    setModalChamadaOpen(true);
  };

  const handleEnviarChamada = async () => {
    if (!chamadaLicao) {
      alert('Por favor, selecione qual lição foi ministrada.');
      return;
    }
    setChamadaLoading(true);
    const alunos = getAlunosDaTurma(activeTurma, activeProfOwner || session.userLogado);
    const dados = alunos.map((a) => ({
      nome: a,
      status: chamadaPresencas[a] ? 'Presente' : 'Faltou'
    }));

    const prof = isTeacher ? session.userLogado : activeProfOwner || session.userLogado;
    const success = await registrarChamadaNuvem(prof, activeTurma, chamadaData, chamadaLicao, dados);
    setChamadaLoading(false);

    if (success) {
      alert('Presenças registradas com sucesso no Diário de Classe da Nuvem!');
      setModalChamadaOpen(false);
    } else {
      alert('Presenças gravadas localmente. Verifique sua conexão.');
      setModalChamadaOpen(false);
    }
  };

  // Checagem de conclusão para certificado
  const isEspanhol = activeTurma.toUpperCase().startsWith('ESP');
  const maxL = isEspanhol ? 5 : 8;
  const isCrianca = activeTurma.toUpperCase().startsWith('EXPLORES') || activeTurma.toUpperCase().startsWith('DISCO');

  let preenchidas = 0;
  for (let i = 0; i < maxL; i++) {
    const l = currentNotas[i];
    if (l && (Number(l.po) > 0 || Number(l.co) > 0 || Number(l.pe) > 0 || Number(l.ce) > 0 || (l.obsA && l.obsA.length > 0))) {
      preenchidas++;
    }
  }
  const percentComplete = Math.round((preenchidas / maxL) * 100);

  // Search filter
  const searchResults: { aluno: string; turma: string; prof: string }[] = [];
  if (searchTerm.trim().length > 1) {
    const term = normalizeString(searchTerm);
    for (const prof in PERF_MASTER_DB) {
      if (isTeacher && prof !== session.userLogado) continue;
      for (const turma in PERF_MASTER_DB[prof]) {
        for (const aluno of PERF_MASTER_DB[prof][turma]) {
          if (normalizeString(aluno).includes(term)) {
            searchResults.push({ aluno, turma, prof });
          }
        }
      }
    }
  }

  const handleSelectSearchResult = (res: { aluno: string; turma: string; prof: string }) => {
    setActiveTurma(res.turma);
    setActiveProfOwner(res.prof);
    handleOpenEditor(res.aluno);
    setSearchTerm('');
  };

  // ============================================
  // EMISSÃO DE CERTIFICADOS E RELATÓRIOS OFICIAIS
  // ============================================
  const gerarTextoCertificadoOficial = (dadosCurso: any, nomeAluno: string, tipo: string) => {
    const dataEmissao = new Date().toLocaleDateString('pt-BR');
    const traducoes: any = {
      'en': { titulo: "CERTIFICATE OF ATTENDANCE AND PROGRESS*", awarded: "Awarded to", texto: `This is to certify that the above student has successfully completed a ${dadosCurso.horas}-hour-long<br>General English Course (Standard 2 hours per week) at an (CEFR ${dadosCurso.nivel}) at OPERA<br>IDIOMAS.`, dataLabel: "Date of issue", rodape: "This certificate is valid for two years" },
      'es': { titulo: "CERTIFICADO DE ASISTENCIA Y PROGRESO*", awarded: "Otorgado a", texto: `Por la presente se certifica que el estudiante mencionado anteriormente ha completado con éxito un ${dadosCurso.curso}<br>de ${dadosCurso.horas} horas (Estándar 2 horas por semana) en un nivel (MCER ${dadosCurso.nivel}) en OPERA<br>IDIOMAS.`, dataLabel: "Fecha de emisión", rodape: "Este certificado es válido por dos años" },
      'fr': { titulo: "CERTIFICAT DE PRÉSENCE ET DE PROGRÈS*", awarded: "Décerné à", texto: `Ceci certifie que l'étudiant ci-dessus a terminé avec succès un ${dadosCurso.curso}<br>de ${dadosCurso.horas} heures (Standard 2 heures par semana) au niveau (CECRL ${dadosCurso.nivel}) à OPERA<br>IDIOMAS.`, dataLabel: "Date d'émission", rodape: "Ce certificat est valable deux ans" }
    };
    const t = traducoes[dadosCurso.idioma];

    let htmlElementosDigitais = '';
    let paddingTopo = '80px'; 
    if (tipo === 'digital') {
      paddingTopo = '120px';
      htmlElementosDigitais = `
        <img src="https://i.postimg.cc/MGGygYGg/logo_opera_png.png" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 700px; opacity: 0.05; z-index: 0; pointer-events: none;" alt="Marca d'água">
        <div style="position: absolute; top: 40px; left: 50%; transform: translateX(-50%); z-index: 20;">
          <img src="https://i.postimg.cc/dQx0d4bk/logo-do-opera-com-nome.png" style="width: 190px;" alt="Logo Opera Topo">
        </div>
      `;
    }

    return `
      ${htmlElementosDigitais}
      <div style="width: 100%; max-width: 800px; text-align: center; margin: 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding-top: ${paddingTopo}; box-sizing: border-box; position: relative; z-index: 10;">
        <div style="font-size: 1.6rem; font-weight: 900; text-transform: uppercase; color: var(--opera-blue); margin-bottom: 15px; letter-spacing: 0.05em;">${t.titulo}</div>
        <div style="font-size: 1.25rem; font-weight: 400; color: #555; margin-bottom: 8px; font-style: italic;">${t.awarded}</div>
        <div style="font-size: 2.5rem; font-weight: 900; color: #000; text-transform: uppercase; margin-bottom: 25px;">${nomeAluno}</div>
        <div style="font-size: 1.15rem; font-weight: 400; color: #333; line-height: 1.6; margin-bottom: 45px;">${t.texto}</div>
        <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 15px;">
          <img src="https://i.postimg.cc/fWcV4xpx/Assinatura-em-png.png" style="height: 110px; object-fit: contain; margin-bottom: -22px; position: relative; z-index: 10;" alt="Assinatura Adriana Borges">
          <div style="width: 320px; border-top: 1.5px solid #000; margin-bottom: 5px; position: relative; z-index: 1;"></div>
          <div style="font-size: 1.1rem; font-weight: 700; color: #000;">Adriana Silva Almeida Borges</div>
          <div style="font-size: 1rem; font-weight: 400; color: #555;">General Director</div>
        </div>
        <div style="font-size: 1.05rem; font-weight: 900; color: #000; margin-bottom: 20px;">${t.dataLabel}: ${dataEmissao}</div>
        <div style="font-size: 0.9rem; font-weight: 400; color: #666; font-style: italic;">${t.rodape}</div>
      </div>
      <div style="position: absolute; bottom: 40px; right: 40px; text-align: right; font-size: 0.85rem; font-weight: 700; color: #333; line-height: 1.4; z-index: 20;">OPERA Idiomas Ltda.<br>Rua Arnold Silva, 55 Kalilandia<br>Feira de Santana-Estado da Bahia<br>CNPJ: 48.043.598/0001</div>
    `;
  };

  const gerarHtmlDesempenhoOficial = (nome: string, turma: string) => {
    let isCurto = (turma.toUpperCase().startsWith('ESP'));
    let maxL = isCurto ? 5 : 8;
    let gridH = '';
    const dbNotasCloud = { ...perfData, [activeAluno]: currentNotas };

    for(let i=0; i<maxL; i++) {
      let l = dbNotasCloud[nome] && dbNotasCloud[nome][i] ? dbNotasCloud[nome][i] : {po:0, co:0, pe:0, ce:0}; 
      gridH += `
      <div class="cert-lesson-box">
        <div class="cert-lesson-title">Lesson ${i+1}</div>
        <div style="display: flex; flex-direction: column;">
          ${['po','co','pe','ce'].map(k => {
            let v = Number(l[k as keyof typeof l]) || 0;
            let color = v==1?'var(--grade-red)':v==2?'var(--grade-orange)':v==3?'var(--grade-yellow)':v==4?'var(--grade-blue)':'var(--grade-green)';
            return `<div class="cert-criterio-row"><div class="cert-c-label">${k=='po'?'P. ORAL':k=='co'?'C. ORAL':k=='pe'?'P. ESCR':k=='ce'?'C. ESCR':''}</div><div class="cert-c-box" style="background-color:${v==0?'#fff':color}; border-left: 1px solid #000;"></div></div>`;
          }).join('')}
        </div>
      </div>`;
    }

    return `
      <img src="https://i.postimg.cc/MGGygYGg/logo-opera-png.png" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 700px; opacity: 0.05; z-index: 0; pointer-events: none;" alt="Marca d'água">
      <div style="position: relative; z-index: 10; border: 2px solid #000; padding: 30px; height: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid var(--opera-blue); padding-bottom: 10px; margin-bottom: 30px; font-weight: 900; text-transform: uppercase; font-size: 1.3rem;">
          <img src="https://i.postimg.cc/MGGygYGg/logo-opera-png.png" style="height: 40px;" alt="Logo Opera">
          <div style="text-align: right;"><div style="color: var(--opera-blue);">RELATÓRIO DE DESEMPENHO</div><div style="font-size: 1rem; color: #555;">TURMA: ${turma}</div></div>
        </div>
        <div style="display: flex; gap: 40px;">
          <div class="cert-grade-lessons" style="flex: 2.5;">${gridH}</div>
          <div style="flex: 1; padding-left: 25px; border-left: 1px solid #eee;">
            <div style="font-weight: 900; text-transform: uppercase; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 5px;">Assessment Index</div>
            <div style="font-size: 10px; font-weight: 900; margin-bottom: 5px;">🟢 Supera o esperado</div>
            <div style="font-size: 10px; font-weight: 900; margin-bottom: 5px;">🔵 Atende ao esperado</div>
            <div style="font-size: 10px; font-weight: 900; margin-bottom: 5px;">🟡 Em desenvolvimento</div>
            <div style="font-size: 10px; font-weight: 900; margin-bottom: 5px;">🟠 Nível básico</div>
            <div style="font-size: 10px; font-weight: 900; margin-bottom: 5px;">🔴 Não alcançado</div>
          </div>
        </div>
        <div style="margin-top:30px; font-weight:900; font-size:1.4rem; text-transform:uppercase; border-bottom:3px solid #000; padding-bottom:10px;">STUDENT: ${nome}</div>
      </div>
    `;
  };

  const gerarCertificadoOficial = (tipo: 'impressao' | 'digital') => {
    let dadosCurso = mapearTurmaParaCertificado(activeTurma);
    if (!dadosCurso) {
      alert("Erro: Não foi possível identificar as regras do certificado para o código de turma " + activeTurma);
      return;
    }
    const areaCert = document.getElementById('area-impressao-certificado');
    const pCert = document.getElementById('pagina-certificado');
    const pDesemp = document.getElementById('pagina-desempenho');
    if (!areaCert || !pCert || !pDesemp) {
      alert("Erro: Elementos do certificado não encontrados no sistema.");
      return;
    }

    pCert.innerHTML = gerarTextoCertificadoOficial(dadosCurso, activeAluno, tipo);
    pDesemp.innerHTML = gerarHtmlDesempenhoOficial(activeAluno, activeTurma);

    const safeNome = (activeAluno || 'Aluno').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeTurma = (activeTurma || 'Turma').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const tagTipo = tipo === 'digital' ? 'Digital' : 'Oficial';
    const filename = `Certificado_${tagTipo}_${safeNome}_${safeTurma}.pdf`;

    // Tornar o container visível para renderização do html2canvas
    areaCert.style.display = 'block';
    setSyncStatus('Gerando Certificado PDF A4 (Frente e Verso)...');

    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        letterRendering: true,
        scrollY: 0,
        scrollX: 0,
        logging: false
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'landscape'
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.folha-desempenho'
      }
    };

    // @ts-ignore
    const html2pdfLib = (window as any).html2pdf;
    if (typeof html2pdfLib === 'function') {
      html2pdfLib()
        .set(opt)
        .from(areaCert)
        .save()
        .then(() => {
          areaCert.style.display = 'none';
          setSyncStatus('Certificado em PDF baixado com sucesso!');
          setTimeout(() => setSyncStatus(null), 3500);
        })
        .catch((err: any) => {
          console.error('Erro ao gerar certificado PDF:', err);
          areaCert.style.display = 'none';
          setSyncStatus('Erro ao compilar o PDF.');
          setTimeout(() => setSyncStatus(null), 3000);
        });
    } else {
      areaCert.style.display = 'none';
      alert('A biblioteca html2pdf.js não foi carregada. Verifique a conexão.');
      setSyncStatus(null);
    }
  };

  const baixarPDFRelatorio = (tipoPDF: 'geral' | 'especifico' = relatorioTipo) => {
    const areaRelatorio = document.getElementById('perf-relatorio-gerado');
    if (!areaRelatorio) {
      alert("Elemento do relatório não encontrado para exportação.");
      return;
    }

    const safeNome = (activeAluno || 'Aluno').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeTurma = (activeTurma || 'Turma').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Relatorio_${tipoPDF === 'especifico' ? 'Especifico' : 'Geral'}_${safeNome}_${safeTurma}.pdf`;

    setSyncStatus('Exportando Relatório de Desempenho em PDF (A4)...');

    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        letterRendering: true,
        scrollY: 0,
        scrollX: 0,
        logging: false
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'landscape'
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy']
      }
    };

    // @ts-ignore
    const html2pdfLib = (window as any).html2pdf;
    if (typeof html2pdfLib === 'function') {
      html2pdfLib()
        .set(opt)
        .from(areaRelatorio)
        .save()
        .then(() => {
          setSyncStatus('Relatório baixado com sucesso!');
          setTimeout(() => setSyncStatus(null), 3500);
        })
        .catch((err: any) => {
          console.error('Erro ao gerar relatório PDF:', err);
          setSyncStatus('Erro ao compilar o relatório PDF.');
          setTimeout(() => setSyncStatus(null), 3000);
        });
    } else {
      alert('A biblioteca html2pdf.js não foi carregada.');
      setSyncStatus(null);
    }
  };

  const perfGerarPDFRelatorioSimples = (tipoPDF: 'geral' | 'especifico') => {
    const nomeEditado = activeAluno;
    let maxL = (activeTurma.toUpperCase().startsWith('ESP')) ? 5 : 8;
    let profRelatorio = isStaff ? activeProfOwner : session.userLogado;
    const dbNotasCloud = { ...perfData, [activeAluno]: currentNotas };
    setRelatorioTipo(tipoPDF);

    let contentHTML = '';
    if(tipoPDF === 'geral') {
      let gridH = '';
      if (dbNotasCloud && dbNotasCloud[activeAluno]) {
        for(let i=0; i<maxL; i++) {
          let l = dbNotasCloud[activeAluno][i] || {};
          gridH += `
          <div class="lesson-box">
            <div class="lesson-title">Lesson ${i+1}</div>
            <div class="grid-blocks">
              ${['po','co','pe','ce'].map(k => {
                let v = Number(l[k as keyof typeof l]) || 0;
                let color = v==0?'#ffffff':v==1?'var(--grade-red)':v==2?'var(--grade-orange)':v==3?'var(--grade-yellow)':v==4?'var(--grade-blue)':'var(--grade-green)';
                return `
                <div class="criterio-row">
                  <div class="c-label">${k=='po'?'P. ORAL':k=='co'?'C. ORAL':k=='pe'?'P. ESCR':k=='ce'?'C. ESCR':''}</div>
                  <div class="c-box" style="background-color:${color}; border-left: 1px solid #000;"></div>
                </div>`;
              }).join('')}
            </div>
          </div>`;
        }
      } else { gridH = "<p style='grid-column: 1 / -1; text-align: center; font-weight: bold;'>Notas não encontradas.</p>"; }

      contentHTML = `
      <div class="flex flex-col md:flex-row gap-8">
        <div class="grade-lessons">${gridH}</div>
        <div class="grade-sidebar">
          <div class="font-black text-xs border-b-2 border-black mb-6 uppercase tracking-widest">Assessment Index</div>
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3 font-black text-[10px]"><div class="w-4 h-4 rounded-full btn-green"></div> VERDE: Supera o esperado.</div>
            <div class="flex items-center gap-3 font-black text-[10px]"><div class="w-4 h-4 rounded-full btn-blue"></div> AZUL: Atende ao esperado.</div>
            <div class="flex items-center gap-3 font-black text-[10px]"><div class="w-4 h-4 rounded-full btn-yellow"></div> AMARELO: Em desenvolvimento.</div>
            <div class="flex items-center gap-3 font-black text-[10px]"><div class="w-4 h-4 rounded-full btn-orange"></div> LARANJA: Nível básico.</div>
            <div class="flex items-center gap-3 font-black text-[10px]"><div class="w-4 h-4 rounded-full btn-red"></div> VERMELHO: Não alcançado.</div>
            <div class="flex items-center gap-3 font-black text-[10px]"><div class="w-4 h-4 rounded-full btn-white" style="border:1px solid #ccc;"></div> BRANCO: Não Avaliado.</div>
          </div>
          <div class="mt-14 text-center">
            <div class="font-black text-[11px] uppercase mb-4 border-b border-black pb-2">Overall Performance</div>
            <div class="pie-chart" style="background: ${calculateStudentPie(activeAluno, activeTurma)}"></div>
          </div>
        </div>
      </div>`;
    } else {
      let obsBlocks = '';
      if (dbNotasCloud && dbNotasCloud[activeAluno]) {
        for(let i=0; i<maxL; i++) {
          let l = dbNotasCloud[activeAluno][i] || {};
          obsBlocks += `
          <div class="border border-black p-3 rounded" style="page-break-inside: avoid; margin-bottom: 12px;">
            <div class="font-black uppercase text-[12px] mb-2 border-b border-slate-300 pb-1">Lesson ${i+1}</div>
            <div class="grid grid-cols-2 gap-3">
              ${['A','B','C','D'].map(sub => {
                let htmlDots = '<div class="flex gap-3 mb-2">';
                [{id:'po', l:'PO'}, {id:'co', l:'CO'}, {id:'pe', l:'PE'}, {id:'ce', l:'CE'}].forEach(sc => {
                  let v = Number(l[('cor'+sub+'_'+sc.id) as keyof typeof l]) || 0;
                  let color = v==0?'#ffffff':v==1?'var(--grade-red)':v==2?'var(--grade-orange)':v==3?'var(--grade-yellow)':v==4?'var(--grade-blue)':'var(--grade-green)';
                  htmlDots += `<div class="flex items-center gap-1"><span class="text-[8px] font-black text-slate-500">${sc.l}</span><div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${color}; border: 1px solid ${v==0?'#ccc':'transparent'}; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;"></div></div>`;
                });
                htmlDots += '</div>';
                let obsText = (String(l[('obs'+sub) as keyof typeof l] || '')).trim();
                return `
                <div class="bg-slate-50 p-2 rounded border border-slate-200 flex flex-col">
                  <div class="font-black text-[10px] text-[var(--opera-blue)] uppercase mb-1">Sub-lição ${i+1}${sub}</div>
                  ${htmlDots}
                  <div class="text-[10px] text-slate-700 leading-tight flex-1">${obsText || '<span class="text-slate-400 italic">Nenhuma observação registrada.</span>'}</div>
                </div>`;
              }).join('')}
            </div>
          </div>`;
        }
      }
      contentHTML = `<div class="w-full"><div class="font-black text-lg uppercase mb-4 text-center border-y-2 border-black py-2">Relatório de Desenvolvimento Específico</div><div class="flex flex-col">${obsBlocks}</div></div>`;
    }

    const relatorioContainer = document.getElementById('perf-relatorio-gerado');
    if (relatorioContainer) {
      relatorioContainer.innerHTML = `
        <div class="desempenho-container" style="max-width: 100% !important; padding: 30px !important;">
          <img src="https://i.postimg.cc/MGGygYGg/logo_opera_png.png" class="watermark">
          <div class="header-desempenho mb-6"><div>PROFESSOR: ${profRelatorio}</div><div>TURMA: ${activeTurma || 'LAB'}</div></div>
          ${contentHTML}
          <div style="margin-top:30px; font-weight:900; font-size:1.4rem; text-transform:uppercase; border-bottom:3px solid #000; padding-bottom:10px;">STUDENT: ${nomeEditado}</div>
        </div>`;
    }

    setStep('impressao_relatorio');
    window.scrollTo(0,0);

    // Inicia download direto com html2pdf
    setTimeout(() => {
      baixarPDFRelatorio(tipoPDF);
    }, 400);
  };

  return (
    <div className="page-content w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      
      {/* Top Notification Toast */}
      {syncStatus && (
        <div className="fixed bottom-6 right-6 bg-[#0b2545] text-white px-5 py-3 rounded-full font-black text-xs uppercase shadow-2xl z-50 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#eebd1a]" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* STEP 1: TURMAS SEPARADAS POR PROFESSOR */}
      {step === 'turmas' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-slate-200 pb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#0b2545]">
                Performance Lab
              </h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Acompanhamento e Registro de Desempenho Pedagógico
              </p>
            </div>
            {isTeacher && (
              <div className="bg-amber-50 border border-amber-300 px-4 py-2.5 rounded-xl flex items-center gap-2 text-amber-900 text-xxs font-black uppercase">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Mantenha a aba de desempenho sempre atualizada</span>
              </div>
            )}
            {isStaff && (
              <div className="bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl flex items-center gap-2 text-[#0b2545] text-xxs font-black uppercase">
                <Lock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>Modo Staff: Auditoria de Turmas, Relatórios e Emissão de Certificados (100%)</span>
              </div>
            )}
          </div>

          {/* Search Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Search className="w-4 h-4 text-[#eebd1a]" />
              <span>Pesquisa Rápida de Aluno</span>
            </h3>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome do aluno para buscar em todas as turmas..."
                className="w-full p-4 pl-12 border-2 border-slate-200 rounded-xl font-bold uppercase text-[#0b2545] outline-none focus:border-[#0b2545] transition"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
            </div>

            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {searchResults.map((res, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSearchResult(res)}
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer flex justify-between items-center transition"
                  >
                    <div>
                      <h4 className="font-black text-xs text-[#0b2545] uppercase">{res.aluno}</h4>
                      <span className="text-xxs font-bold text-slate-400 uppercase">
                        Turma: {res.turma} • Prof: {res.prof}
                      </span>
                    </div>
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-[#0b2545] flex-shrink-0"
                      style={{ background: calculateStudentPie(res.aluno, res.turma) }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Turmas Separadas por Cada Professor (Accordion/Cards Reveláveis) */}
          <div className="space-y-4">
            <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest border-t-2 border-slate-200 pt-6">
              {isTeacher ? 'Suas Turmas Ativas' : 'Turmas por Professor (Clique no docente para expandir)'}
            </h3>

            {isTeacher ? (
              // Modo Professor: Exibe diretamente as turmas atribuídas
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {PERF_MASTER_DB[session.userLogado] && Object.keys(PERF_MASTER_DB[session.userLogado]).map((turma) => (
                  <button
                    key={turma}
                    onClick={() => handleOpenTurma(turma, session.userLogado)}
                    className="bg-white hover:bg-[#0b2545] text-[#0b2545] hover:text-white border-2 border-slate-200 hover:border-[#0b2545] p-6 rounded-2xl font-black text-xs uppercase transition shadow-sm hover:shadow-lg text-center cursor-pointer group"
                  >
                    <span className="block text-sm">{turma}</span>
                    <span className="text-xxs text-slate-400 group-hover:text-[#eebd1a] mt-1 block">
                      {PERF_MASTER_DB[session.userLogado][turma].length} alunos
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              // Modo Staff: Seções agrupadas e separadas por cada professor que se revelam ao clicar
              <div className="space-y-4">
                {Object.keys(PERF_MASTER_DB).map((profName) => {
                  const turmasMap = PERF_MASTER_DB[profName];
                  const turmasKeys = Object.keys(turmasMap);
                  const isExpanded = !!expandedProfs[profName];
                  const totalAlunosProf = turmasKeys.reduce((acc, t) => acc + turmasMap[t].length, 0);

                  return (
                    <div 
                      key={profName} 
                      className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm transition hover:border-[#0b2545]"
                    >
                      {/* Header do Professor */}
                      <div
                        onClick={() => toggleProf(profName)}
                        className="bg-slate-50 hover:bg-slate-100/80 p-5 flex items-center justify-between cursor-pointer select-none transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#0b2545] text-[#eebd1a] flex items-center justify-center font-black text-sm">
                            {profName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-black text-base uppercase text-[#0b2545] flex items-center gap-2">
                              <span>Professor(a) {profName}</span>
                            </h4>
                            <span className="text-xxs font-bold text-slate-400 uppercase">
                              {turmasKeys.length} turmas • {totalAlunosProf} alunos matriculados
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xxs font-black text-[#0b2545] bg-[#eebd1a]/30 px-3 py-1 rounded-full uppercase">
                            {isExpanded ? 'Ocultar Turmas' : 'Revelar Turmas'}
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Turmas Reveladas */}
                      {isExpanded && (
                        <div className="p-5 bg-white border-t border-slate-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {turmasKeys.map((turma) => (
                              <button
                                key={turma}
                                onClick={() => handleOpenTurma(turma, profName)}
                                className="bg-slate-50 hover:bg-[#0b2545] text-[#0b2545] hover:text-white border border-slate-200 hover:border-[#0b2545] p-4 rounded-xl font-black text-xs uppercase transition shadow-sm text-left cursor-pointer group flex flex-col justify-between"
                              >
                                <span className="font-black text-xs block">{turma}</span>
                                <span className="text-xxs text-slate-400 group-hover:text-[#eebd1a] mt-2 block font-bold">
                                  {turmasMap[turma].length} alunos matriculados
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: LISTA DE ALUNOS DA TURMA */}
      {step === 'alunos' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-2 border-slate-200 pb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setStep('turmas')}
                className="flex items-center gap-1.5 text-xs font-black uppercase text-[#0b2545] hover:text-red-500 border-b-2 border-[#0b2545] pb-0.5 cursor-pointer transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para Turmas</span>
              </button>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-[#0b2545]">
                Turma: <span className="text-[#eebd1a]">{activeTurma}</span>
              </h2>
            </div>

            <span className="text-xs font-bold text-slate-400 uppercase">
              Docente: <strong>{activeProfOwner || session.userLogado}</strong>
            </span>
          </div>

          {/* Diário de Classe Button (Apenas Professor) */}
          {isTeacher && (
            <button
              onClick={handleOpenChamadaModal}
              className="w-full bg-[#eebd1a] hover:bg-yellow-400 text-[#0b2545] border-2 border-[#0b2545] font-black py-4 px-6 rounded-2xl uppercase shadow-lg tracking-wider flex items-center justify-center gap-3 transition hover:scale-[1.01] cursor-pointer"
            >
              <ClipboardList className="w-6 h-6" />
              <span className="text-sm">Realizar Chamada / Diário de Classe</span>
            </button>
          )}

          {isStaff && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#0b2545]" />
              <span>Clique no aluno para visualizar o desempenho, baixar relatórios de feedback ou emitir certificado (quando 100%).</span>
            </div>
          )}

          {/* Alunos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getAlunosDaTurma(activeTurma, activeProfOwner || session.userLogado).map((aluno) => {
              const pie = calculateStudentPie(aluno, activeTurma);
              const notas = perfData[aluno] || [];
              let preench = 0;
              for (let i = 0; i < maxL; i++) {
                const l = notas[i];
                if (l && (Number(l.po) > 0 || Number(l.co) > 0 || Number(l.pe) > 0 || Number(l.ce) > 0 || (l.obsA && l.obsA.length > 0))) {
                  preench++;
                }
              }
              const pPerc = Math.round((preench / maxL) * 100);

              return (
                <div
                  key={aluno}
                  onClick={() => handleOpenEditor(aluno)}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#0b2545] shadow-sm hover:shadow-md transition flex items-center justify-between cursor-pointer group"
                >
                  <div className="pr-3">
                    <h4 className="font-black text-xs text-[#0b2545] uppercase group-hover:text-[#e2001a] transition">
                      {aluno}
                    </h4>
                    <span className="text-xxs font-bold text-slate-400 uppercase mt-1 block">
                      {pPerc === 100 ? (
                        <span className="text-emerald-600 font-black">✓ 100% Concluído</span>
                      ) : (
                        <span>Progresso: {pPerc}% ({preench}/{maxL} lições)</span>
                      )}
                    </span>
                  </div>
                  <div 
                    className="w-9 h-9 rounded-full border-2 border-[#0b2545] flex-shrink-0"
                    style={{ background: pie }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: EDITOR DE NOTAS & CRITÉRIOS (PROFESSOR EDITA, STAFF AUDITA/CERTIFICA/RELATORIOS) */}
      {step === 'editor' && (
        <div className="space-y-6">
          {/* Header do Editor */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-2 border-slate-200 pb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setStep('alunos')}
                className="flex items-center gap-1.5 text-xs font-black uppercase text-[#0b2545] hover:text-red-500 border-b-2 border-[#0b2545] pb-0.5 cursor-pointer transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <div>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-[#0b2545]">
                  {activeAluno}
                </h2>
                <span className="text-xxs font-bold text-slate-400 uppercase">
                  Turma: {activeTurma} • Status: {percentComplete}% Preenchido
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Botões de Certificado quando 100% Concluído */}
              {isStaff && percentComplete === 100 && !isCrianca && (
                <>
                  <button
                    onClick={() => gerarCertificadoOficial('impressao')}
                    className="bg-[#0b2545] text-[#eebd1a] hover:bg-black px-4 py-2.5 rounded-xl font-black text-xxs uppercase shadow transition cursor-pointer flex items-center gap-1.5"
                    title="Exportar Certificado em PDF A4 para papel timbrado"
                  >
                    <Award className="w-3.5 h-3.5 inline" />
                    <span>Certificado Timbrado (PDF)</span>
                  </button>
                  <button
                    onClick={() => gerarCertificadoOficial('digital')}
                    className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2.5 rounded-xl font-black text-xxs uppercase shadow transition cursor-pointer flex items-center gap-1.5"
                    title="Exportar Certificado Digital completo em PDF A4"
                  >
                    <Download className="w-3.5 h-3.5 inline" />
                    <span>Certificado Digital (PDF)</span>
                  </button>
                </>
              )}

              {/* Botão de Relatório / Feedback PDF */}
              <button
                onClick={() => perfGerarPDFRelatorioSimples(activeTab === 'especifico' ? 'especifico' : 'geral')}
                className="bg-slate-800 hover:bg-black text-white px-4 py-2.5 rounded-xl font-black text-xxs uppercase shadow transition flex items-center gap-1.5 cursor-pointer"
                title="Exportar Relatório Pedagógico em PDF A4"
              >
                <Download className="w-3.5 h-3.5 text-[#eebd1a]" />
                <span>Baixar PDF Relatório ({activeTab === 'especifico' ? 'Específico' : 'Geral'})</span>
              </button>

              {/* Botão de Salvar (Exclusivo Docente) */}
              {isTeacher && (
                <button
                  onClick={handleSalvarNotas}
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase shadow-md flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Salvando...' : 'Salvar Avaliação'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Aviso de Modo Staff (Somente Leitura) */}
          {isStaff && (
            <div className="bg-amber-50 border-l-4 border-[#0b2545] p-4 rounded-r-xl shadow-sm text-xs font-bold text-[#0b2545] flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#0b2545] flex-shrink-0" />
              <div>
                <strong className="uppercase">Modo de Auditoria do Staff:</strong> As notas e observações são de preenchimento exclusivo do docente. O staff pode auditar, gerar relatórios de feedback em PDF e emitir o certificado oficial (ao atingir 100%).
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 border-b-2 border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('geral')}
              className={`font-black uppercase text-xs pb-2 border-b-4 transition cursor-pointer ${
                activeTab === 'geral' ? 'border-[#0b2545] text-[#0b2545]' : 'border-transparent text-slate-400 hover:text-[#0b2545]'
              }`}
            >
              Overall Performance (Geral)
            </button>
            <button
              onClick={() => setActiveTab('especifico')}
              className={`font-black uppercase text-xs pb-2 border-b-4 transition cursor-pointer ${
                activeTab === 'especifico' ? 'border-[#0b2545] text-[#0b2545]' : 'border-transparent text-slate-400 hover:text-[#0b2545]'
              }`}
            >
              Relatório Específico (Sub-lições A-D)
            </button>
          </div>

          {/* TAB 1: GERAL (PO, CO, PE, CE) */}
          {activeTab === 'geral' && (
            <div className="space-y-6">
              {/* Legenda de Cores */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xxs font-black uppercase">
                <span className="text-slate-500">Legenda de Avaliação por Cores:</span>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5 text-slate-700"><span className="w-3 h-3 rounded-full bg-white border-2 border-slate-300"></span> Limpar</span>
                  <span className="flex items-center gap-1.5 text-red-700"><span className="w-3 h-3 rounded-full bg-red-500"></span> Em Desenvolvimento</span>
                  <span className="flex items-center gap-1.5 text-orange-700"><span className="w-3 h-3 rounded-full bg-orange-500"></span> Básico</span>
                  <span className="flex items-center gap-1.5 text-yellow-700"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> Adequado</span>
                  <span className="flex items-center gap-1.5 text-blue-700"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Bom</span>
                  <span className="flex items-center gap-1.5 text-emerald-700"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Excelente</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: maxL }).map((_, lIdx) => {
                  const lessonData = currentNotas[lIdx] || {};
                  const crits = [
                    { id: 'po', label: 'Prod. Oral' },
                    { id: 'co', label: 'Comp. Oral' },
                    { id: 'pe', label: 'Prod. Escrita' },
                    { id: 'ce', label: 'Comp. Escrita' }
                  ];

                  return (
                    <div key={lIdx} className="bg-white border-2 border-slate-200 p-4 rounded-2xl shadow-sm space-y-3">
                      <h4 className="text-center font-black text-xs uppercase text-[#0b2545] border-b border-slate-100 pb-2">
                        Lesson {lIdx + 1}
                      </h4>
                      <div className="space-y-2">
                        {crits.map((c) => {
                          const currentVal = Number(lessonData[c.id]) || 0;
                          return (
                            <div key={c.id} className="flex justify-between items-center">
                              <span className="text-xxs font-bold uppercase text-slate-500">{c.label}</span>
                              <div className={`flex gap-1 ${isStaff ? 'pointer-events-none opacity-90' : ''}`}>
                                {[0, 1, 2, 3, 4, 5].map((val) => (
                                  <button
                                    key={val}
                                    type="button"
                                    disabled={!isTeacher}
                                    onClick={() => setNotaCrit(lIdx, c.id, val)}
                                    className={`color-dot btn-${
                                      val === 0 ? 'white' : val === 1 ? 'red' : val === 2 ? 'orange' : val === 3 ? 'yellow' : val === 4 ? 'blue' : 'green'
                                    } ${currentVal === val ? 'selected' : ''}`}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => perfGerarPDFRelatorioSimples('geral')}
                  className="bg-[#0b2545] hover:bg-black text-[#eebd1a] px-8 py-4 rounded-xl font-black text-xs uppercase shadow-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#eebd1a]" />
                  <span>GERAR E BAIXAR RELATÓRIO GERAL (PDF A4)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ESPECÍFICO (Sub-lições A, B, C, D) */}
          {activeTab === 'especifico' && (
            <div className="space-y-6">
              {Array.from({ length: maxL }).map((_, lIdx) => {
                const lessonData = currentNotas[lIdx] || {};
                const subCrits = [
                  { id: 'po', label: 'PO' },
                  { id: 'co', label: 'CO' },
                  { id: 'pe', label: 'PE' },
                  { id: 'ce', label: 'CE' }
                ];

                return (
                  <div key={lIdx} className="bg-white border-2 border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                    <h4 className="font-black text-sm uppercase text-[#0b2545] border-b border-slate-100 pb-2">
                      Lesson {lIdx + 1}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['A', 'B', 'C', 'D'].map((sub) => {
                        const obsText = (lessonData[`obs${sub}`] as string) || '';
                        return (
                          <div key={sub} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                            <span className="text-xxs font-black uppercase text-[#eebd1a] bg-[#0b2545] px-2.5 py-1 rounded-md inline-block">
                              Sub-lição {lIdx + 1}{sub}
                            </span>

                            <div className="grid grid-cols-2 gap-2">
                              {subCrits.map((sc) => {
                                const currentVal = Number(lessonData[`cor${sub}_${sc.id}`]) || 0;
                                return (
                                  <div key={sc.id} className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-200">
                                    <span className="text-xxs font-black text-slate-500">{sc.label}</span>
                                    <div className={`flex gap-0.5 ${isStaff ? 'pointer-events-none opacity-90' : ''}`}>
                                      {[0, 1, 2, 3, 4, 5].map((val) => (
                                        <button
                                          key={val}
                                          type="button"
                                          disabled={!isTeacher}
                                          onClick={() => setNotaSubCrit(lIdx, sub, sc.id, val)}
                                          className={`mini-color-dot btn-${
                                            val === 0 ? 'white' : val === 1 ? 'red' : val === 2 ? 'orange' : val === 3 ? 'yellow' : val === 4 ? 'blue' : 'green'
                                          } ${currentVal === val ? 'selected' : ''}`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <textarea
                              value={obsText}
                              disabled={!isTeacher}
                              onChange={(e) => setNotaObs(lIdx, sub, e.target.value)}
                              rows={2}
                              placeholder={isTeacher ? "Observações pedagógicas para a sub-lição..." : "Nenhuma observação registrada pelo docente."}
                              className={`w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 rounded-lg outline-none transition resize-none ${
                                isStaff ? 'bg-slate-100 text-slate-600 cursor-default' : 'focus:border-[#0b2545]'
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => perfGerarPDFRelatorioSimples('especifico')}
                  className="bg-[#0b2545] hover:bg-black text-[#eebd1a] px-8 py-4 rounded-xl font-black text-xs uppercase shadow-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#eebd1a]" />
                  <span>GERAR E BAIXAR RELATÓRIO ESPECÍFICO (PDF A4)</span>
                </button>
              </div>
            </div>
          )}

          {/* Danger Zone (Staff Master) */}
          {isStaff && (
            <div className="border-2 border-dashed border-red-200 bg-red-50 p-6 rounded-2xl text-center space-y-2 mt-8">
              <h4 className="text-xs font-black uppercase text-red-600">Zona Administrativa do Staff</h4>
              <button
                onClick={handleDeleteAluno}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase shadow transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Excluir Registro do Aluno Permanentemente
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: ÁREA DE IMPRESSÃO DE RELATÓRIO OFICIAL */}
      {step === 'impressao_relatorio' && (
        <div id="perf-area-impressao" className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div id="btn-dinamico-voltar-pdf">
              <button
                onClick={() => setStep('editor')}
                className="text-xs font-black uppercase tracking-widest text-[#0b2545] hover:text-red-500 flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> VOLTAR AO EDITOR
              </button>
            </div>
            <button
              onClick={() => baixarPDFRelatorio(relatorioTipo)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl transition flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" /> BAIXAR RELATÓRIO EM PDF (A4)
            </button>
          </div>
          <div id="perf-relatorio-gerado"></div>
        </div>
      )}



      {/* MODAL DIÁRIO DE CLASSE (CHAMADA) */}
      {modalChamadaOpen && (
        <div className="fixed inset-0 bg-[#0b2545]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border-4 border-[#eebd1a] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-[#0b2545] uppercase flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#eebd1a]" />
                <span>Diário de Classe</span>
              </h3>
              <button onClick={() => setModalChamadaOpen(false)} className="text-slate-400 hover:text-red-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="text-xxs font-bold text-slate-500 uppercase block mb-1">Data da Aula</label>
                <input
                  type="date"
                  value={chamadaData}
                  onChange={(e) => setChamadaData(e.target.value)}
                  className="w-full font-bold text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="text-xxs font-bold text-slate-500 uppercase block mb-1">Lição Ministrada</label>
                <select
                  value={chamadaLicao}
                  onChange={(e) => setChamadaLicao(e.target.value)}
                  className="w-full font-bold text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none cursor-pointer"
                >
                  <option value="">Selecione...</option>
                  {Array.from({ length: maxL }).flatMap((_, i) =>
                    ['A', 'B', 'C', 'D'].map((sub) => (
                      <option key={`${i + 1}${sub}`} value={`Lesson ${i + 1}${sub}`}>
                        Lesson {i + 1}{sub}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xxs font-black text-red-500 uppercase">
                Alterne para vermelho quem faltou hoje:
              </p>
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {getAlunosDaTurma(activeTurma, activeProfOwner || session.userLogado).map((aluno) => {
                  const isPresente = chamadaPresencas[aluno] !== false;
                  return (
                    <div
                      key={aluno}
                      className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200"
                    >
                      <span className="font-black text-xs text-[#0b2545] uppercase truncate max-w-[200px]">
                        {aluno}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setChamadaPresencas((prev) => ({ ...prev, [aluno]: !isPresente }))
                        }
                        className={`px-3 py-1.5 rounded-lg text-xxs font-black uppercase transition cursor-pointer ${
                          isPresente ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {isPresente ? 'Presente' : 'Faltou'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleEnviarChamada}
              disabled={chamadaLoading}
              className="w-full bg-[#0b2545] hover:bg-black text-[#eebd1a] font-black py-4 rounded-xl text-xs uppercase shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {chamadaLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{chamadaLoading ? 'Gravando Presenças...' : 'Salvar Diário na Nuvem'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
