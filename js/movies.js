// Lista de alvos rumo a Vingadores: Doomsday, em ORDEM CRONOLÓGICA DA HISTÓRIA
// (MCU pela linha do tempo do Disney+; Fox/Sony pelo ano em que a história se passa).
// Campos:
//   id         identificador único (usado no banco — não mude depois de publicar)
//   title      título no Brasil
//   era        quando a história se passa (exibido como "Época")
//   year       ano de lançamento
//   runtime    duração total em minutos (séries: soma aproximada dos episódios); null = desconhecida
//   kind       "Filme" ou "Série · N Ep"
//   phase      fase do MCU ou estúdio de origem
//   universe   'mcu' | 'fox' | 'sony'
//   essential  tronco principal: lista oficial da Disney do que ver antes de Doomsday
//              (os demais aparecem como ramificações entre os essenciais)
//   multiverse faz parte da saga do multiverso / incursões
//   tags       [rótulo, tom] — tom: 'gold' | 'emerald' | 'steel'
//   brief      resumo de uma linha
//   poster     (opcional) URL de um pôster; sem ela o card mostra uma capa gerada
//   unreleased ainda não lançado

export const RELEASE_DATE = new Date(2026, 11, 18);

export const MOVIES = [
  // ── Anos 40 a 90 ──────────────────────────────────────────────────────
  { id:'cap1', era:'1943–45', title:'Capitão América: O Primeiro Vingador', year:2011, runtime:124, kind:'Filme', phase:'FASE 1', universe:'mcu', essential:true, multiverse:false, tags:[['Joia do Espaço','steel']], brief:'Steve Rogers, a Hydra e o Tesseract.' },
  { id:'firstclass', era:'1962', title:'X-Men: Primeira Classe', year:2011, runtime:132, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:false, tags:[['Xavier & Magneto jovens','steel']], brief:'Como Charles e Erik se tornaram amigos — e inimigos.' },
  { id:'dofp', era:'1973 / 2023', title:'X-Men: Dias de um Futuro Esquecido', year:2014, runtime:132, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:true, tags:[['Linhas do tempo','emerald'],['Elenco de Doomsday','gold']], brief:'Viagem no tempo une os X-Men antigos e os jovens.' },
  { id:'apocalypse', era:'1983', title:'X-Men: Apocalipse', year:2016, runtime:144, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:false, tags:[['X-Men dos anos 80','steel']], brief:'O primeiro mutante desperta.' },
  { id:'darkphoenix', era:'1992', title:'X-Men: Fênix Negra', year:2019, runtime:114, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:false, tags:[['Fim da era Fox','steel']], brief:'Jean Grey perde o controle.' },
  { id:'marvel', era:'1995', title:'Capitã Marvel', year:2019, runtime:123, kind:'Filme', phase:'FASE 3', universe:'mcu', essential:false, multiverse:false, tags:[['Skrulls','steel']], brief:'Carol Danvers nos anos 90.' },
  { id:'xmen97', era:'1997', title:"X-Men '97", year:2024, runtime:300, kind:'Série · 10 Ep', phase:'ANIMAÇÃO', universe:'mcu', essential:false, multiverse:false, tags:[['Mutantes','steel']], brief:'A animação clássica continua exatamente de onde parou.' },

  // ── Anos 2000 ─────────────────────────────────────────────────────────
  { id:'xmen', era:'~2000', title:'X-Men: O Filme', year:2000, runtime:104, kind:'Filme', phase:'FOX', universe:'fox', essential:true, multiverse:true, tags:[['Elenco de Doomsday','gold']], brief:'Xavier, Magneto e Ciclope: a equipe original que volta em Doomsday.' },
  { id:'spider1', era:'2002', title:'Homem-Aranha', year:2002, runtime:121, kind:'Filme', phase:'SONY', universe:'sony', essential:false, multiverse:true, tags:[['Variante de Sem Volta para Casa','steel']], brief:'O Peter Parker de Tobey Maguire ganha seus poderes.' },
  { id:'x2', era:'2003', title:'X-Men 2', year:2003, runtime:134, kind:'Filme', phase:'FOX', universe:'fox', essential:true, multiverse:true, tags:[['Elenco de Doomsday','gold']], brief:'Noturno e Stryker; a Fênix começa a despertar.' },
  { id:'spider2', era:'2004', title:'Homem-Aranha 2', year:2004, runtime:127, kind:'Filme', phase:'SONY', universe:'sony', essential:false, multiverse:true, tags:[['Doutor Octopus','steel']], brief:'Doc Ock — que depois atravessa para o MCU.' },
  { id:'ff2005', era:'2005', title:'Quarteto Fantástico', year:2005, runtime:106, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:false, tags:[['Primeiro Doom do cinema','gold']], brief:'A primeira família e um Victor Von Doom de terno.' },
  { id:'x3', era:'2006', title:'X-Men: O Confronto Final', year:2006, runtime:104, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:true, tags:[['Fim da trilogia original','steel']], brief:'A cura mutante e a Fênix Negra.' },
  { id:'spider3', era:'2007', title:'Homem-Aranha 3', year:2007, runtime:139, kind:'Filme', phase:'SONY', universe:'sony', essential:false, multiverse:true, tags:[['Homem-Areia','steel']], brief:'Venom, Homem-Areia e o Duende Macabro.' },
  { id:'ff2007', era:'2007', title:'Quarteto Fantástico e o Surfista Prateado', year:2007, runtime:92, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:false, tags:[['Arauto de Galactus','steel']], brief:'O Surfista Prateado anuncia Galactus.' },

  // ── Saga do Infinito ──────────────────────────────────────────────────
  { id:'ironman', era:'2008', title:'Homem de Ferro', year:2008, runtime:126, kind:'Filme', phase:'FASE 1', universe:'mcu', essential:false, multiverse:false, tags:[['Origem do MCU','steel']], brief:'Tony Stark constrói a armadura e o MCU nasce.' },
  { id:'ironman2', era:'2010', title:'Homem de Ferro 2', year:2010, runtime:124, kind:'Filme', phase:'FASE 1', universe:'mcu', essential:false, multiverse:false, tags:[['Iniciativa Vingadores','steel']], brief:'Máquina de Combate e a Viúva Negra entram em cena.' },
  { id:'hulk', era:'2010', title:'O Incrível Hulk', year:2008, runtime:112, kind:'Filme', phase:'FASE 1', universe:'mcu', essential:false, multiverse:false, tags:[['Ross & Samuel Sterns','steel']], brief:'Bruce Banner em fuga do General Ross.' },
  { id:'thor', era:'2010', title:'Thor', year:2011, runtime:115, kind:'Filme', phase:'FASE 1', universe:'mcu', essential:false, multiverse:false, tags:[['Origem de Loki','emerald']], brief:'Thor é banido e Loki mostra quem é.' },
  { id:'asm', era:'2012', title:'O Espetacular Homem-Aranha', year:2012, runtime:136, kind:'Filme', phase:'SONY', universe:'sony', essential:false, multiverse:true, tags:[['Variante de Sem Volta para Casa','steel']], brief:'O Peter Parker de Andrew Garfield.' },
  { id:'avengers', era:'2012', title:'Os Vingadores', year:2012, runtime:143, kind:'Filme', phase:'FASE 1', universe:'mcu', essential:true, multiverse:false, tags:[['Os Vingadores se formam','steel']], brief:'A primeira reunião dos heróis mais poderosos da Terra.' },
  { id:'thor2', era:'2013', title:'Thor: O Mundo Sombrio', year:2013, runtime:112, kind:'Filme', phase:'FASE 2', universe:'mcu', essential:false, multiverse:false, tags:[['Joia da Realidade','steel']], brief:'O Éter, os Elfos Negros e Loki traiçoeiro.' },
  { id:'ironman3', era:'2013', title:'Homem de Ferro 3', year:2013, runtime:130, kind:'Filme', phase:'FASE 2', universe:'mcu', essential:false, multiverse:false, tags:[['Pós-Nova York','steel']], brief:'Tony lida com o trauma e o Mandarim.' },
  { id:'wolverine', era:'2013', title:'Wolverine: Imortal', year:2013, runtime:126, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:false, tags:[['Logan no Japão','steel']], brief:'Logan perde a imortalidade por um tempo.' },
  { id:'cap2', era:'2014', title:'Capitão América: O Soldado Invernal', year:2014, runtime:136, kind:'Filme', phase:'FASE 2', universe:'mcu', essential:false, multiverse:false, tags:[['Bucky Barnes','emerald']], brief:'A S.H.I.E.L.D. cai e Bucky volta como arma.' },
  { id:'asm2', era:'2014', title:'O Espetacular Homem-Aranha 2', year:2014, runtime:142, kind:'Filme', phase:'SONY', universe:'sony', essential:false, multiverse:true, tags:[['Electro','steel']], brief:'Electro e a perda de Gwen Stacy.' },
  { id:'gotg', era:'2014', title:'Guardiões da Galáxia', year:2014, runtime:121, kind:'Filme', phase:'FASE 2', universe:'mcu', essential:false, multiverse:false, tags:[['Joia do Poder','steel']], brief:'Um bando de desajustados salva a galáxia.' },
  { id:'gotg2', era:'2014', title:'Guardiões da Galáxia Vol. 2', year:2017, runtime:136, kind:'Filme', phase:'FASE 3', universe:'mcu', essential:false, multiverse:false, tags:[['Ego, o Planeta Vivo','steel']], brief:'Peter Quill conhece o pai.' },
  { id:'aou', era:'2015', title:'Vingadores: Era de Ultron', year:2015, runtime:141, kind:'Filme', phase:'FASE 2', universe:'mcu', essential:false, multiverse:false, tags:[['Origem de Wanda e Visão','steel']], brief:'Ultron, Wanda Maximoff e o nascimento do Visão.' },
  { id:'antman', era:'2015', title:'Homem-Formiga', year:2015, runtime:117, kind:'Filme', phase:'FASE 2', universe:'mcu', essential:false, multiverse:false, tags:[['Reino Quântico','emerald']], brief:'Scott Lang encolhe e descobre o Reino Quântico.' },
  { id:'civilwar', era:'2016', title:'Capitão América: Guerra Civil', year:2016, runtime:147, kind:'Filme', phase:'FASE 3', universe:'mcu', essential:false, multiverse:false, tags:[['Acordos de Sokovia','steel']], brief:'Os Vingadores se dividem. Chegam Pantera Negra e Homem-Aranha.' },
  { id:'blackwidow', era:'2016', title:'Viúva Negra', year:2021, runtime:134, kind:'Filme', phase:'FASE 4', universe:'mcu', essential:false, multiverse:false, tags:[['Origem de Yelena','emerald']], brief:'Natasha, Yelena e o Guardião Vermelho.' },
  { id:'bp', era:'2016', title:'Pantera Negra', year:2018, runtime:134, kind:'Filme', phase:'FASE 3', universe:'mcu', essential:false, multiverse:false, tags:[['Wakanda','emerald']], brief:'T\'Challa assume o trono de Wakanda.' },
  { id:'deadpool', era:'2016', title:'Deadpool', year:2016, runtime:108, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:false, tags:[['Mercenário tagarela','steel']], brief:'Wade Wilson ganha a cura e perde o rosto.' },
  { id:'homecoming', era:'2016', title:'Homem-Aranha: De Volta ao Lar', year:2017, runtime:133, kind:'Filme', phase:'FASE 3', universe:'mcu', essential:false, multiverse:false, tags:[['Peter Parker do MCU','steel']], brief:'Peter tenta provar que já é um Vingador.' },
  { id:'strange', era:'2016–17', title:'Doutor Estranho', year:2016, runtime:115, kind:'Filme', phase:'FASE 3', universe:'mcu', essential:false, multiverse:true, tags:[['Protocolo Arcano','steel']], brief:'Stephen Strange aprende que existe um multiverso.' },
  { id:'ragnarok', era:'2017', title:'Thor: Ragnarok', year:2017, runtime:130, kind:'Filme', phase:'FASE 3', universe:'mcu', essential:false, multiverse:false, tags:[['Queda de Asgard','steel']], brief:'Hela, Hulk gladiador e o fim de Asgard.' },
  { id:'antman2', era:'2018', title:'Homem-Formiga e a Vespa', year:2018, runtime:118, kind:'Filme', phase:'FASE 3', universe:'mcu', essential:false, multiverse:false, tags:[['Reino Quântico','emerald']], brief:'O resgate de Janet van Dyne.' },
  { id:'deadpool2', era:'2018', title:'Deadpool 2', year:2018, runtime:119, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:false, tags:[['X-Force','steel']], brief:'Cable, Domino e a X-Force (por alguns segundos).' },
  { id:'iw', era:'2018', title:'Vingadores: Guerra Infinita', year:2018, runtime:149, kind:'Filme', phase:'FASE 3', universe:'mcu', essential:true, multiverse:false, tags:[['O Estalo','gold']], brief:'Thanos reúne as Joias do Infinito.' },
  { id:'endgame', era:'2018–2023', title:'Vingadores: Ultimato', year:2019, runtime:181, kind:'Filme', phase:'FASE 3', universe:'mcu', essential:true, multiverse:true, tags:[['Assalto no Tempo','gold'],['Ramificação de Loki','emerald']], brief:'O assalto no tempo — e o Loki que fugiu com o Tesseract.' },

  // ── Pós-Ultimato ──────────────────────────────────────────────────────
  { id:'loki1', era:'fora do tempo', title:'Loki — 1ª Temporada', year:2021, runtime:305, kind:'Série · 6 Ep', phase:'FASE 4', universe:'mcu', essential:true, multiverse:true, tags:[['Âncora do Multiverso','emerald'],['Risco de Incursão: Alto','gold']], brief:'A Linha do Tempo Sagrada se rompe. Aquele Que Permanece cai.' },
  { id:'whatif1', era:'fora do tempo', title:'What If...? — 1ª Temporada', year:2021, runtime:300, kind:'Série · 9 Ep', phase:'FASE 4', universe:'mcu', essential:false, multiverse:true, tags:[['Catálogo de Variantes','steel']], brief:'O Vigia observa realidades alternativas.' },
  { id:'wv', era:'2023', title:'WandaVision', year:2021, runtime:350, kind:'Série · 9 Ep', phase:'FASE 4', universe:'mcu', essential:false, multiverse:false, tags:[['Magia do Caos','steel']], brief:'Wanda reescreve a realidade. Surge o Darkhold.' },
  { id:'shangchi', era:'2024', title:'Shang-Chi e a Lenda dos Dez Anéis', year:2021, runtime:132, kind:'Filme', phase:'FASE 4', universe:'mcu', essential:true, multiverse:false, tags:[['Os Dez Anéis','steel']], brief:'O filho de Wenwu enfrenta o legado do pai.' },
  { id:'fws', era:'2024', title:'Falcão e o Soldado Invernal', year:2021, runtime:300, kind:'Série · 6 Ep', phase:'FASE 4', universe:'mcu', essential:false, multiverse:false, tags:[['Novo Capitão América','steel']], brief:'Sam Wilson aceita o escudo.' },
  { id:'ffh', era:'2024', title:'Homem-Aranha: Longe de Casa', year:2019, runtime:129, kind:'Filme', phase:'FASE 3', universe:'mcu', essential:false, multiverse:true, tags:[['"Multiverso" de Mysterio','steel']], brief:'Mysterio vende uma mentira sobre o multiverso.' },
  { id:'eternals', era:'2024', title:'Eternos', year:2021, runtime:156, kind:'Filme', phase:'FASE 4', universe:'mcu', essential:false, multiverse:false, tags:[['Hierarquia Cósmica','steel']], brief:'Os Celestiais revelam a escala do que existe além da Terra.' },
  { id:'nwh', era:'2024', title:'Homem-Aranha: Sem Volta para Casa', year:2021, runtime:148, kind:'Filme', phase:'FASE 4', universe:'mcu', essential:true, multiverse:true, tags:[['Risco de Incursão: Alto','gold'],['Âncora do Multiverso','emerald']], brief:'Um feitiço mal feito derruba as paredes entre mundos.' },
  { id:'hawkeye', era:'2024', title:'Gavião Arqueiro', year:2021, runtime:290, kind:'Série · 6 Ep', phase:'FASE 4', universe:'mcu', essential:false, multiverse:false, tags:[['Kate Bishop','steel']], brief:'Clint Barton passa o arco para Kate Bishop.' },
  { id:'mom', era:'2025', title:'Doutor Estranho no Multiverso da Loucura', year:2022, runtime:126, kind:'Filme', phase:'FASE 4', universe:'mcu', essential:true, multiverse:true, tags:[['Incursões Confirmadas','gold'],['Protocolo Arcano','steel']], brief:'As incursões ganham nome. A feitiçaria encontra o multiverso.' },
  { id:'moonknight', era:'2025', title:'Cavaleiro da Lua', year:2022, runtime:290, kind:'Série · 6 Ep', phase:'FASE 4', universe:'mcu', essential:false, multiverse:false, tags:[['Deuses do Egito','steel']], brief:'Marc Spector e Steven Grant dividem um corpo.' },
  { id:'wakanda', era:'2025', title:'Pantera Negra: Wakanda para Sempre', year:2022, runtime:161, kind:'Filme', phase:'FASE 4', universe:'mcu', essential:true, multiverse:false, tags:[['Namor & Talokan','emerald'],['Elenco de Doomsday','gold']], brief:'Shuri assume o manto; Namor surge das profundezas.' },
  { id:'echo', era:'2025', title:'Eco', year:2024, runtime:230, kind:'Série · 5 Ep', phase:'FASE 5', universe:'mcu', essential:false, multiverse:false, tags:[['Rei do Crime','steel']], brief:'Maya Lopez enfrenta Wilson Fisk.' },
  { id:'shehulk', era:'2025', title:'Mulher-Hulk: Defensora de Heróis', year:2022, runtime:290, kind:'Série · 9 Ep', phase:'FASE 4', universe:'mcu', essential:false, multiverse:false, tags:[['Comédia jurídica','steel']], brief:'Jennifer Walters advoga para super-humanos.' },
  { id:'msmarvel', era:'2025', title:'Ms. Marvel', year:2022, runtime:280, kind:'Série · 6 Ep', phase:'FASE 4', universe:'mcu', essential:false, multiverse:false, tags:[['"Mutante"','steel']], brief:'Kamala Khan — e a primeira palavra "mutante" do MCU.' },
  { id:'loveandthunder', era:'2025', title:'Thor: Amor e Trovão', year:2022, runtime:119, kind:'Filme', phase:'FASE 4', universe:'mcu', essential:false, multiverse:false, tags:[['Gorr','steel']], brief:'Thor, Jane Foster e o Carniceiro dos Deuses.' },

  // ── Saga do Multiverso ────────────────────────────────────────────────
  { id:'quantumania', era:'2025–26', title:'Homem-Formiga e a Vespa: Quantumania', year:2023, runtime:125, kind:'Filme', phase:'FASE 5', universe:'mcu', essential:false, multiverse:true, tags:[['Conselho dos Kangs','steel']], brief:'O Reino Quântico esconde um conquistador exilado.' },
  { id:'gotg3', era:'2026', title:'Guardiões da Galáxia Vol. 3', year:2023, runtime:150, kind:'Filme', phase:'FASE 5', universe:'mcu', essential:false, multiverse:false, tags:[['Origem do Rocket','steel']], brief:'O passado de Rocket e o fim dos Guardiões.' },
  { id:'secretinvasion', era:'2026', title:'Invasão Secreta', year:2023, runtime:260, kind:'Série · 6 Ep', phase:'FASE 5', universe:'mcu', essential:false, multiverse:false, tags:[['Skrulls','steel']], brief:'Nick Fury contra Skrulls infiltrados.' },
  { id:'marvels', era:'2026', title:'As Marvels', year:2023, runtime:105, kind:'Filme', phase:'FASE 5', universe:'mcu', essential:false, multiverse:true, tags:[['Brecha para os X-Men','gold']], brief:'Carol, Monica e Kamala — e uma porta para outro universo.' },
  { id:'loki2', era:'fora do tempo', title:'Loki — 2ª Temporada', year:2023, runtime:290, kind:'Série · 6 Ep', phase:'FASE 5', universe:'mcu', essential:true, multiverse:true, tags:[['Âncora do Multiverso','emerald'],['Tear Temporal','steel']], brief:'Um novo deus passa a sustentar os ramos.' },
  { id:'whatif2', era:'fora do tempo', title:'What If...? — 2ª Temporada', year:2023, runtime:300, kind:'Série · 9 Ep', phase:'FASE 5', universe:'mcu', essential:false, multiverse:true, tags:[['Catálogo de Variantes','steel']], brief:'Mais realidades vigiadas pelo Vigia.' },
  { id:'whatif3', era:'fora do tempo', title:'What If...? — 3ª Temporada', year:2024, runtime:260, kind:'Série · 8 Ep', phase:'FASE 5', universe:'mcu', essential:false, multiverse:true, tags:[['Catálogo de Variantes','steel']], brief:'O último arquivo do Vigia.' },
  { id:'dw', era:'2024', title:'Deadpool & Wolverine', year:2024, runtime:128, kind:'Filme', phase:'FASE 5', universe:'mcu', essential:true, multiverse:true, tags:[['Protocolo do Ser Âncora','emerald'],['Risco de Incursão: Médio','gold']], brief:'A AVT poda uma linha do tempo moribunda. O Vazio cresce.' },
  { id:'agatha', era:'2026', title:'Agatha Desde Sempre', year:2024, runtime:330, kind:'Série · 9 Ep', phase:'FASE 5', universe:'mcu', essential:false, multiverse:false, tags:[['Estrada das Bruxas','steel']], brief:'Agatha Harkness busca recuperar seus poderes.' },
  { id:'daredevil', era:'2026', title:'Demolidor: Renascido', year:2025, runtime:400, kind:'Série · 9 Ep', phase:'FASE 5', universe:'mcu', essential:false, multiverse:false, tags:[['Hell\'s Kitchen','steel']], brief:'Matt Murdock contra o prefeito Wilson Fisk.' },
  { id:'bnw', era:'2027', title:'Capitão América: Admirável Mundo Novo', year:2025, runtime:118, kind:'Filme', phase:'FASE 5', universe:'mcu', essential:true, multiverse:false, tags:[['Hulk Vermelho','steel']], brief:'Sam Wilson como Capitão América diante do Presidente Ross.' },
  { id:'tbolts', era:'2027', title:'Thunderbolts*', year:2025, runtime:127, kind:'Filme', phase:'FASE 5', universe:'mcu', essential:true, multiverse:false, tags:[['Nova Formação dos Vingadores','steel']], brief:'Agentes descartáveis se tornam algo maior.' },
  { id:'ironheart', era:'2027', title:'Coração de Ferro', year:2025, runtime:260, kind:'Série · 6 Ep', phase:'FASE 5', universe:'mcu', essential:false, multiverse:false, tags:[['Riri Williams','steel']], brief:'Riri Williams mistura tecnologia e magia.' },
  { id:'bnd', era:'2027+', title:'Homem-Aranha: Um Novo Dia', year:2026, runtime:null, kind:'Filme', phase:'FASE 6', universe:'mcu', essential:false, multiverse:false, tags:[['Pós-Sem Volta para Casa','steel']], brief:'Um Peter Parker esquecido por todos recomeça sozinho.' },
  { id:'logan', era:'2029', title:'Logan', year:2017, runtime:137, kind:'Filme', phase:'FOX', universe:'fox', essential:false, multiverse:false, tags:[['Adeus a Xavier','steel']], brief:'O último capítulo de Logan e Charles.' },
  { id:'ff', era:'Terra-828', title:'Quarteto Fantástico: Primeiros Passos', year:2025, runtime:115, kind:'Filme', phase:'FASE 6', universe:'mcu', essential:true, multiverse:true, tags:[['Nexo de Origem do Doutor Destino','gold'],['Terra-828','emerald']], brief:'A Primeira Família da Terra-828 enfrenta Galactus. Destino desperta.' },
  { id:'doomsday', era:'classificada', title:'Vingadores: Doomsday', year:2026, runtime:null, kind:'Filme', phase:'FASE 6', universe:'mcu', essential:true, multiverse:true, unreleased:true, tags:[['O Soberano Chega','gold'],['Risco de Incursão: Crítico','gold']], brief:'Victor Von Doom reivindica o multiverso.' },
];

