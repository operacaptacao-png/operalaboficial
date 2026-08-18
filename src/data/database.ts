/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CalendarEvent, AudioItem } from '../types';

export const PERF_MASTER_DB: Record<string, Record<string, string[]>> = {
  "BRENDA": {
    "Explores2qua14a26.1": ["Arthur Vitória Almeida Cerqueira", "Cecília de Carvalho Coelho", "Laura Lopes Evangelista", "Lorenzo Libório Ciqueira"],
    "XP3SAB10A26.1": ["Ana Beatriz Vieira Pereira Mascarenhas", "Carlos Eduardo Alves Dos Santos", "Clarice Santos Guimarães Bonfim", "Elloise Oliveira Brito", "Káyla Beatriz Carneiro Silva", "Maria Eduarda Andrade Santos", "Maria Eduarda Sampaio Castro", "Mirela Santos Ferreira Carneiro", "Valentina Souza Merces Barreto", "Vitor Hugo de Medeiros Lima"],
    "XP2SAB08A26.1": ["Aiyra Alves Bento", "Vicente Lima de Oliveira Bispo", "Alice França Bispo Passos", "Antônio Victor Cruz de Souza", "Edrei Amorim dos Santos", "Eloá Souza Santos", "Hugo Rafael Silva de Almeida Silva", "Maria Clara Ferreira Gois", "Sofia Benn Vivas dos Santos"],
    "XP3SEG16A26.1": ["Ana Mel Azevedo de Lima", "Ana Vitória de Oliveira dos Reis", "Guilherme Nascimento Santos Silva", "Guilherme Barros Souza", "Heloisa Ferreira Pinheiro", "Isadora Brito De Almeida", "Maria Isabel Lira Miranda", "Maria Júlia Medrado Santana", "Mel Leal Santos", "Nicole Santana de Souza"],
    "ADV1SEG14A26.1": ["Antonio Henrique de Oliveira dos Reis", "Julia Benn Vivas de Assis", "Lays Costa Silva", "Maria Cecília Almeida Oliveira", "Bernardo Dias Anjos"],
    "ADV1TER16A26.1": ["Breno Reis Barbosa", "Ícaro de Assis Ribeiro Carneiro", "Jade Evangelho Santoro", "Melina de Araujo Silva", "John Levi Melo Freitas", "Kallel Santos Silva Neiva Briséno", "Amyle Alves Bento"],
    "DISCO3QUA16A26.1": ["CECILIA LIMA BRITO", "LAURA VILAS BOAS SANTOS FONSECA"],
    "DISCO2QUI14A26.1": ["Maria Alice Ribeiro Nunes Simões de Freitas", "Maria Helena Ribeiro Nunes Simões de Freitas", "Rafael da Silva Castilho"]
  },
  "EDIMO": {
    "XP5QUA14A26.1": ["Lavínia de Oliveira Garcia", "Layla Cedraz Neves", "Maria Luiza Lima Macedo"],
    "XP4QUA16A26.1": ["Ana Julia Lima Ferreira", "Carlos Luis do Nascimento Silva Lima", "Davi Brito Moreira", "Heitor Libório Cirqueira", "Lyandra Ceres da Silva Barreto de Jesus", "Maria Alice Neco Oliveira", "Maria Clara Leite de Araújo Martins", "Pedro Vieira Guimarães"],
    "XP5QUI16A26.1": ["Arthur Ferreira de Jesus Sales", "Caroline Fernandes Seixas", "Davi Enéas Rosa Santos", "Luca Leite Araujo", "Luma Almeida Santos De Oliveira"],
    "TGT1QUA19A26.1": ["Aylla Lorena Silva Mendes", "Adriany da Silva Ribeiro Pinto", "Frank Willian Santos Magalhães", "Lindelson Pereira Gonçalves Júnior", "Mayra Hellen Silva Mendes", "Rodrigo de Jesus Santos", "Géssica Falcão Rêgo"],
    "TGT1ONSEG19A26.2": ["Lailla Silva Gonçalves", "Beatriz Costa de Freitas", "Daniela Eich Brizolla"],
    "TGT1ONSAB08A26.2": ["Sophia e Souza Alves", "Thalita Oliveira Suzarte", "Matheus Cardoso Santos", "Anna Leticia Marinho Souza"]
  },
  "IANNE": {
    "XP2SEG16A26.1": ["Eduardo Souza Teixeira", "Leonardo Santos Ribeiro", "Marcio Araújo de Santana Filho", "Yasmin Moraes Abreu e Silva"],
    "XP2TER16A26.1": ["Antonio dos Anjos Machado", "Andrey de Barros Cerqueira", "Hugo Rafael Silva de Almeida Silva", "Cristovam Avelino Borges Neto", "João Ricardo Rodrigues dos Santos", "Lucca Santana Cunha Carvalho", "Maria Eduarda Oliveira Rocha", "Nicolle da Cruz Ribeiro Santana", "Thalita Reis da Silva"],
    "TGT2SEG19A26.1": ["Anderson Luis Carvalho Nascimento", "Debora Lima de Melo", "Leticia Passos Andrade", "Fábio Henrique Rabelo Araújo", "Maria Clara Dultra Oliveira", "Quézia Soares e Soares"],
    "TGT3SAB10A26.1": ["Ester Nascimento Santos", "Ícaro Portela Meirelles", "Nicole Marques Ribeiro", "Raissa Karen Simas Portugal", "Camila Pereira Da Silva Fonseca", "João Eduardo De Almeida Araujo Santana"],
    "EXPLORES1TER14A26.1": ["Bernardo Vaccarezza Merces", "Maria Rita Ramos Borges Neta", "Pietro Oliveira dos Santos Silva"],
    "EXPLORES1QUI14A26.1": ["Arthur Cedraz Araujo", "Asafe Salomão Ribeiro Nunes Simões de Freitas", "Felipe de Araujo Moreira", "Julia Heloísa Ferreira de Oliveira", "Kevin Lohan Santos Noguiera"],
    "TGT1QUI19A26.2": ["Narjara Lucena Ribeiro Fateicha Neves", "Roniel Andrade Almeida"]
  },
  "JOÃO": {
    "TGT1QUA16A26.1": ["Anthony Brandão Lima", "Heloísa Ribeiro Lobo", "Heloisah Lima das Neves", "Ludmila Freitas Souza", "Melissa Pereira Amorim", "Natalia Roberta Pereira da Silva", "Victoria Soares Carvalho de Lima", "Vyctor Santos Santana", "Willyan da Silva Almeida", "Evellyn Silva Ferreira"],
    "TGT1SAB08A26.1": ["Ana Julia Nunes Magalhães Rocha", "Andressa Oliveira Barros", "Ana Maria Rodrigues Ferraz Dos Santos", "Artur Cardoso da Costa", "Gabriel Grisostomo Barbosa", "Jennifer Dhandara Gouveia Pamponet Macedo", "Júlia Reis Silva", "Lavínia de Souza Pereira", "Sthefani da Silva Moura", "Yasmim Do Carmo Mascarenhas", "Jeska Souza Matos", "Davi Lucas Ferraz Reis"]
  },
  "LARISSA": {
    "XP1QUI16A26.1": ["João Pedro de Carvalho Lima Nunes", "Lucas Reis Miotto", "Jhonatan Moreira Veloso", "Louise de Araujo Silva", "Annaly dos Santos Araújo", "Enzo de Souza Ribeiro"],
    "XP1SAB08A26.1": ["Anna Beatriz Mota Santos", "Laila Mirela Lima de Almeida Cruz", "Maria Elliza Meira Bastos", "Maria Eloísa Araujo Soares", "Nicole Reis de Santana", "Evelly Passos Dos Santos Silva", "Julya Correia da Luz", "Maria Luiza de souza Ribeiro", "Noan Alves de Lima Silva"],
    "TGT2SAB10A26.1": ["Bruno Otávio dos Santos da Cunha", "Ellen Catharyne Villas Boas Oliveira da Silva", "Guilherme Oliveira Marques Ribeiro", "Júlia de Jesus Macêdo", "Levi Moreira Venas", "Maria Luiza Simplício Lopes", "Stephanie Silva de Oliveira Cunha", "Joelma Freitas da Mota", "Abraão Nunes Barreto"],
    "ADV3TER16A26.1": ["Ana Luiza Lima de Almeida", "Arthur dos Santos de Jesus", "Joaquim Ramos Borges Freitas", "Larissa De Jesus Silva De Almeida", "Levi Ribeiro Barros", "Melissa Reis Barbosa"],
    "ADV2TER14A26.1": ["Augusto César da Silva Nunes", "Breno Alves Nogueira Souza", "João Pedro Lima Ramos", "Lara Alves Rodrigues", "Leonardo Rocha Costa", "Maria Fernanda Franco Amaral", "Maria Luiza Magalhães de Almeida", "Melissa Kioshi Coutinho Estrela", "Raphael Rodrigues dos Santos", "Raquel de Freitas Rodrigues", "Fernando Antonio Azevedo Lima"],
    "XP3QUI14A26.1": ["Gabriel Oliveira Teles", "Julia Cerqueira Pedra", "Ana Beatriz Guimarães Vieira", "Sophia Almeida do Rosário", "Laura de Araujo Moreira", "Miguel Castro Lima", "Analu Santana Araújo Alves", "Benjamim Silva Nascimento"]
  },
  "SABRINA": {
    "EXPTAQUI16A26.1": ["Adalberto Souza Santos da Silva", "João Lucas Da Silva Cardoso", "Júlia Porto de Sousa", "Talita Lima de Almeida"],
    "EXPTBSAB10A26.1": ["Alice Cerqueira de Oliveira", "Alvaro Afonso Da Silva Nunes", "Davi Cesar Carvalho Alves", "Flávia Lima Ramos", "Jeferson Wilhams Gama Leite", "Leticia Silva De Jesus Lopes", "Luna Lima Barreto", "Maria Clara Ataíde Santana", "Maria Eduarda Dos Santos Batista", "Vladimir Ramos Vitorino De Assis"],
    "TGT1SAB08A25.2": ["Alana Olga Aragão Lima", "Amanda Damasceno Souza Da Silva", "Pedro Argus Campos de Matos", "Lucimara de Jesus Gouveia"],
    "TGT1QUI19A25.2": ["Adlla Katarine Aragão Cruz Passos", "Alexandre Aquino", "Beatriz Karoliny Vieira da Silva", "Carla Cristina Santos Neri", "Glessia Carneiro Guimarães", "Ramon de Cerqueira Silva", "Robson Andrade Cardoso"],
    "TGT1SAB08A26.2": ["Ezequiel dos Santos Gonçalves", "Jeferson de Assis Santos", "Lenize Maria Pereira Portela", "Maiza Santos de Santana", "Tiago Vinicius Matos de Silveira", "Joana Darck Otoni de Sousa"],
    "TGT2QUI19A26.2": ["Adlla Katarine Aragão Cruz Passos", "Alexandre Aquino", "Glecia Carneiro Guimarães", "Ramon de Cerqueira Silva", "Robson Andrade Cardoso"]
  },
  "JOELMA": {
    "FR1SEG19A26.1": ["Camila Ferraz Pinto e Souza", "Francisco Gabriel de Almeida Rego", "Stêfane Costa Carneiro", "JADSON DE SANTANA LIMA", "Mariana Souza de Oliveira"],
    "FR1SAB08A25.2": ["Eduarda Borges Santana", "Giovanna Araujo Looser", "Ivane Tavares de Souza", "Rafaella Andrade de Souza"]
  },
  "PABLO": {
    "ESP2SEG19A26.1": ["Jonhy Herbert Gonçalves Evangelista", "Maria Eduarda Vidal Schunemann Simões Azevedo", "Ana Letícia Rabelo Araujo Martins", "Lucas Da Silva Oliveira", "Maria Alice Neco Oliveira", "Moisés Leal da Costa"],
    "ESP2QUI19A26.1": ["Adevani Correia da Silva", "Gabriela da Cruz da Silva", "Letícia Passos Andrade", "Thais Loren Silva Moraes de Souza", "Manuela Carvalho Rios Souza", "Quezia Soares E Soares"],
    "ESP1QUA19A26.1": ["Angela Guimarães Martins", "Gilcimar Paim", "Iago de Oliveira Eneas", "Katiane da Silva Brito", "Kely de Melo Oliveira", "Nadja Maria da Silva", "Natalia Roberta Pereira da Silva"],
    "ESP1SAB08A26.1": ["Jozilma lima dos santos", "Neuma Novaes de Souza"],
    "ESP1SAB10A25.2": ["Daniele Marquetti de Melo", "Emerson Samuel Marquetti Machado", "Everaldo Nazareno Cézar de Melo Marquetti"]
  },
  "MAISA": {}
};

