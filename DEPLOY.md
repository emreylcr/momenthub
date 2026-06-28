# MomentHub — Render'a Deploy

## Hızlı yol (Blueprint)

1. Projeyi GitHub'a yükle (aşağıdaki git adımları)
2. [render.com](https://render.com) → **New** → **Blueprint**
3. Repo'yu bağla — `render.yaml` otomatik algılanır
4. **Apply** → Web servisi + PostgreSQL oluşturulur
5. Deploy bitince siten `https://momenthub.onrender.com` gibi bir adreste açılır

## GitHub'a yükleme

```bash
git init
git add .
git commit -m "MomentHub - Render deploy hazır"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/momenthub.git
git push -u origin main
```

## Manuel kurulum (Blueprint olmadan)

### 1. PostgreSQL
- Render → **New** → **PostgreSQL** (Free)
- Ad: `momenthub-db`, Region: Frankfurt

### 2. Web Service
- **New** → **Web Service** → GitHub repo
- **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
- **Start Command:** `npm start`
- **Environment Variables:**
  - `DATABASE_URL` → PostgreSQL **Internal Connection String**
  - `AUTH_SECRET` → güçlü rastgele string
  - `NODE_ENV` → `production`

## Önemli notlar

- **SQLite artık kullanılmıyor** — canlı ortam PostgreSQL ile çalışır
- **Yüklenen dosyalar** (foto/video) Render'da deploy sonrası silinebilir (geçici disk). Kalıcı depolama için ileride S3/Cloudinary eklenebilir
- **Ses odaları** Jitsi üzerinden çalışır, ekstra ayar gerekmez
- Ücretsiz planda site 15 dk kullanılmazsa uyur; ilk ziyaret 30-60 sn sürebilir

## Yerel geliştirme (PostgreSQL ile)

1. `.env.example` dosyasını `.env` olarak kopyala
2. Neon.tech veya Render PostgreSQL **External URL**'ini `DATABASE_URL`'e yapıştır
3. `npx prisma migrate deploy`
4. `npm run dev`