// Frase do "Arquivo Doom" exibida quando o título está em foco.
export const DOOM_LINES = {
  xmen: 'Mutantes. Úteis, se ajoelharem.',
  spider1: 'Um garoto com teias. Irrelevante — por ora.',
  x2: 'Stryker tentou dominar mutantes. Amador.',
  spider2: 'Um gênio com braços de metal. Quase digno.',
  ff2005: 'Um Destino de terno. Uma afronta ao nome.',
  x3: 'A Fênix queima. Destino observa as cinzas.',
  spider3: 'Um simbionte busca um mestre. Encontrará um.',
  ff2007: 'O arauto anuncia. Destino rouba o poder.',
  ironman: 'Um mercador de armas vestiu metal. Destino já vestia.',
  hulk: 'Força sem mente. Previsível.',
  ironman2: 'Iniciativas, acordos, promessas. Frágeis.',
  thor: 'Deuses caem do céu. Destino não se impressiona.',
  cap1: 'Um soldado congelado no tempo. Paciência — Destino a tem.',
  avengers: 'Heróis se reúnem. Destino anota os nomes.',
  firstclass: 'Amizades que viram guerra. Destino prefere assim.',
  asm: 'Outra teia, outro mundo. O multiverso se repete.',
  ironman3: 'O Mandarim era um ator. Destino não interpreta.',
  thor2: 'A Joia da Realidade — uma ferramenta desperdiçada.',
  wolverine: 'Imortalidade, perdida por descuido.',
  cap2: 'A Hydra sussurra dentro da S.H.I.E.L.D. Destino fala alto.',
  asm2: 'Perder alguém não é desculpa para falhar.',
  dofp: 'Dois tempos, um destino. Destino aprova.',
  gotg: 'Desajustados com uma Joia. Sorte, não mérito.',
  aou: 'Uma máquina quis salvar o mundo. Destino quer governá-lo.',
  antman: 'O Reino Quântico: portas que Destino abrirá.',
  deadpool: 'Um mercenário que fala demais. Destino o silenciará.',
  civilwar: 'Os Vingadores se dividem. Destino agradece.',
  apocalypse: 'O primeiro mutante. O último desafio? Não.',
  strange: 'O multiverso se revela. Destino já sabia.',
  logan: 'Heróis envelhecem. Destino não.',
  gotg2: 'Um planeta que se achava deus. Pequeno.',
  homecoming: 'Um aprendiz tentando ser herói.',
  ragnarok: 'Asgard cai. Tronos vazios chamam por um soberano.',
  bp: 'Vibranium. Latvéria tomará nota.',
  iw: 'Metade da vida, apagada. Destino faria melhor.',
  deadpool2: 'Viagem no tempo por capricho. Imprudente.',
  antman2: 'O quântico se abre um pouco mais.',
  marvel: 'Poder cósmico sem visão. Desperdício.',
  endgame: 'O tempo foi saqueado. Uma ramificação escapou.',
  darkphoenix: 'Poder demais, controle de menos.',
  ffh: 'Um mentiroso vende o multiverso. Destino o entrega.',
  wv: 'O Darkhold desperta. Destino toma nota.',
  fws: 'Um escudo muda de mãos. Símbolos são frágeis.',
  loki1: 'O trono do tempo está vazio.',
  blackwidow: 'Espiãs treinadas para obedecer. Úteis.',
  whatif1: 'Cada ramo, um reino a conquistar.',
  shangchi: 'Dez anéis. Um só governante.',
  eternals: 'Deuses são apenas rivais.',
  hawkeye: 'Arcos e flechas. Destino sorri.',
  nwh: 'As paredes entre mundos ficam finas.',
  moonknight: 'Deuses do Egito disputam um homem partido.',
  mom: 'Incursões — o primeiro movimento de Destino.',
  msmarvel: 'A palavra "mutante" é dita. O tabuleiro cresce.',
  loveandthunder: 'Um carniceiro de deuses. Destino aprova o método.',
  shehulk: 'Leis humanas. Destino as reescreverá.',
  wakanda: 'Dois reinos em guerra. Destino observa o vibranium.',
  quantumania: 'Conquistadores caem. Destino permanece.',
  gotg3: 'Criaturas feitas para servir se rebelam.',
  secretinvasion: 'Rostos falsos por toda parte. Destino usa máscara por escolha.',
  loki2: 'Um novo deus prende os ramos. Por enquanto.',
  marvels: 'Uma brecha para outro universo. Destino atravessará.',
  whatif2: 'Mais realidades. Mais territórios.',
  echo: 'O Rei do Crime governa uma cidade. Pequeno demais.',
  xmen97: 'Mutantes lutam por um lugar. Latvéria oferece um.',
  dw: 'O Vazio tem fome. Destino não espera.',
  agatha: 'Bruxas na estrada. A magia de Destino é mais antiga.',
  whatif3: 'O Vigia fecha o arquivo. Destino o abre.',
  bnw: 'Um presidente vermelho de raiva. Descontrole.',
  daredevil: 'Um prefeito criminoso. Governo de amadores.',
  tbolts: 'Heróis descartáveis. Recursos úteis.',
  ironheart: 'Tecnologia e magia unidas. Destino fez isso primeiro.',
  ff: 'Terra-828. A máscara é forjada.',
  bnd: 'Esquecido por todos. Destino não esquece.',
  doomsday: 'Ajoelhem-se. O soberano chegou.',
};

