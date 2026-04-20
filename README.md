# LingoFlow AI

Monorepo **pnpm** con **Next.js 15** (PWA), **NestJS 10**, **Supabase** y **Groq**.

## Requisitos

- Node.js 20+
- pnpm 9+
- Proyecto Supabase (Auth + DB + Storage)
- API key de [Groq](https://console.groq.com)

## Configuración

1. Copia `.env.example` y crea **`apps/web/.env.local`** (variables `NEXT_PUBLIC_*`) y **`apps/api/.env`** (servidor). Opcionalmente un `.env` en la raíz para referencia. Rellena `SUPABASE_JWT_SECRET` desde Supabase → Settings → API → JWT Settings (no uses la anon key).
2. Aplica las migraciones SQL en Supabase (en orden): [`001_initial.sql`](infra/supabase/migrations/001_initial.sql), luego [`002_task_types_match_select.sql`](infra/supabase/migrations/002_task_types_match_select.sql) (tipos `match_pairs` y `select_image`).
3. Crea buckets `worksheets` (público lectura) y `submissions` (privado) si no se crearon por la migración.
4. `pnpm install` (ejecuta `prepare` y compila `packages/*`).

## Desarrollo

```bash
pnpm dev
```

- Web: http://localhost:3000  
- API: http://localhost:3001  

## Estructura

- `apps/web` — Next.js App Router, Tailwind, Framer Motion, PWA (`@ducanh2912/next-pwa`).
- `apps/api` — NestJS: `ChatModule`, `LearningModule`, `FilesModule`, `AiModule` (Groq).
- `packages/shared-types` — tipos compartidos.
- `packages/prompts` — prompts del tutor y generación de tareas.

## Notas

- El JWT de Supabase se valida en la API con `SUPABASE_JWT_SECRET` (mismo valor que en el panel de Supabase → JWT Settings).
- Sustituye los PNG en `apps/web/public/icons/` por iconos 192/512/maskable definitivos.
- Los PDFs escaneados (solo imagen) requieren OCR; la implementación actual extrae texto con `pdf-parse`. Para OCR en producción se puede añadir `tesseract.js` o un servicio de visión.
