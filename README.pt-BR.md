# Anime Story Generator

> Extensão Chrome que gera stories para o Instagram automaticamente quando você atualiza o status de um anime ou mangá no MyAnimeList ou AniList.

![Versão](https://img.shields.io/badge/versão-3.0.0-blue) ![Licença](https://img.shields.io/badge/licença-MIT-green)

## ✨ Funcionalidades

- **MyAnimeList + AniList** — conecte as duas contas ao mesmo tempo
- **Detecção automática** — banner aparece quando você muda o status no MAL ou AniList
- **Login OAuth** — puxa título, capa, episódios e sua nota automaticamente
- **Foto de perfil** — seu avatar carrega automaticamente no card
- **Paleta de notas metálica** — cor única para cada nota (bordô ao ouro)
- **Badge dinâmico** — exibe logo do MAL ou AniList conforme a fonte
- **Export perfeito** — 1080×1920px via Canvas API, idêntico à prévia
- **Zero uploads manuais** — tudo preenchido automaticamente

## 🚀 Instalação

1. Baixe o `mal-story-extension-v3.zip` em [Releases](../../releases)
2. Extraia o arquivo
3. Abra `chrome://extensions` no Chrome, Brave ou Edge
4. Ative o **Modo desenvolvedor** (canto superior direito)
5. Clique em **Carregar sem compactação** e selecione a pasta extraída
6. Acesse qualquer página de anime ou mangá no MAL ou AniList

## 📸 Como funciona

1. **Login** — clique no ícone da extensão e entre com MAL e/ou AniList
2. **Navegue** — acesse qualquer página de anime/mangá e clique em "📸 Gerar Story"
3. **Atualize o status** — mude o status e um banner aparece automaticamente
4. **Baixe** — seu story em 1080×1920px está pronto para postar no Instagram

## 🎨 Cores das Notas

| Nota | Classificação MAL | Cor |
|------|-------------------|-----|
| 10 | Obra-prima | 🟡 Ouro |
| 9 | Ótimo | 🟡 Âmbar |
| 8 | Muito Bom | ⬜ Prata |
| 7 | Bom | 🩶 Prata Escuro |
| 6 | Ok | 🟤 Bronze |
| 5 | Médio | 🟤 Cobre |
| 4 | Ruim | 🟫 Ferrugem |
| 3 | Muito Ruim | 🟫 Ferrugem Escuro |
| 2 | Horrível | 🔴 Bordô |
| 1 | Péssimo | ⬛ Bordô Escuro |

## 🔒 Privacidade

- OAuth PKCE para MAL — token nunca sai da sua máquina
- Troca de token do AniList via servidor proxy seguro — client secret nunca exposto
- Nenhum dado é coletado

## 📄 Licença

MIT — não afiliado ao MyAnimeList ou AniList.
