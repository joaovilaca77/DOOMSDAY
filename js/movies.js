// Lista de alvos rumo a Vingadores: Doomsday, em ordem de lançamento.
// Campos:
//   id         identificador único (usado no banco — não mude depois de publicar)
//   title      título no Brasil
//   year       ano de lançamento
//   runtime    duração total em minutos (séries: soma aproximada dos episódios); null = desconhecida
//   kind       "Filme" ou "Série · N Ep"
//   phase      fase do MCU ou estúdio de origem
//   universe   'mcu' | 'fox' | 'sony'
//   essential  indispensável para entender Doomsday
//   multiverse faz parte da saga do multiverso / incursões
//   tags       [rótulo, tom] — tom: 'gold' | 'emerald' | 'steel'
//   brief      resumo de uma linha
//   poster     (opcional) URL de um pôster; sem ela o card mostra uma capa gerada
//   unreleased ainda não lançado

export const RELEASE_DATE = new Date(2026, 11, 18);

export const MOVIES = [
  // ── Outros universos: Fox / Sony (anos 2000) ──────────────────────────
  { id:'xmen', title:'X-Men: O Filme', year:2000, runtime:104, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:true, tags:[['Elenco de Doomsday','gold']], brief:'Xavier, Magneto e Ciclope: a equipe original que volta em Doomsday.' },
  { id:'spider1', title:'Homem-Aranha', year:2002, runtime:121, kind:'Filme', phase:'SONY', universe:'sony', essential:false, multiverse:true, tags:[['Variante de Sem Volta para Casa','steel']], brief:'O Peter Parker de Tobey Maguire ganha seus poderes.' },
  { id:'x2', title:'X-Men 2', year:2003, runtime:134, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:true, tags:[['Elenco de Doomsday','gold']], brief:'Noturno e Stryker; a Fênix começa a despertar.' },
  { id:'spider2', title:'Homem-Aranha 2', year:2004, runtime:127, kind:'Filme', phase:'SONY', universe:'sony', essential:false, multiverse:true, tags:[['Doutor Octopus','steel']], brief:'Doc Ock — que depois atravessa para o MCU.' },
  { id:'ff2005', title:'Quarteto Fantástico', year:2005, runtime:106, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:false, tags:[['Primeiro Doom do cinema','gold']], brief:'A primeira família e um Victor Von Doom de terno.' },
  { id:'x3', title:'X-Men: O Confronto Final', year:2006, runtime:104, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:true, tags:[['Fim da trilogia original','steel']], brief:'A cura mutante e a Fênix Negra.' },
  { id:'spider3', title:'Homem-Aranha 3', year:2007, runtime:139, kind:'Filme', phase:'SONY', universe:'sony', essential:false, multiverse:true, tags:[['Homem-Areia','steel']], brief:'Venom, Homem-Areia e o Duende Macabro.' },
  { id:'ff2007', title:'Quarteto Fantástico e o Surfista Prateado', year:2007, runtime:92, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:false, tags:[['Arauto de Galactus','steel']], brief:'O Surfista Prateado anuncia Galactus.' },

  // ── MCU Fase 1 ───────────────────────────────────────────────────────
  { id:'ironman', title:'Homem de Ferro', year:2008, runtime:126, kind:'Filme', phase:'FASE 1', universe:'mcu', essential:false, multiverse:false, tags:[['Origem do MCU','steel']], brief:'Tony Stark constrói a armadura e o MCU nasce.' },
  { id:'hulk', title:'O Incrível Hulk', year:2008, runtime:112, kind:'Filme', phase:'FASE 1', universe:'mcu', essential:false, multiverse:false, tags:[['Ross & Samuel Sterns','steel']], brief:'Bruce Banner em fuga do General Ross.' },
  { id:'ironman2', title:'Homem de Ferro 2', year:2010, runtime:124, kind:'Filme', phase:'FASE 1', universe:'mcu', essential:false, multiverse:false, tags:[['Iniciativa Vingadores','steel']], brief:'Máquina de Combate e a Viúva Negra entram em cena.' },
  { id:'thor', title:'Thor', year:2011, runtime:115, kind:'Filme', phase:'FASE 1', universe:'mcu', essential:false, multiverse:false, tags:[['Origem de Loki','emerald']], brief:'Thor é banido e Loki mostra quem é.' },
  { id:'cap1', title:'Capitão América: O Primeiro Vingador', year:2011, runtime:124, kind:'Filme', phase:'FASE 1', universe:'mcu', essential:false, multiverse:false, tags:[['Joia do Espaço','steel']], brief:'Steve Rogers, a Hydra e o Tesseract.' },
  { id:'avengers', title:'Os Vingadores', year:2012, runtime:143, kind:'Filme', phase:'FASE 1', universe:'mcu', essential:false, multiverse:false, tags:[['Os Vingadores se formam','steel']], brief:'A primeira reunião dos heróis mais poderosos da Terra.' },

  // ── Anos 2010 fora do MCU ────────────────────────────────────────────
  { id:'firstclass', title:'X-Men: Primeira Classe', year:2011, runtime:132, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:false, tags:[['Xavier & Magneto jovens','steel']], brief:'Como Charles e Erik se tornaram amigos — e inimigos.' },
  { id:'asm', title:'O Espetacular Homem-Aranha', year:2012, runtime:136, kind:'Filme', phase:'SONY', universe:'sony', essential:false, multiverse:true, tags:[['Variante de Sem Volta para Casa','steel']], brief:'O Peter Parker de Andrew Garfield.' },

  // ── MCU Fase 2 ───────────────────────────────────────────────────────
  { id:'ironman3', title:'Homem de Ferro 3', year:2013, runtime:130, kind:'Filme', phase:'FASE 2', universe:'mcu', essential:false, multiverse:false, tags:[['Pós-Nova York','steel']], brief:'Tony lida com o trauma e o Mandarim.' },
  { id:'thor2', title:'Thor: O Mundo Sombrio', year:2013, runtime:112, kind:'Filme', phase:'FASE 2', universe:'mcu', essential:false, multiverse:false, tags:[['Joia da Realidade','steel']], brief:'O Éter, os Elfos Negros e Loki traiçoeiro.' },
  { id:'wolverine', title:'Wolverine: Imortal', year:2013, runtime:126, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:false, tags:[['Logan no Japão','steel']], brief:'Logan perde a imortalidade por um tempo.' },
  { id:'cap2', title:'Capitão América: O Soldado Invernal', year:2014, runtime:136, kind:'Filme', phase:'FASE 2', universe:'mcu', essential:false, multiverse:false, tags:[['Bucky Barnes','emerald']], brief:'A S.H.I.E.L.D. cai e Bucky volta como arma.' },
  { id:'asm2', title:'O Espetacular Homem-Aranha 2', year:2014, runtime:142, kind:'Filme', phase:'SONY', universe:'sony', essential:false, multiverse:true, tags:[['Electro','steel']], brief:'Electro e a perda de Gwen Stacy.' },
  { id:'dofp', title:'X-Men: Dias de um Futuro Esquecido', year:2014, runtime:132, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:true, tags:[['Linhas do tempo','emerald'],['Elenco de Doomsday','gold']], brief:'Viagem no tempo une os X-Men antigos e os jovens.' },
  { id:'gotg', title:'Guardiões da Galáxia', year:2014, runtime:121, kind:'Filme', phase:'FASE 2', universe:'mcu', essential:false, multiverse:false, tags:[['Joia do Poder','steel']], brief:'Um bando de desajustados salva a galáxia.' },
  { id:'aou', title:'Vingadores: Era de Ultron', year:2015, runtime:141, kind:'Filme', phase:'FASE 2', universe:'mcu', essential:false, multiverse:false, tags:[['Origem de Wanda e Visão','steel']], brief:'Ultron, Wanda Maximoff e o nascimento do Visão.' },
  { id:'antman', title:'Homem-Formiga', year:2015, runtime:117, kind:'Filme', phase:'FASE 2', universe:'mcu', essential:false, multiverse:false, tags:[['Reino Quântico','emerald']], brief:'Scott Lang encolhe e descobre o Reino Quântico.' },

  // ── MCU Fase 3 ───────────────────────────────────────────────────────
  { id:'deadpool', title:'Deadpool', year:2016, runtime:108, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:false, tags:[['Mercenário tagarela','steel']], brief:'Wade Wilson ganha a cura e perde o rosto.' },
  { id:'civilwar', title:'Capitão América: Guerra Civil', year:2016, runtime:147, kind:'Filme', phase:'FASE 3', universe:'mcu', essential:false, multiverse:false, tags:[['Acordos de Sokovia','steel']], brief:'Os Vingadores se dividem. Chegam Pantera Negra e Homem-Aranha.' },
  { id:'apocalypse', title:'X-Men: Apocalipse', year:2016, runtime:144, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:false, tags:[['X-Men dos anos 80','steel']], brief:'O primeiro mutante desperta.' },
  { id:'strange', title:'Doutor Estranho', year:2016, runtime:115, kind:'Filme', phase:'FASE 3', universe:'mcu', essential:false, multiverse:true, tags:[['Protocolo Arcano','steel']], brief:'Stephen Strange aprende que existe um multiverso.' },
  { id:'logan', title:'Logan', year:2017, runtime:137, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:false, tags:[['Adeus a Xavier','steel']], brief:'O último capítulo de Logan e Charles.' },
  { id:'gotg2', title:'Guardiões da Galáxia Vol. 2', year:2017, runtime:136, kind:'Filme', phase:'FASE 3', universe:'mcu', essential:false, multiverse:false, tags:[['Ego, o Planeta Vivo','steel']], brief:'Peter Quill conhece o pai.' },
  { id:'homecoming', title:'Homem-Aranha: De Volta ao Lar', year:2017, runtime:133, kind:'Filme', phase:'FASE 3', universe:'mcu', essential:false, multiverse:false, tags:[['Peter Parker do MCU','steel']], brief:'Peter tenta provar que já é um Vingador.' },
  { id:'ragnarok', title:'Thor: Ragnarok', year:2017, runtime:130, kind:'Filme', phase:'FASE 3', universe:'mcu', essential:false, multiverse:false, tags:[['Queda de Asgard','steel']], brief:'Hela, Hulk gladiador e o fim de Asgard.' },
  { id:'bp', title:'Pantera Negra', year:2018, runtime:134, kind:'Filme', phase:'FASE 3', universe:'mcu', essential:false, multiverse:false, tags:[['Wakanda','emerald']], brief:'T\'Challa assume o trono de Wakanda.' },
  { id:'iw', title:'Vingadores: Guerra Infinita', year:2018, runtime:149, kind:'Filme', phase:'FASE 3', universe:'mcu', essential:true, multiverse:false, tags:[['O Estalo','gold']], brief:'Thanos reúne as Joias do Infinito.' },
  { id:'deadpool2', title:'Deadpool 2', year:2018, runtime:119, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:false, tags:[['X-Force','steel']], brief:'Cable, Domino e a X-Force (por alguns segundos).' },
  { id:'antman2', title:'Homem-Formiga e a Vespa', year:2018, runtime:118, kind:'Filme', phase:'FASE 3', universe:'mcu', essential:false, multiverse:false, tags:[['Reino Quântico','emerald']], brief:'O resgate de Janet van Dyne.' },
  { id:'marvel', title:'Capitã Marvel', year:2019, runtime:123, kind:'Filme', phase:'FASE 3', universe:'mcu', essential:false, multiverse:false, tags:[['Skrulls','steel']], brief:'Carol Danvers nos anos 90.' },
  { id:'endgame', title:'Vingadores: Ultimato', year:2019, runtime:181, kind:'Filme', phase:'FASE 3', universe:'mcu', essential:true, multiverse:true, tags:[['Assalto no Tempo','gold'],['Ramificação de Loki','emerald']], brief:'O assalto no tempo — e o Loki que fugiu com o Tesseract.' },
  { id:'darkphoenix', title:'X-Men: Fênix Negra', year:2019, runtime:114, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:false, tags:[['Fim da era Fox','steel']], brief:'Jean Grey perde o controle.' },
  { id:'ffh', title:'Homem-Aranha: Longe de Casa', year:2019, runtime:129, kind:'Filme', phase:'FASE 3', universe:'mcu', essential:false, multiverse:true, tags:[['"Multiverso" de Mysterio','steel']], brief:'Mysterio vende uma mentira sobre o multiverso.' },

  // ── MCU Fase 4 ───────────────────────────────────────────────────────
  { id:'wv', title:'WandaVision', year:2021, runtime:350, kind:'Série · 9 Ep', phase:'FASE 4', universe:'mcu', essential:false, multiverse:false, tags:[['Magia do Caos','steel']], brief:'Wanda reescreve a realidade. Surge o Darkhold.' },
  { id:'fws', title:'Falcão e o Soldado Invernal', year:2021, runtime:300, kind:'Série · 6 Ep', phase:'FASE 4', universe:'mcu', essential:false, multiverse:false, tags:[['Novo Capitão América','steel']], brief:'Sam Wilson aceita o escudo.' },
  { id:'loki1', title:'Loki — 1ª Temporada', year:2021, runtime:305, kind:'Série · 6 Ep', phase:'FASE 4', universe:'mcu', essential:true, multiverse:true, tags:[['Âncora do Multiverso','emerald'],['Risco de Incursão: Alto','gold']], brief:'A Linha do Tempo Sagrada se rompe. Aquele Que Permanece cai.' },
  { id:'blackwidow', title:'Viúva Negra', year:2021, runtime:134, kind:'Filme', phase:'FASE 4', universe:'mcu', essential:false, multiverse:false, tags:[['Origem de Yelena','emerald']], brief:'Natasha, Yelena e o Guardião Vermelho.' },
  { id:'whatif1', title:'What If...? — 1ª Temporada', year:2021, runtime:300, kind:'Série · 9 Ep', phase:'FASE 4', universe:'mcu', essential:false, multiverse:true, tags:[['Catálogo de Variantes','steel']], brief:'O Vigia observa realidades alternativas.' },
  { id:'shangchi', title:'Shang-Chi e a Lenda dos Dez Anéis', year:2021, runtime:132, kind:'Filme', phase:'FASE 4', universe:'mcu', essential:false, multiverse:false, tags:[['Os Dez Anéis','steel']], brief:'O filho de Wenwu enfrenta o legado do pai.' },
  { id:'eternals', title:'Eternos', year:2021, runtime:156, kind:'Filme', phase:'FASE 4', universe:'mcu', essential:false, multiverse:false, tags:[['Hierarquia Cósmica','steel']], brief:'Os Celestiais revelam a escala do que existe além da Terra.' },
  { id:'hawkeye', title:'Gavião Arqueiro', year:2021, runtime:290, kind:'Série · 6 Ep', phase:'FASE 4', universe:'mcu', essential:false, multiverse:false, tags:[['Kate Bishop','steel']], brief:'Clint Barton passa o arco para Kate Bishop.' },
  { id:'nwh', title:'Homem-Aranha: Sem Volta para Casa', year:2021, runtime:148, kind:'Filme', phase:'FASE 4', universe:'mcu', essential:true, multiverse:true, tags:[['Risco de Incursão: Alto','gold'],['Âncora do Multiverso','emerald']], brief:'Um feitiço mal feito derruba as paredes entre mundos.' },
  { id:'moonknight', title:'Cavaleiro da Lua', year:2022, runtime:290, kind:'Série · 6 Ep', phase:'FASE 4', universe:'mcu', essential:false, multiverse:false, tags:[['Deuses do Egito','steel']], brief:'Marc Spector e Steven Grant dividem um corpo.' },
  { id:'mom', title:'Doutor Estranho no Multiverso da Loucura', year:2022, runtime:126, kind:'Filme', phase:'FASE 4', universe:'mcu', essential:true, multiverse:true, tags:[['Incursões Confirmadas','gold'],['Protocolo Arcano','steel']], brief:'As incursões ganham nome. A feitiçaria encontra o multiverso.' },
  { id:'msmarvel', title:'Ms. Marvel', year:2022, runtime:280, kind:'Série · 6 Ep', phase:'FASE 4', universe:'mcu', essential:false, multiverse:false, tags:[['"Mutante"','steel']], brief:'Kamala Khan — e a primeira palavra "mutante" do MCU.' },
  { id:'loveandthunder', title:'Thor: Amor e Trovão', year:2022, runtime:119, kind:'Filme', phase:'FASE 4', universe:'mcu', essential:false, multiverse:false, tags:[['Gorr','steel']], brief:'Thor, Jane Foster e o Carniceiro dos Deuses.' },
  { id:'shehulk', title:'Mulher-Hulk: Defensora de Heróis', year:2022, runtime:290, kind:'Série · 9 Ep', phase:'FASE 4', universe:'mcu', essential:false, multiverse:false, tags:[['Comédia jurídica','steel']], brief:'Jennifer Walters advoga para super-humanos.' },
  { id:'wakanda', title:'Pantera Negra: Wakanda para Sempre', year:2022, runtime:161, kind:'Filme', phase:'FASE 4', universe:'mcu', essential:false, multiverse:false, tags:[['Namor & Talokan','emerald'],['Elenco de Doomsday','gold']], brief:'Shuri assume o manto; Namor surge das profundezas.' },

  // ── MCU Fase 5 ───────────────────────────────────────────────────────
  { id:'quantumania', title:'Homem-Formiga e a Vespa: Quantumania', year:2023, runtime:125, kind:'Filme', phase:'FASE 5', universe:'mcu', essential:false, multiverse:true, tags:[['Conselho dos Kangs','steel']], brief:'O Reino Quântico esconde um conquistador exilado.' },
  { id:'gotg3', title:'Guardiões da Galáxia Vol. 3', year:2023, runtime:150, kind:'Filme', phase:'FASE 5', universe:'mcu', essential:false, multiverse:false, tags:[['Origem do Rocket','steel']], brief:'O passado de Rocket e o fim dos Guardiões.' },
  { id:'secretinvasion', title:'Invasão Secreta', year:2023, runtime:260, kind:'Série · 6 Ep', phase:'FASE 5', universe:'mcu', essential:false, multiverse:false, tags:[['Skrulls','steel']], brief:'Nick Fury contra Skrulls infiltrados.' },
  { id:'loki2', title:'Loki — 2ª Temporada', year:2023, runtime:290, kind:'Série · 6 Ep', phase:'FASE 5', universe:'mcu', essential:true, multiverse:true, tags:[['Âncora do Multiverso','emerald'],['Tear Temporal','steel']], brief:'Um novo deus passa a sustentar os ramos.' },
  { id:'marvels', title:'As Marvels', year:2023, runtime:105, kind:'Filme', phase:'FASE 5', universe:'mcu', essential:false, multiverse:true, tags:[['Brecha para os X-Men','gold']], brief:'Carol, Monica e Kamala — e uma porta para outro universo.' },
  { id:'whatif2', title:'What If...? — 2ª Temporada', year:2023, runtime:300, kind:'Série · 9 Ep', phase:'FASE 5', universe:'mcu', essential:false, multiverse:true, tags:[['Catálogo de Variantes','steel']], brief:'Mais realidades vigiadas pelo Vigia.' },
  { id:'echo', title:'Eco', year:2024, runtime:230, kind:'Série · 5 Ep', phase:'FASE 5', universe:'mcu', essential:false, multiverse:false, tags:[['Rei do Crime','steel']], brief:'Maya Lopez enfrenta Wilson Fisk.' },
  { id:'xmen97', title:"X-Men '97", year:2024, runtime:300, kind:'Série · 10 Ep', phase:'ANIMAÇÃO', universe:'mcu', essential:false, multiverse:false, tags:[['Mutantes','steel']], brief:'A animação clássica continua exatamente de onde parou.' },
  { id:'dw', title:'Deadpool & Wolverine', year:2024, runtime:128, kind:'Filme', phase:'FASE 5', universe:'mcu', essential:true, multiverse:true, tags:[['Protocolo do Ser Âncora','emerald'],['Risco de Incursão: Médio','gold']], brief:'A AVT poda uma linha do tempo moribunda. O Vazio cresce.' },
  { id:'agatha', title:'Agatha Desde Sempre', year:2024, runtime:330, kind:'Série · 9 Ep', phase:'FASE 5', universe:'mcu', essential:false, multiverse:false, tags:[['Estrada das Bruxas','steel']], brief:'Agatha Harkness busca recuperar seus poderes.' },
  { id:'whatif3', title:'What If...? — 3ª Temporada', year:2024, runtime:260, kind:'Série · 8 Ep', phase:'FASE 5', universe:'mcu', essential:false, multiverse:true, tags:[['Catálogo de Variantes','steel']], brief:'O último arquivo do Vigia.' },
  { id:'bnw', title:'Capitão América: Admirável Mundo Novo', year:2025, runtime:118, kind:'Filme', phase:'FASE 5', universe:'mcu', essential:false, multiverse:false, tags:[['Hulk Vermelho','steel']], brief:'Sam Wilson como Capitão América diante do Presidente Ross.' },
  { id:'daredevil', title:'Demolidor: Renascido', year:2025, runtime:400, kind:'Série · 9 Ep', phase:'FASE 5', universe:'mcu', essential:false, multiverse:false, tags:[['Hell\'s Kitchen','steel']], brief:'Matt Murdock contra o prefeito Wilson Fisk.' },
  { id:'tbolts', title:'Thunderbolts*', year:2025, runtime:127, kind:'Filme', phase:'FASE 5', universe:'mcu', essential:true, multiverse:false, tags:[['Nova Formação dos Vingadores','steel']], brief:'Agentes descartáveis se tornam algo maior.' },
  { id:'ironheart', title:'Coração de Ferro', year:2025, runtime:260, kind:'Série · 6 Ep', phase:'FASE 5', universe:'mcu', essential:false, multiverse:false, tags:[['Riri Williams','steel']], brief:'Riri Williams mistura tecnologia e magia.' },

  // ── MCU Fase 6 ───────────────────────────────────────────────────────
  { id:'ff', title:'Quarteto Fantástico: Primeiros Passos', year:2025, runtime:115, kind:'Filme', phase:'FASE 6', universe:'mcu', essential:true, multiverse:true, tags:[['Nexo de Origem do Doutor Destino','gold'],['Terra-828','emerald']], brief:'A Primeira Família da Terra-828 enfrenta Galactus. Destino desperta.' },
  { id:'bnd', title:'Homem-Aranha: Um Novo Dia', year:2026, runtime:null, kind:'Filme', phase:'FASE 6', universe:'mcu', essential:true, multiverse:false, tags:[['Pós-Sem Volta para Casa','steel']], brief:'Um Peter Parker esquecido por todos recomeça sozinho.' },
  { id:'doomsday', title:'Vingadores: Doomsday', year:2026, runtime:null, kind:'Filme', phase:'FASE 6', universe:'mcu', essential:true, multiverse:true, unreleased:true, tags:[['O Soberano Chega','gold'],['Risco de Incursão: Crítico','gold']], brief:'Victor Von Doom reivindica o multiverso.' },
];

export const SCOPES = [
  ['essential', 'Essenciais', m => m.essential],
  ['multiverse', 'Multiverso', m => m.multiverse],
  ['mcu', 'MCU completo', m => m.universe === 'mcu'],
  ['others', 'Outros universos', m => m.universe !== 'mcu'],
  ['all', 'Tudo', () => true],
];
