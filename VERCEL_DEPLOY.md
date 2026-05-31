# Deploy ke Vercel

App ini adalah TanStack Start (SSR). Konfigurasi build sudah disiapkan agar
otomatis memakai Nitro preset **vercel** saat di-build di Vercel
(lihat `vite.config.ts` + `vercel.json`).

## Langkah

1. **Push project ke GitHub**
   Hubungkan project ini ke GitHub (tombol GitHub di kanan atas Lovable),
   lalu pastikan repo sudah ter-push.

2. **Import ke Vercel**
   - Buka https://vercel.com → **Add New… → Project**
   - Pilih repo project ini
   - Framework Preset: **Other** (jangan diubah — `vercel.json` sudah mengatur build)
   - Build Command: `vite build` (otomatis dari `vercel.json`)
   - Output Directory: `.vercel/output` (otomatis dari `vercel.json`)

3. **Set Environment Variables di Vercel**
   Settings → Environment Variables (set untuk Production & Preview):

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | `https://lomlkdxudqrnqjcngjup.supabase.co` |
   | `VITE_SUPABASE_PROJECT_ID` | `lomlkdxudqrnqjcngjup` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | (anon/publishable key — lihat di bawah) |
   | `SUPABASE_URL` | `https://lomlkdxudqrnqjcngjup.supabase.co` |
   | `SUPABASE_PUBLISHABLE_KEY` | (sama dengan publishable key) |
   | `SUPABASE_SERVICE_ROLE_KEY` | (service role key — RAHASIA) |

   - **Publishable / anon key** (boleh publik):
     `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvbWxrZHh1ZHFybnFqY25nanVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMTE1ODEsImV4cCI6MjA5NTY4NzU4MX0.bn_Hq_lAsKY5LZpXAREvDYzkHiZIfnl_6FMfZFNZKnU`
   - **SERVICE_ROLE_KEY** (jangan pernah taruh di kode/frontend): ambil dari
     Lovable Cloud → Backend → Settings, lalu paste ke Vercel.

4. **Deploy** — klik Deploy. Setelah selesai, `iamjosweb.vercel.app`
   akan menampilkan app, bukan lagi `DEPLOYMENT_NOT_FOUND`.

## Catatan
- Auth redirect: di Lovable Cloud (Auth → URL Configuration), tambahkan
  domain Vercel kamu (mis. `https://iamjosweb.vercel.app`) ke
  **Site URL** / **Redirect URLs** agar login berfungsi di domain Vercel.
- Preview & publish di Lovable tetap berjalan normal (target Cloudflare),
  tidak terpengaruh perubahan ini.
