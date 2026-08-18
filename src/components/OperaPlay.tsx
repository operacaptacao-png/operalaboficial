/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { UserSession } from '../types';
import { 
  Gamepad2, 
  Sparkles, 
  RotateCcw, 
  Volume2, 
  Trophy, 
  Check, 
  HelpCircle,
  Hash
} from 'lucide-react';

interface OperaPlayProps {
  session: UserSession;
}

const HANGMAN_WORDS = [
  { word: "PASSPORT", hint: "Essential document for international travel" },
  { word: "INTERVIEW", hint: "Meeting where you are evaluated for a job" },
  { word: "AIRPORT", hint: "Place where airplanes take off and land" },
  { word: "IMMIGRATION", hint: "Border checkpoint for arriving passengers" },
  { word: "LANGUAGE", hint: "System of communication used by a country" },
  { word: "PERFORMANCE", hint: "How well you achieve and learn in class" },
  { word: "VOCABULARY", hint: "The body of words used in a particular language" },
  { word: "FLUENCY", hint: "The ability to speak or write a language easily" }
];

const TRIVIA_QUESTIONS = [
  {
    q: "Qual a resposta correta para: 'What are you doing here in the UK?'",
    options: [
      "I am having a job interview next week.",
      "I will be travel yesterday.",
      "I am stay for one month.",
      "I does not know."
    ],
    correct: 0
  },
  {
    q: "Como se pergunta a duração de uma estadia em inglês formal?",
    options: [
      "How long are you going to stay?",
      "How many times you stay?",
      "Where are you going stay?",
      "When is your staying?"
    ],
    correct: 0
  },
  {
    q: "Qual o documento que comprova o agendamento de uma entrevista de trabalho?",
    options: [
      "Invitation Letter / Interview Confirmation",
      "Boarding Pass",
      "Hotel Receipt",
      "Luggage Tag"
    ],
    correct: 0
  },
  {
    q: "No padrão europeu (CEFR), o nível de proficiência independente intermediário é:",
    options: ["B1 / B2", "A1", "A2", "C2"],
    correct: 0
  }
];

