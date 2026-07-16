# Melemporr

Aplikasi Next.js untuk landing page publik dengan subdomain custom `danadigitall-{slug}`.

## Fitur utama

- Routing landing page berdasarkan subdomain publik dengan prefix `danadigitall-`
- Panel dashboard pengguna untuk menyalin link landing page
- Admin panel untuk mengaktifkan user dan mengelola subdomain
- Validasi DNS subdomain dengan middleware
- Supabase sebagai backend untuk autentikasi dan data user

## Setup lokal

1. Salin `.env.example` menjadi `.env`
2. Isi variabel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_BASE_HOST=localhost:3000`
3. Install dependency:

```bash
npm install
```

4. Jalankan development server:

```bash
npm run dev
```

## Build produksi

```bash
npm run build
```

## Subdomain publik

Aplikasi mendukung landing page publik menggunakan host:

```text
danadigitall-{slug}.yourdomain.com
```

Contoh:

```text
danadigitall-abc.melemporr.com
```

## Routing dan middleware

- `middleware.ts` mendeteksi host subdomain publik
- Jika cocok, middleware menulis ulang request ke `/${slug}`
- `app/[slug]/page.tsx` menormalkan slug dan memuat data landing page

## Deployment

Deploy ke **Vercel**. Lihat [`DEPLOYMENT.md`](DEPLOYMENT.md) untuk langkah lengkap (Supabase, env vars, DNS wildcard).

## Struktur penting

- `app/[slug]/page.tsx` - halaman landing publik
- `app/dashboard/page.tsx` - dashboard user
- `middleware.ts` - rewrite subdomain ke route slug
- `lib/subdomain.ts` - validasi dan format slug publik
- `lib/supabase-server.ts` - Supabase server client

## Catatan build

Build sudah diverifikasi dan berjalan dengan peringatan ringan dari `@supabase/supabase-js` yang tidak menghalangi deploy.
# from
# from