// ── Terras (universos) ────────────────────────────────────────────────────
// O tronco da linha do tempo é a Terra-616 (MCU). As demais Terras aparecem
// como portais que se abrem no ponto em que cruzam com a 616 (`attach`).
export const EARTHS = {
  '616':    { name: 'Terra-616',    label: 'Linha do Tempo Sagrada · MCU' },
  'watcher':{ name: 'Multiverso',   label: 'Arquivos do Vigia (What If…?)',        attach: 'loki1' },
  '96283':  { name: 'Terra-96283',  label: 'Homem-Aranha de Sam Raimi',            attach: 'nwh' },
  '120703': { name: 'Terra-120703', label: 'O Espetacular Homem-Aranha',           attach: 'nwh' },
  '92131':  { name: 'Terra-92131',  label: "X-Men: A Série Animada ('97)",         attach: 'marvels' },
  '10005':  { name: 'Terra-10005',  label: 'X-Men da Fox',                         attach: 'loki2' },
  '121698': { name: 'Terra-121698', label: 'Quarteto Fantástico (2005–2007)',      attach: 'loki2' },
  '828':    { name: 'Terra-828',    label: 'Quarteto Fantástico: Primeiros Passos', attach: 'tbolts' },
};
const EARTH_OF = {
  firstclass: '10005', dofp: '10005', apocalypse: '10005', darkphoenix: '10005', xmen: '10005', x2: '10005',
  x3: '10005', wolverine: '10005', deadpool: '10005', deadpool2: '10005', dw: '10005', logan: '10005',
  ff2005: '121698', ff2007: '121698',
  spider1: '96283', spider2: '96283', spider3: '96283',
  asm: '120703', asm2: '120703',
  xmen97: '92131',
  ff: '828',
  whatif1: 'watcher', whatif2: 'watcher', whatif3: 'watcher',
};
for (const m of MOVIES) m.earth = EARTH_OF[m.id] || '616';