export default function OperaPlay({}: OperaPlayProps) {
  const [activeGame, setActiveGame] = useState<'bingo' | 'hangman' | 'trivia'>('hangman');

  // Bingo Sorteador State
  const [sorteados, setSorteados] = useState<number[]>([]);
  const [ultimoSorteado, setUltimoSorteado] = useState<number | null>(null);

  const handleSortearNumero = () => {
    if (sorteados.length >= 75) return;
    let num: number;
    do {
      num = Math.floor(Math.random() * 75) + 1;
    } while (sorteados.includes(num));

    setUltimoSorteado(num);
    setSorteados(prev => [num, ...prev]);
  };

  const handleResetBingo = () => {
    setSorteados([]);
    setUltimoSorteado(null);
  };

  // Hangman State
  const [hangmanIndex, setHangmanIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [hangmanErrors, setHangmanErrors] = useState(0);

  const currentHangman = HANGMAN_WORDS[hangmanIndex];
  const maxErrors = 6;

  const handleGuess = (letter: string) => {
    if (guessedLetters.includes(letter) || hangmanErrors >= maxErrors) return;

    setGuessedLetters(prev => [...prev, letter]);
    if (!currentHangman.word.includes(letter)) {
      setHangmanErrors(prev => prev + 1);
    }
  };

  const isWordGuessed = currentHangman.word.split('').every(l => guessedLetters.includes(l));
  const isGameOver = hangmanErrors >= maxErrors;

  const handleNextWord = () => {
    setHangmanIndex(prev => (prev + 1) % HANGMAN_WORDS.length);
    setGuessedLetters([]);
    setHangmanErrors(0);
  };

  // Trivia State
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [triviaScore, setTriviaScore] = useState(0);
  const [triviaFinished, setTriviaFinished] = useState(false);

  const handleAnswerTrivia = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === TRIVIA_QUESTIONS[triviaIndex].correct) {
      setTriviaScore(prev => prev + 1);
    }
  };

  const handleNextTrivia = () => {
    if (triviaIndex + 1 < TRIVIA_QUESTIONS.length) {
      setTriviaIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setTriviaFinished(true);
    }
  };

  const handleResetTrivia = () => {
    setTriviaIndex(0);
    setSelectedOption(null);
    setTriviaScore(0);
    setTriviaFinished(false);
  };

  return (
    <div className="page-content max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-slate-200 pb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#0b2545] flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-[#eebd1a]" />
            <span>Opera Play</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            Jogos Pedagógicos, Desafios de Vocabulário e Atividades Interativas
          </p>
        </div>

        {/* Game Switcher */}
        <div className="flex bg-slate-200 p-1 rounded-xl border border-slate-300">
          <button
            onClick={() => setActiveGame('hangman')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition ${
              activeGame === 'hangman' ? 'bg-[#0b2545] text-[#eebd1a] shadow' : 'text-slate-600'
            }`}
          >
            Jogo da Forca
          </button>
          <button
            onClick={() => setActiveGame('trivia')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition ${
              activeGame === 'trivia' ? 'bg-[#0b2545] text-[#eebd1a] shadow' : 'text-slate-600'
            }`}
          >
            Trivia Quiz
          </button>
          <button
            onClick={() => setActiveGame('bingo')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition ${
              activeGame === 'bingo' ? 'bg-[#0b2545] text-[#eebd1a] shadow' : 'text-slate-600'
            }`}
          >
            Bingo Sorteador
          </button>
        </div>
      </div>

      {/* GAME 1: HANGMAN */}
      {activeGame === 'hangman' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-center">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xxs font-black uppercase text-slate-400">
              Palavra {hangmanIndex + 1} de {HANGMAN_WORDS.length}
            </span>
            <span className="text-xxs font-black uppercase bg-red-100 text-red-700 px-3 py-1 rounded-full">
              Erros: {hangmanErrors} / {maxErrors}
            </span>
          </div>

          <div className="py-2">
            <p className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">💡 Dica:</p>
            <p className="text-sm md:text-base font-bold text-[#0b2545] italic">
              "{currentHangman.hint}"
            </p>
          </div>

          {/* Secret Word Display */}
          <div className="flex justify-center flex-wrap gap-2 md:gap-3 py-6">
            {currentHangman.word.split('').map((letter, idx) => {
              const revealed = guessedLetters.includes(letter) || isGameOver;
              return (
                <span
                  key={idx}
                  className={`w-10 h-12 md:w-12 md:h-14 flex items-center justify-center font-mono font-black text-xl md:text-2xl rounded-xl border-2 transition ${
                    revealed
                      ? isGameOver && !guessedLetters.includes(letter)
                        ? 'bg-red-50 border-red-300 text-red-500'
                        : 'bg-slate-50 border-[#0b2545] text-[#0b2545]'
                      : 'bg-slate-100 border-slate-300 text-transparent'
                  }`}
                >
                  {revealed ? letter : '_'}
                </span>
              );
            })}
          </div>

          {/* Outcome Status */}
          {isWordGuessed && (
            <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-2xl text-emerald-800 space-y-2">
              <h3 className="font-black text-base uppercase">🎉 Parabéns! Você acertou!</h3>
              <button
                onClick={handleNextWord}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase shadow transition cursor-pointer"
              >
                Próxima Palavra →
              </button>
            </div>
          )}

          {isGameOver && (
            <div className="bg-red-50 border-2 border-red-300 p-4 rounded-2xl text-red-800 space-y-2">
              <h3 className="font-black text-base uppercase">Tentativas esgotadas! A palavra era: {currentHangman.word}</h3>
              <button
                onClick={handleNextWord}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase shadow transition cursor-pointer"
              >
                Tentar Outra Palavra
              </button>
            </div>
          )}

          {/* Virtual Keyboard */}
          <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 max-w-xl mx-auto pt-4">
            {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').map((letter) => {
              const isUsed = guessedLetters.includes(letter);
              return (
                <button
                  key={letter}
                  onClick={() => handleGuess(letter)}
                  disabled={isUsed || isWordGuessed || isGameOver}
                  className={`p-2.5 rounded-xl font-black text-xs uppercase transition cursor-pointer ${
                    isUsed
                      ? 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed'
                      : 'bg-white hover:bg-[#0b2545] hover:text-white text-[#0b2545] border-2 border-slate-200 hover:border-[#0b2545]'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* GAME 2: TRIVIA QUIZ */}
      {activeGame === 'trivia' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {!triviaFinished ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-xxs font-black uppercase text-slate-400">
                  Pergunta {triviaIndex + 1} de {TRIVIA_QUESTIONS.length}
                </span>
                <span className="text-xxs font-black uppercase bg-[#0b2545] text-[#eebd1a] px-3 py-1 rounded-full">
                  Pontos: {triviaScore}
                </span>
              </div>

              <h3 className="text-base md:text-lg font-black uppercase text-[#0b2545] leading-snug">
                {TRIVIA_QUESTIONS[triviaIndex].q}
              </h3>

              <div className="space-y-3">
                {TRIVIA_QUESTIONS[triviaIndex].options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === TRIVIA_QUESTIONS[triviaIndex].correct;
                  const showResult = selectedOption !== null;

                  let optClass = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-[#0b2545]';
                  if (showResult) {
                    if (isCorrect) optClass = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-black';
                    else if (isSelected) optClass = 'bg-red-100 border-red-500 text-red-900 font-black';
                    else optClass = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerTrivia(idx)}
                      disabled={showResult}
                      className={`w-full p-4 rounded-2xl border-2 text-left text-xs font-bold transition flex items-center justify-between cursor-pointer ${optClass}`}
                    >
                      <span>{opt}</span>
                      {showResult && isCorrect && <Check className="w-5 h-5 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>

              {selectedOption !== null && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextTrivia}
                    className="bg-[#0b2545] hover:bg-black text-[#eebd1a] px-8 py-3.5 rounded-xl font-black text-xs uppercase shadow transition cursor-pointer"
                  >
                    {triviaIndex + 1 < TRIVIA_QUESTIONS.length ? 'Próxima Questão →' : 'Ver Resultado Final'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <Trophy className="w-16 h-16 text-[#eebd1a] mx-auto animate-bounce" />
              <h3 className="text-2xl font-black uppercase text-[#0b2545]">Quiz Concluído!</h3>
              <p className="text-base font-bold text-slate-600">
                Você acertou <strong className="text-emerald-600 font-black">{triviaScore}</strong> de {TRIVIA_QUESTIONS.length} perguntas.
              </p>
              <button
                onClick={handleResetTrivia}
                className="bg-[#0b2545] text-[#eebd1a] px-8 py-3.5 rounded-xl font-black text-xs uppercase shadow-xl transition cursor-pointer"
              >
                Jogar Novamente
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 3: BINGO */}
      {activeGame === 'bingo' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-base uppercase text-[#0b2545]">Sorteador de Bingo Pedagógico</h3>
              <p className="text-xxs font-bold text-slate-400 uppercase">Perfeito para dinâmicas de sala de aula e eventos</p>
            </div>
            <button
              onClick={handleResetBingo}
              className="text-xs font-bold text-red-500 hover:underline uppercase flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reiniciar Sorteio
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
            <div className="w-36 h-36 rounded-3xl bg-[#0b2545] border-4 border-[#eebd1a] flex flex-col items-center justify-center text-white shadow-xl">
              <span className="text-xxs font-bold uppercase text-[#eebd1a]">Último Chamado</span>
              <span className="text-5xl font-black tracking-tight">{ultimoSorteado || '--'}</span>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <p className="text-xs font-bold text-slate-500 uppercase">
                Números chamados: <strong>{sorteados.length}</strong> de 75
              </p>
              <button
                onClick={handleSortearNumero}
                disabled={sorteados.length >= 75}
                className="bg-[#e2001a] hover:bg-red-700 text-white font-black px-8 py-4 rounded-2xl text-xs uppercase shadow-xl hover:scale-105 transition cursor-pointer disabled:opacity-50"
              >
                Sortear Próximo Número
              </button>
            </div>
          </div>

          {/* Grid de 1 a 75 */}
          <div className="space-y-2 pt-4">
            <h4 className="text-xxs font-black uppercase text-slate-400 tracking-wider">Tabela Geral (1 - 75)</h4>
            <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5">
              {Array.from({ length: 75 }).map((_, i) => {
                const num = i + 1;
                const isDrawn = sorteados.includes(num);
                return (
                  <span
                    key={num}
                    className={`h-8 flex items-center justify-center text-xs font-black rounded-lg border transition ${
                      isDrawn
                        ? 'bg-[#eebd1a] border-[#0b2545] text-[#0b2545] shadow-sm font-extrabold scale-105'
                        : 'bg-slate-50 border-slate-200 text-slate-300'
                    }`}
                  >
                    {num}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