export const HORARIOS_ATIVOS: Record<string, Record<number, { s: string; e: string; mod?: string }[]>> = {
  "IANNE": {
    1: [{ s: "18:00", e: "19:00" }], // Segunda
    6: [{ s: "08:00", e: "10:00" }]  // Sábado
  },
  "EDIMO": {
    3: [
      { s: "09:00", e: "11:00" },
      { s: "18:00", e: "19:00", mod: "Online" }
    ], // Quarta
    4: [{ s: "14:00", e: "16:00" }]  // Quinta
  },
  "JOÃO": {
    6: [{ s: "10:00", e: "12:00" }] // Sábado
  },
  "MAISA": {
    1: [{ s: "18:00", e: "19:00" }], // Segunda
    6: [{ s: "08:00", e: "12:00" }]  // Sábado
  }
};

export const eventsDB: CalendarEvent[] = [
  { start: "2026-01-01", end: "2026-02-06", title: "Recesso Escolar", type: "red" },
  { date: "2026-02-07", title: "Início das Aulas (Sábados)", type: "blue", highlight: true },
  { date: "2026-02-09", title: "Início das Aulas (Seg/Qua)", type: "blue", highlight: true },
  { date: "2026-02-10", title: "Início das Aulas (Ter/Qui)", type: "blue", highlight: true },
  { start: "2026-02-14", end: "2026-02-18", title: "Recesso de Carnaval", type: "red", highlight: true },
  { start: "2026-03-26", end: "2026-03-31", title: "Recesso Semana Santa", type: "red", highlight: true },
  { date: "2026-04-01", title: "Recesso Semana Santa", type: "red", highlight: true },
  { start: "2026-04-02", end: "2026-04-04", title: "Recesso Semana Santa", type: "red", highlight: true },
  { date: "2026-04-14", title: "Reunião de Pais Presencial", type: "gold", highlight: true },
  { date: "2026-04-21", title: "Feriado Tiradentes", type: "red", highlight: true },
  { date: "2026-05-01", title: "Feriado do Trabalhador", type: "red", highlight: true },
  { date: "2026-05-23", title: "Operação", type: "gold", highlight: true },
  { date: "2026-06-04", title: "Feriado Corpus Christi", type: "red", highlight: true },
  { date: "2026-06-17", title: "Plantão Pedagógico", type: "gold", highlight: true },
  { date: "2026-06-18", title: "Folk Festival", type: "gold", highlight: true },
  { date: "2026-06-20", title: "Plantão Pedagógico", type: "gold", highlight: true },
  { start: "2026-06-22", end: "2026-07-05", title: "Recesso Junino", type: "red", highlight: true },
  { date: "2026-07-06", title: "Retorno 2º Semestre", type: "blue", highlight: true },
  { date: "2026-09-07", title: "Feriado Independência", type: "red", highlight: true },
  { date: "2026-10-12", title: "Feriado N. Sra. Aparecida", type: "red", highlight: true },
  { date: "2026-10-13", title: "Dia do Professor (Antecipado)", type: "red", highlight: true },
  { date: "2026-11-02", title: "Feriado Finados", type: "red", highlight: true },
  { start: "2026-11-18", end: "2026-11-21", title: "Recesso Micareta", type: "red", highlight: true },
  { date: "2026-11-28", title: "Último dia de aula (Kids/Teens)", type: "blue", highlight: true },
  { date: "2026-12-04", title: "Opera Show", type: "gold", highlight: true },
  { date: "2026-12-14", title: "Último dia de aula (Target/Expert)", type: "blue", highlight: true },
  { date: "2026-12-15", title: "Plantão Pedagógico", type: "gold", highlight: true },
  { date: "2026-12-16", title: "Plantão Pedagógico", type: "gold", highlight: true }
];

