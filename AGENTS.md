# AGENTS.md

## Visão geral

Este é um aplicativo Next.js 16 mobile-first para controle de figurinhas da Copa do Mundo 2026. Não há cadastro de usuários nem autenticação. A identidade é baseada em um `clientId` (UUID) gerado no navegador e enviado no header `X-Client-Id`.

## Convenções

- App Router do Next.js. Páginas client-only usam `"use client"`.
- TypeScript estrito.
- Tailwind CSS 4 + shadcn/ui (radix-nova). Apenas light mode.
- Texto da interface em português brasileiro.
- Sem Redux, Zustand, NextAuth, OAuth.
- Preferir opções do TanStack Query importadas de `src/lib/query-options`.

## Comandos importantes

```bash
pnpm dev          # dev server
pnpm build        # build de produção
pnpm lint         # biome check
pnpm format       # biome format --write
pnpm start:infra  # docker compose up -d (MongoDB)
```

Sempre rode `pnpm lint && pnpm build` após alterações.

## Arquitetura

- `albums/wc2026/album.json`: catálogo de figurinhas carregado em runtime.
- `src/lib/schemas.ts`: schemas Zod compartilhados entre frontend e backend.
- `src/lib/db/albums.ts`: repository com todas as operações do MongoDB.
- `src/lib/query-options/`: query keys, options e mutations do TanStack Query.
- `src/lib/client-id.ts`: leitura/escrita do UUID no `localStorage`.
- `src/lib/api.ts` e `src/lib/api-client.ts`: helpers para API routes e chamadas de cliente.
- `src/components/app-shell.tsx`: layout com bottom navigation.

## Regras de negócio

- Um álbum pertence a um `ownerClientId`. Outros clientes acessam via `members`.
- Convites possuem `token` + `passwordHash`. A senha em texto é mostrada uma única vez ao criar.
- Figurinhas shiny (`*s`) são ignoradas no catálogo carregado.
- `cutoffRule` do catálogo é ignorado.
- Operações de quantidade usam aggregation update no MongoDB para evitar conflitos de `$inc`/`$max`.

## Identificação

- `clientId` fica em `localStorage` chave `panini:clientId`.
- A home (`/`) e a página do álbum (`/album/[id]`) são client-only para evitar problemas de SSR com `localStorage`.
- Para recuperar acesso em outro dispositivo, o usuário cola o `clientId` na home; não há recovery token.

## Banco de dados

- MongoDB, imagem `mongo:8`.
- Porta local `27018` no host devido a possíveis conflitos com outra instância na `27017`.
- URI padrão em `.env.local.example`.

## Dicas para agentes

- Não assuma bibliotecas disponíveis; verifique `package.json` e arquivos vizinhos.
- Siga os padrões de código existentes (não adicione comentários desnecessários).
- Valide dados com Zod tanto no backend quanto no frontend.
- Prefira páginas dedicadas a bottom sheets/modais para fluxos complexos.
- Teste em build, não apenas em dev.
- Nunca comita alterações a menos que o usuário peça explicitamente.
