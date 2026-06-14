# Panini WC 2026 — Controle de Figurinhas

Aplicativo web mobile-first para acompanhar a coleção de figurinhas da Copa do Mundo 2026.

## Funcionalidades

- Criar álbuns sem cadastro (identificação por `clientId` armazenado no navegador).
- Marcar figurinhas como possuídas, faltantes ou repetidas.
- Compartilhar álbuns via convites com senha (editor/visualizador).
- Recuperar acesso colando o `clientId` de outro dispositivo.
- Catálogo local das figurinhas da Copa 2026 em `albums/wc2026/album.json`.

## Tecnologias

- Next.js 16 (App Router)
- React 19 + React Compiler
- TypeScript
- Tailwind CSS 4 + shadcn/ui
- MongoDB
- TanStack Query
- Zod
- Biome

## Requisitos

- Node.js 20+
- pnpm
- Docker e Docker Compose (para MongoDB local)

## Como rodar

1. Instale as dependências:

```bash
pnpm install
```

2. Inicie o MongoDB:

```bash
pnpm start:infra
```

3. Copie as variáveis de ambiente:

```bash
cp .env.local.example .env.local
```

4. Inicie o servidor de desenvolvimento:

```bash
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Scripts

| Comando            | Descrição                              |
| ------------------ | -------------------------------------- |
| `pnpm dev`         | Servidor de desenvolvimento            |
| `pnpm build`       | Build de produção                      |
| `pnpm start`       | Servidor de produção                   |
| `pnpm lint`        | Verificação com Biome                  |
| `pnpm format`      | Formatação com Biome                   |
| `pnpm start:infra` | Sobe o MongoDB via Docker Compose      |

## Estrutura

```
albums/wc2026/album.json   # Catálogo de figurinhas
src/app/api/               # API routes do Next.js
src/app/                   # Páginas
src/components/            # Componentes reutilizáveis
src/lib/                   # Utilitários, schemas, db, query options
```

## Identificação do dispositivo

O aplicativo gera um UUID por navegador e armazena em `localStorage` com a chave `panini:clientId`. Esse ID é enviado no header `X-Client-Id` de todas as requisições e determina quais álbuns você pode acessar.

Para usar o mesmo álbum em outro dispositivo, copie o ID em **Configurações** e cole na tela inicial usando o botão de importar.

## Convites

Na página de compartilhamento de um álbum, é possível criar convites com token e senha. Quem receber o link e a senha pode entrar no álbum com o papel de editor ou visualizador.

## Deploy

O projeto pode ser deployado em qualquer plataforma que suporte Next.js. Certifique-se de configurar a variável `MONGODB_URI` no ambiente de produção.