export const audioDB: Record<string, AudioItem[]> = {
  target: [
    { name: "Target 1", icon: "fa-plane", pass: "OPERA2026TARGET1", url: "https://target1pwaaudios.operaidiomas.workers.dev/", category: "target" },
    { name: "Target 2", icon: "fa-map", pass: "OPERA2026TARGET2", url: "https://sites.google.com/view/opera-lab/audios-target/target-2", category: "target" },
    { name: "Target 3", icon: "fa-globe-americas", pass: "OPERA2026TARGET3", url: "https://sites.google.com/view/opera-lab/audios-target/target-3", category: "target" }
  ],
  teens: [
    { name: "XP 1", icon: "fa-seedling", pass: "OPERA2026XP1", url: "https://experience1xp1audios.operaidiomas.workers.dev/", category: "teens" },
    { name: "XP 2", icon: "fa-gamepad", pass: "OPERA2026XP2", url: "https://sites.google.com/view/opera-lab/audios-teens/xp2", category: "teens" },
    { name: "XP 3", icon: "fa-bolt", pass: "OPERA2026XP3", url: "https://sites.google.com/view/opera-lab/audios-teens/xp3", category: "teens" },
    { name: "XP 4", icon: "fa-fire", pass: "OPERA2026XP4", url: "https://sites.google.com/view/opera-lab/audios-teens/xp4", category: "teens" },
    { name: "XP 5", icon: "fa-crown", pass: "OPERA2026XP5", url: "https://sites.google.com/view/opera-lab/audios-teens/xp5", category: "teens" }
  ],
  expert: [
    { name: "Expert A", icon: "fa-graduation-cap", pass: "OPERA2026EXPERTA", url: "https://sites.google.com/d/1bfa54jZ35-1NpJ9pDVgrC4emkDs05xyj/p/19q77FlnMDLame9PZEQf56ihlDK9dIpZn/edit", category: "expert" },
    { name: "Expert B", icon: "fa-trophy", pass: "OPERA2026EXPERTB", url: "https://sites.google.com/d/1bfa54jZ35-1NpJ9pDVgrC4emkDs05xyj/p/1mR4SqmGnyjo7m7R41UKbfO8xOW4nHRUx/edit", category: "expert" }
  ],
  espanhol: [
    { name: "Gente Hoy 1", icon: "fa-book-open", url: "https://espanholaudios.operaidiomas.workers.dev/", category: "espanhol" }
  ]
};

