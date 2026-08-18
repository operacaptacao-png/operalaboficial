/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserRole, UserSession } from '../types';
import { PERF_MASTER_DB } from '../data/database';
import { normalizeString } from '../services/api';
import { 
  User, 
  GraduationCap, 
  ShieldCheck, 
  LogIn, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  KeyRound
} from 'lucide-react';

interface LoginScreenProps {
  onLogin: (session: UserSession) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('aluno');

  // Aluno State
  const [studentName, setStudentName] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [studentError, setStudentError] = useState('');

  // Prof State
  const [selectedTeacher, setSelectedTeacher] = useState<string>('BRENDA');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);
  const [teacherError, setTeacherError] = useState('');

  // Staff Members DB
  const staffMembersList = [
    { id: 'REVSON', name: 'Revson', cargo: 'Setor de Comunicação', pass: 'REVSONOPERA2026' },
    { id: 'LETICIA', name: 'Leticia', cargo: 'Recepção', pass: 'LETICIAOPERA2026' },
    { id: 'KATIANE', name: 'Katiane', cargo: 'Recepção', pass: 'KATIANEOPERA2026' },
    { id: 'GEOVANA', name: 'Geovana', cargo: 'Recepção', pass: 'GEOVANAOPERA2026' },
    { id: 'ADRIANA', name: 'Adriana', cargo: 'Direção', pass: 'ADRIANAOPERA2026' },
    { id: 'JUNIOR', name: 'Junior', cargo: 'Gerência', pass: 'JUNIOROPERA2026' },
    { id: 'KARINE', name: 'Karine', cargo: 'Coordenação Pedagógica', pass: 'KARINEOPERA2026' }
  ];

  // Staff State
  const [selectedStaff, setSelectedStaff] = useState<string>('REVSON');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [staffError, setStaffError] = useState('');

  // Build full students database lookup
  const studentMap: { aluno: string; turma: string; prof: string }[] = [];
  for (const prof in PERF_MASTER_DB) {
    for (const turma in PERF_MASTER_DB[prof]) {
      for (const aluno of PERF_MASTER_DB[prof][turma]) {
        studentMap.push({ aluno, turma, prof });
      }
    }
  }

  // Normalização de senha (remove traços, pontos e espaços para flexibilidade)
  const cleanCode = (code: string) => code.toUpperCase().replace(/[^A-Z0-9]/g, '');

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');

    const typedName = studentName.trim();
    const typedPass = cleanCode(studentPassword.trim());

    if (!typedName) {
      setStudentError('Por favor, informe o seu nome completo.');
      return;
    }

    if (!typedPass) {
      setStudentError('Por favor, digite a sua senha (código da turma recebido).');
      return;
    }

    const normalizedTypedName = normalizeString(typedName);

    // Procura o aluno pelo nome (exato ou parcial)
    const matches = studentMap.filter(s => normalizeString(s.aluno).includes(normalizedTypedName));

    if (matches.length === 0) {
      setStudentError('Aluno não encontrado no sistema. Verifique a digitação do nome ou contate a secretaria.');
      return;
    }

    // Verifica se algum dos alunos correspondentes possui o código de turma correspondente à senha
    const validStudent = matches.find(s => cleanCode(s.turma) === typedPass);

    if (validStudent) {
      onLogin({
        userLogado: validStudent.aluno,
        tipoLoginAtual: 'aluno',
        nomeDisplay: validStudent.aluno,
        turmaDisplay: validStudent.turma
      });
    } else {
      setStudentError('Código da turma / senha incorreto para este aluno. Digite a senha que você recebeu.');
    }
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherError('');

    const pass = cleanCode(teacherPassword.trim());
    if (!pass) {
      setTeacherError('Por favor, informe sua senha de acesso docente.');
      return;
    }

    // Validação de senhas do professor: PROFESSOROPERA2026 (ex: BRENDAOPERA2026)
    const profNormalized = cleanCode(selectedTeacher.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    const expectedPass = `${profNormalized}OPERA2026`;

    if (pass === expectedPass || pass === `${cleanCode(selectedTeacher)}OPERA2026`) {
      onLogin({
        userLogado: selectedTeacher,
        tipoLoginAtual: 'prof',
        nomeDisplay: selectedTeacher,
        turmaDisplay: 'Docente 2026.1'
      });
    } else {
      setTeacherError(`Senha de acesso incorreta para o(a) professor(a) ${selectedTeacher}.`);
    }
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError('');

    const pass = cleanCode(staffPassword.trim());
    if (!pass) {
      setStaffError('Por favor, informe a senha de acesso do staff.');
      return;
    }

    const currentStaff = staffMembersList.find(s => s.id === selectedStaff);
    if (!currentStaff) {
      setStaffError('Membro de staff inválido.');
      return;
    }

    const expectedPass = cleanCode(currentStaff.pass);
    const altPass = `${cleanCode(currentStaff.id)}OPERA2026`;

    if (pass === expectedPass || pass === altPass || (currentStaff.id === 'DANIELLE' && pass === 'DANIELEOPERA2026')) {
      onLogin({
        userLogado: currentStaff.name,
        tipoLoginAtual: 'staff',
        nomeDisplay: `${currentStaff.name} • ${currentStaff.cargo}`,
        turmaDisplay: currentStaff.cargo
      });
    } else {
      setStaffError(`Senha incorreta para ${currentStaff.name}.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b2545] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#eebd1a]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#e2001a]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-white rounded-3xl p-6 md:p-10 max-w-md w-full shadow-2xl border-4 border-[#eebd1a] relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <img
            src="https://i.postimg.cc/MGGygYGg/logo-opera-png.png"
            alt="Logo Opera"
            className="h-12 w-auto mx-auto object-contain"
          />
          <div className="text-2xl font-sans tracking-tighter">
            <span className="font-light text-[#0b2545]">OPERA</span>
            <span className="font-black text-[#eebd1a]">LAB</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Portal Integrado Pedagógico
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => { setSelectedRole('aluno'); setStudentError(''); }}
            className={`py-3 px-2 rounded-xl font-black text-xs uppercase tracking-wider transition flex flex-col items-center justify-center gap-1.5 cursor-pointer select-none ${
              selectedRole === 'aluno' 
                ? 'bg-[#0b2545] text-[#eebd1a] shadow-md ring-2 ring-[#0b2545]' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="leading-none text-center">Aluno</span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedRole('prof'); setTeacherError(''); }}
            className={`py-3 px-2 rounded-xl font-black text-xs uppercase tracking-wider transition flex flex-col items-center justify-center gap-1.5 cursor-pointer select-none ${
              selectedRole === 'prof' 
                ? 'bg-[#0b2545] text-[#eebd1a] shadow-md ring-2 ring-[#0b2545]' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span className="leading-none text-center">Professor</span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedRole('staff'); setStaffError(''); }}
            className={`py-3 px-2 rounded-xl font-black text-xs uppercase tracking-wider transition flex flex-col items-center justify-center gap-1.5 cursor-pointer select-none ${
              selectedRole === 'staff' 
                ? 'bg-[#0b2545] text-[#eebd1a] shadow-md ring-2 ring-[#0b2545]' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="leading-none text-center">Staff</span>
          </button>
        </div>

        {/* ALUNO LOGIN */}
        {selectedRole === 'aluno' && (
          <form onSubmit={handleStudentSubmit} className="space-y-4">
            <div>
              <label className="text-xxs font-bold text-slate-500 uppercase block mb-1">
                Nome Completo do Aluno
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    if (studentError) setStudentError('');
                  }}
                  placeholder="Ex: Carlos Eduardo Alves..."
                  className="w-full p-3.5 pl-10 border-2 border-slate-200 rounded-xl font-bold uppercase text-xs text-[#0b2545] outline-none focus:border-[#0b2545]"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
              </div>
            </div>

            <div>
              <label className="text-xxs font-bold text-slate-500 uppercase block mb-1">
                Senha de Acesso (Código da Turma)
              </label>
              <div className="relative">
                <input
                  type={showStudentPassword ? 'text' : 'password'}
                  value={studentPassword}
                  onChange={(e) => {
                    setStudentPassword(e.target.value);
                    if (studentError) setStudentError('');
                  }}
                  placeholder="Digite o código que você recebeu..."
                  className="w-full p-3.5 pl-10 pr-10 border-2 border-slate-200 rounded-xl font-bold uppercase text-xs text-[#0b2545] outline-none focus:border-[#0b2545]"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                <button
                  type="button"
                  onClick={() => setShowStudentPassword(!showStudentPassword)}
                  className="absolute right-3.5 top-4 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block mt-1">
                🔒 Acesso restrito com o código de turma fornecido pela escola
              </span>
            </div>

            {studentError && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-center gap-2 text-red-600 text-xxs font-bold uppercase">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{studentError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#0b2545] hover:bg-black text-[#eebd1a] font-black py-4 rounded-xl text-xs uppercase shadow-xl transition flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <LogIn className="w-4 h-4" />
              <span>Acessar Portal do Aluno</span>
            </button>
          </form>
        )}

        {/* PROFESSOR LOGIN */}
        {selectedRole === 'prof' && (
          <form onSubmit={handleTeacherSubmit} className="space-y-4">
            <div>
              <label className="text-xxs font-bold text-slate-500 uppercase block mb-1">
                Selecione o Professor
              </label>
              <div className="relative">
                <select
                  value={selectedTeacher}
                  onChange={(e) => {
                    setSelectedTeacher(e.target.value);
                    if (teacherError) setTeacherError('');
                  }}
                  className="w-full p-3.5 pl-10 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold uppercase text-xs text-[#0b2545] outline-none focus:border-[#0b2545] cursor-pointer"
                >
                  {Object.keys(PERF_MASTER_DB).map((prof) => (
                    <option key={prof} value={prof}>
                      Professor(a) {prof}
                    </option>
                  ))}
                </select>
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-4 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xxs font-bold text-slate-500 uppercase block mb-1">
                Senha do Docente
              </label>
              <div className="relative">
                <input
                  type={showTeacherPassword ? 'text' : 'password'}
                  value={teacherPassword}
                  onChange={(e) => {
                    setTeacherPassword(e.target.value);
                    if (teacherError) setTeacherError('');
                  }}
                  placeholder="Digite sua senha de professor..."
                  className="w-full p-3.5 pl-10 pr-10 border-2 border-slate-200 rounded-xl font-bold uppercase text-xs text-[#0b2545] outline-none focus:border-[#0b2545]"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                <button
                  type="button"
                  onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                  className="absolute right-3.5 top-4 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showTeacherPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {teacherError && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-center gap-2 text-red-600 text-xxs font-bold uppercase">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{teacherError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#0b2545] hover:bg-black text-[#eebd1a] font-black py-4 rounded-xl text-xs uppercase shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Acessar Espaço do Professor</span>
            </button>
          </form>
        )}

        {/* STAFF LOGIN */}
        {selectedRole === 'staff' && (
          <form onSubmit={handleStaffSubmit} className="space-y-4">
            <div>
              <label className="text-xxs font-bold text-slate-500 uppercase block mb-1">
                Membro do Staff
              </label>
              <div className="relative">
                <select
                  value={selectedStaff}
                  onChange={(e) => {
                    setSelectedStaff(e.target.value);
                    if (staffError) setStaffError('');
                  }}
                  className="w-full p-3.5 pl-10 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold uppercase text-xs text-[#0b2545] outline-none focus:border-[#0b2545] cursor-pointer"
                >
                  {staffMembersList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} — {st.cargo}
                    </option>
                  ))}
                </select>
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-4 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xxs font-bold text-slate-500 uppercase block mb-1">
                Senha de Acesso Staff
              </label>
              <div className="relative">
                <input
                  type={showStaffPassword ? 'text' : 'password'}
                  value={staffPassword}
                  onChange={(e) => {
                    setStaffPassword(e.target.value);
                    if (staffError) setStaffError('');
                  }}
                  placeholder="Digite sua senha de staff..."
                  className="w-full p-3.5 pl-10 pr-10 border-2 border-slate-200 rounded-xl font-bold uppercase text-xs text-[#0b2545] outline-none focus:border-[#0b2545]"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                <button
                  type="button"
                  onClick={() => setShowStaffPassword(!showStaffPassword)}
                  className="absolute right-3.5 top-4 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showStaffPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {staffError && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-center gap-2 text-red-600 text-xxs font-bold uppercase">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{staffError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#e2001a] hover:bg-red-700 text-white font-black py-4 rounded-xl text-xs uppercase shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Acessar Painel do Staff</span>
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
            OPERA LAB v2.6 • Feira de Santana - BA
          </span>
        </div>
      </div>
    </div>
  );
}
