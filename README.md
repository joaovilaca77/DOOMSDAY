# Doom Protocol // Rumo a Doomsday

Site para você e seus amigos marcarem os filmes e séries que precisam ver antes de **Vingadores: Doomsday** (18/12/2026) e darem nota para cada um.

- Contas com **usuário + senha** (sem e-mail real)
- Linha do tempo em estilo *scrollytelling* (galho do multiverso que acende conforme você rola, um título em foco por vez; setas ↑/↓ também navegam)
- **Tronco principal com os 17 essenciais** da lista oficial da Disney (X-Men, X2, Capitão América: O Primeiro Vingador, Os Vingadores, Guerra Infinita, Ultimato, Loki T1 e T2, Shang-Chi, Sem Volta para Casa, Multiverso da Loucura, Wakanda para Sempre, Deadpool & Wolverine, Admirável Mundo Novo, Thunderbolts*, Quarteto Fantástico: Primeiros Passos e o próprio Doomsday)
- **Terras**: o tronco é a **Terra-616** (MCU). Os títulos 616 não essenciais ficam em galhos recolhíveis entre os essenciais, e cada outro universo vira um **portal** dourado que sai do ponto onde cruza com a 616:
  - Terra-10005 (X-Men da Fox, Deadpool, Logan) e Terra-121698 (Quarteto Fantástico 2005/07) → em Loki T2
  - Terra-96283 (Homem-Aranha de Sam Raimi) e Terra-120703 (O Espetacular Homem-Aranha) → em Sem Volta para Casa
  - Terra-92131 (X-Men '97) → em As Marvels · Multiverso do Vigia (What If…?) → em Loki T1
  - Terra-828 (Quarteto Fantástico: Primeiros Passos) → em Thunderbolts*, antes de Doomsday
  - **Todos os essenciais ficam sempre à mostra** como cards grandes — inclusive os de outras Terras (X-Men, X2, Deadpool & Wolverine, Primeiros Passos), que aparecem no galho dourado do portal mesmo com ele fechado; abrir o portal mostra o resto daquela Terra
- Tudo em **ordem cronológica da história** (MCU pela linha do tempo do Disney+; Fox/Sony pelo ano em que se passam), com a época de cada título
- Nota de 1 a 5 estrelas; em cada título aparece a **média do grupo** e quem já assistiu
- Painel lateral: sua nota média, tempo que falta assistir, próximo alvo, **ranking dos amigos** ("Conselho de Latvéria") e contagem regressiva
- Tudo em tempo real: quando um amigo marca algo, aparece na sua tela na hora

Feito em HTML + CSS + JavaScript puro (sem build), com **Firebase** (Authentication + Firestore, plano gratuito) e hospedagem no **GitHub Pages**.

## Rodar localmente

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

Sem configurar o Firebase, o site roda em **modo demo**: as contas e notas ficam só no seu navegador. Serve para ver o visual e testar.

## Configurar o Firebase (uma vez só, ~5 min)

1. Acesse <https://console.firebase.google.com> → **Adicionar projeto** (pode desativar o Google Analytics).
2. **Authentication** → *Vamos começar* → aba **Sign-in method** → ative **E-mail/senha**.
   (O site transforma o usuário `joao` em `joao@doomsday.app` por baixo dos panos; ninguém precisa de e-mail de verdade.)
3. **Firestore Database** → *Criar banco de dados* → escolha a região (ex.: `southamerica-east1`) → modo produção.
4. Ainda no Firestore, aba **Regras**: apague tudo, cole o conteúdo de [`firestore.rules`](firestore.rules) e clique em **Publicar**.
5. **Configurações do projeto** (engrenagem) → *Seus apps* → ícone **`</>`** (Web) → registre o app (sem Hosting) → copie o objeto `firebaseConfig`.
6. Cole os valores em [`js/firebase-config.js`](js/firebase-config.js), faça commit e push.

> As chaves do `firebaseConfig` são públicas por design. Quem protege os dados são as regras do Firestore: qualquer amigo logado pode **ler** as notas de todos, mas cada um só consegue **alterar** as próprias.

## Publicar no GitHub Pages

1. No GitHub: **Settings → Pages → Build and deployment → Deploy from a branch** → escolha a branch e a pasta `/ (root)` → **Save**.
2. Depois de alguns minutos o site fica em `https://<seu-usuario>.github.io/<repositório>/`.
3. No Firebase: **Authentication → Settings → Authorized domains → Add domain** → `<seu-usuario>.github.io`.
4. Mande o link para os amigos: cada um clica em **Criar conta**.

## Personalizar

- **Lista de títulos**: [`js/movies.js`](js/movies.js). Cada item tem `essential`, `era`, tags e resumo; a Terra de cada título e onde cada portal se liga ficam em `EARTHS`/`EARTH_OF` no fim do arquivo. Não mude o `id` de um título depois que o pessoal já avaliou (as notas ficam presas a ele).
- **Pôsteres**: o site busca sozinho a imagem principal da página de cada título na Wikipedia (em inglês), direto do navegador e sem chave, e guarda em cache por 7 dias. Os nomes das páginas estão em [`js/posters.js`](js/posters.js). Se algum não carregar (ou vier errado), ajuste o nome da página ali ou force uma imagem com `poster: 'https://…'` no item em `js/movies.js`. Sem imagem, o card mostra uma capa gerada no estilo do site.
- **Visual**: [`css/doom.css`](css/doom.css). Frases do "Arquivo Doom" de cada título: `DOOM_LINES` em `js/movies.js`.

## Publicar uma mudança

O GitHub Pages deixa os arquivos em cache por alguns minutos. Para ninguém ficar com uma mistura de versão nova e antiga, aumente o número `?v=` (hoje `13`) em todos os lugares onde ele aparece — `index.html`, `js/app.js` e `js/store.js` (busque por `?v=`).

## Estrutura

```
index.html              página (login + linha do tempo)
css/doom.css            visual (galho, cards de vidro, painel)
js/app.js               interface: timeline, filtros, estrelas, painel, ranking
js/store.js             contas e dados (Firebase ou modo demo)
js/movies.js            lista de títulos
js/posters.js           busca dos pôsteres na Wikipedia
js/firebase-config.js   configuração do seu projeto Firebase
firestore.rules         regras de segurança do banco
assets/doom-bg.jpg      arte de fundo (Doutor Destino)
```

## Dados no Firestore

Um documento por pessoa em `progress/{uid}`:

```json
{ "username": "Joao", "watched": { "endgame": true }, "ratings": { "endgame": 5 }, "updatedAt": "…" }
```