export interface CertificateConfig {
  idioma: 'en' | 'es' | 'fr';
  curso: string;
  horas: number;
  nivel: string;
}

export function mapearTurmaParaCertificado(turmaCodigo: string): CertificateConfig | null {
  const prefixo = turmaCodigo.toUpperCase();
  if (prefixo.startsWith('TGT1')) return { idioma: 'en', curso: 'General English Course', horas: 90, nivel: 'A1/A2' };
  if (prefixo.startsWith('TGT2')) return { idioma: 'en', curso: 'General English Course', horas: 90, nivel: 'A2/B1' };
  if (prefixo.startsWith('TGT3')) return { idioma: 'en', curso: 'General English Course', horas: 90, nivel: 'B1/B2' };
  if (prefixo.startsWith('EXPTA')) return { idioma: 'en', curso: 'General English Course', horas: 90, nivel: 'B2/C1' };
  if (prefixo.startsWith('EXPTB')) return { idioma: 'en', curso: 'General English Course', horas: 90, nivel: 'C1' };
  if (prefixo.startsWith('XP1')) return { idioma: 'en', curso: 'General English Course', horas: 82, nivel: 'A1' };
  if (prefixo.startsWith('XP2')) return { idioma: 'en', curso: 'General English Course', horas: 82, nivel: 'A1' };
  if (prefixo.startsWith('XP3')) return { idioma: 'en', curso: 'General English Course', horas: 82, nivel: 'A2' };
  if (prefixo.startsWith('XP4')) return { idioma: 'en', curso: 'General English Course', horas: 82, nivel: 'B1' };
  if (prefixo.startsWith('XP5')) return { idioma: 'en', curso: 'General English Course', horas: 82, nivel: 'B2' };
  if (prefixo.startsWith('FR1')) return { idioma: 'fr', curso: 'Cours de Français Général', horas: 90, nivel: 'A1' };
  if (prefixo.startsWith('FR2')) return { idioma: 'fr', curso: 'Cours de Français Général', horas: 90, nivel: 'A2' };
  if (prefixo.startsWith('FR3')) return { idioma: 'fr', curso: 'Cours de Français Général', horas: 90, nivel: 'B1' };
  if (prefixo.startsWith('ESP1')) return { idioma: 'es', curso: 'Curso de Español General', horas: 90, nivel: 'A1' };
  if (prefixo.startsWith('ESP2')) return { idioma: 'es', curso: 'Curso de Español General', horas: 90, nivel: 'A2' };
  if (prefixo.startsWith('ESP3')) return { idioma: 'es', curso: 'Curso de Español General', horas: 90, nivel: 'B1' };
  return null;
}
