# Officeverse

MVP inicial de Officeverse: landing, auth con Supabase, selección de avatar y una oficina 2D renderizada con Phaser.

## Requisitos

- Node.js LTS instalado.
- Proyecto Supabase de desarrollo.
- Publishable key de Supabase en `.env.local`.

## Configuración local

```powershell
npm.cmd install
Copy-Item .env.example .env.local
```

Edita `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dguforvkdhkjiilieuay.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_publishable_key
NEXT_PUBLIC_OFFICEVERSE_DEBUG=true
```

Con `NEXT_PUBLIC_OFFICEVERSE_DEBUG=true`, `/auth` muestra un acceso rápido de desarrollo que evita Supabase y usa estado local mock.

## Assets

- Carpeta unica de assets runtime: `public/assets/`.
- Personajes y tiles base: `public/assets/modern-tiles-free/`.
- Sprites de oficina para el editor: `public/assets/officeverse/interiors/office-sprites.png`.
- Manifest del editor: `public/assets/officeverse/interiors/office-sprites.manifest.json`.
- La licencia incluida de `modern-tiles-free` indica uso no comercial para la version gratuita. No publiques ni monetices el proyecto con esos assets sin sustituirlos o comprar una licencia compatible.

## Supabase

La migración inicial está en:

```text
supabase/migrations/20260428000000_initial_officeverse.sql
```

Aplica ese SQL en el proyecto Supabase de desarrollo. Crea:

- `profiles`
- `offices`
- `office_objects`
- RLS owner-only para usuarios autenticados.

## MCP Supabase en Codex

La configuración esperada es:

```toml
[mcp]
remote_mcp_client_enabled = true

[mcp_servers.supabase]
url = "https://mcp.supabase.com/mcp?project_ref=dguforvkdhkjiilieuay"
```

Después de reiniciar Codex:

```powershell
codex mcp login supabase
```

## Desarrollo

```powershell
npm.cmd run dev
npm.cmd test
npm.cmd run build
```
