# Deployment Vercel — Melemporr

Panduan men-deploy aplikasi Next.js ke Vercel dengan subdomain landing page wildcard.

## Prasyarat

- Akun [Vercel](https://vercel.com)
- Akun [Supabase](https://supabase.com) dengan project aktif
- Domain custom (mis. `melemporr.com`)
- Repository Git (GitHub/GitLab/Bitbucket)

## 1. Supabase

1. Buat project Supabase.
2. Jalankan semua migration di `supabase/migrations/` (urut berdasarkan timestamp) via **SQL Editor** atau Supabase CLI:

```bash
npx supabase db push
```

Migration terbaru `010_secure_landing_telegram.sql` wajib dijalankan agar bot token tidak terekspos ke browser.

3. Catat **Project URL** dan **anon public key** dari **Settings → API**.

## 2. Push ke Git

Pastikan kode sudah di repository Git dan branch utama (`main`) siap deploy.

```bash
git add .
git commit -m "Prepare Vercel deployment"
git push origin main
```

## 3. Import project ke Vercel

1. Login [vercel.com/new](https://vercel.com/new).
2. **Import** repository proyek ini.
3. Vercel otomatis mendeteksi **Next.js** (file `vercel.json` sudah disiapkan).
4. **Build Command:** `npm run build` (default)
5. **Output:** otomatis (Next.js App Router)
6. Jangan deploy dulu — set environment variables terlebih dahulu.

## 4. Environment variables (Vercel)

Di **Project → Settings → Environment Variables**, tambahkan:

| Variable | Production | Preview | Development |
|----------|------------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_BASE_HOST` | ✅ domain utama | opsional | `localhost:3000` |

**Contoh production:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_BASE_HOST=melemporr.com
```

> `SUPABASE_SERVICE_ROLE_KEY` dari **Supabase → Settings → API → service_role**.  
> Jangan pakai prefix `NEXT_PUBLIC_` — rahasia server only (submit form landing ke Telegram).

> `NEXT_PUBLIC_BASE_HOST` = domain utama **tanpa** `https://` dan **tanpa** path.  
> Dipakai untuk generate link landing page di dashboard.

Klik **Deploy**.

## 5. Custom domain & wildcard subdomain

Landing page publik memakai pola:

```text
danadigitall-{slug}.melemporr.com
```

Contoh: `danadigitall-abc.melemporr.com` (slug 3 karakter alfanumerik).

### Tambah domain di Vercel

1. **Project → Settings → Domains**
2. Tambahkan domain apex: `melemporr.com`
3. Tambahkan `www.melemporr.com` (opsional, redirect ke apex)
4. Tambahkan **wildcard**: `*.melemporr.com`

> Wildcard subdomain memerlukan **Vercel Pro** (atau Enterprise). Tanpa Pro, setiap subdomain harus ditambahkan manual.

### DNS (di registrar / Cloudflare)

**Opsi A — Nameserver Vercel (disarankan)**

Delegasikan DNS ke Vercel; domain & wildcard dikonfigurasi otomatis.

**Opsi B — DNS eksternal (Cloudflare dll.)**

| Type | Name | Value |
|------|------|-------|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |
| CNAME | `*` | `cname.vercel-dns.com` |

Tunggu propagasi DNS (5 menit – 48 jam), lalu verifikasi di Vercel.

## 6. Arsitektur routing

- `middleware.ts` mendeteksi hostname subdomain `danadigitall-{slug}`.
- Request di-rewrite ke route `/{slug}`.
- `app/[slug]/page.tsx` memuat data landing dari Supabase.
- Dashboard & admin di domain utama: `melemporr.com/dashboard`, `melemporr.com/admin`.

## 7. Verifikasi setelah deploy

1. Buka `https://melemporr.com` — halaman platform/login.
2. Register / login user → dashboard.
3. Hubungkan bot Telegram di dashboard.
4. Admin aktifkan akun & landing page.
5. Buka link landing: `https://danadigitall-{slug}.melemporr.com`.
6. Uji alur form (step phone → PIN → OTP).

## 8. Build lokal (opsional)

```bash
npm install
npm run build
npm run start
```

Build sudah diverifikasi untuk Vercel. Peringatan `@supabase/supabase-js` dynamic import tidak menghalangi deploy.

## 9. Deploy ulang otomatis

Setiap push ke branch yang terhubung (biasanya `main`) akan trigger deploy otomatis di Vercel.

Preview deployment (PR) mendapat URL `*.vercel.app` — subdomain landing **tidak** berfungsi di preview kecuali `NEXT_PUBLIC_BASE_HOST` disetel ke domain preview.

## 10. CLI Vercel (opsional)

```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
vercel --prod
```

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Subdomain 404 | Pastikan wildcard `*.domain.com` aktif di Vercel & DNS CNAME `*` |
| Link dashboard salah | Set `NEXT_PUBLIC_BASE_HOST` di env Production |
| Login gagal | Cek Supabase URL/key; pastikan migration sudah jalan |
| API error 500 | Lihat **Vercel → Deployments → Functions → Logs** |
| Cookie login tidak tersimpan | Pastikan akses via HTTPS (Vercel default) |

## File konfigurasi deploy

- `vercel.json` — preset Next.js, region Singapore (`sin1`)
- `next.config.js` — `images.unoptimized: true` (kompatibel Vercel static assets)
- `.env.example` — template environment variables
