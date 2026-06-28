# MomentHub — GitHub + Render Deploy

## 1) GitHub'a yükle

### İlk kez (repo zaten var: `emreylcr/momenthub`)

Proje klasöründe PowerShell:

```powershell
cd C:\Users\yolac\OneDrive\Desktop\site

git add .
git status
git commit -m "MomentHub: üyelik, profil, yorumlar, ses odaları"
git push origin main
```

GitHub hesabına giriş istenirse tarayıcıdan onayla veya Personal Access Token kullan.

### Repo henüz yoksa

1. https://github.com/new adresine git
2. Repo adı: `momenthub` (Public veya Private)
3. **README / .gitignore ekleme** — boş repo oluştur
4. Sonra:

```powershell
cd C:\Users\yolac\OneDrive\Desktop\site
git remote add origin https://github.com/KULLANICI_ADIN/momenthub.git
git branch -M main
git push -u origin main
```

---

## 2) Render'da canlıya al

1. https://render.com — GitHub ile giriş yap
2. **New +** → **Web Service**
3. **Connect repository** → `momenthub` reposunu seç
4. Ayarlar:

| Alan | Değer |
|------|--------|
| **Name** | momenthub |
| **Region** | Frankfurt (veya yakın) |
| **Branch** | main |
| **Runtime** | Node |
| **Build Command** | `npm install && npx prisma migrate deploy && npm run build` |
| **Start Command** | `npm start` |
| **Instance** | Free |

5. **Environment Variables** ekle:

| Key | Value |
|-----|--------|
| `DATABASE_URL` | `file:./data/dev.db` |
| `AUTH_SECRET` | Uzun rastgele string (ör. https://generate-secret.vercel.app/32) |
| `NODE_ENV` | `production` |

6. **Advanced** → **Add Disk** (önemli — SQLite kalıcı olsun diye):
   - Mount Path: `/opt/render/project/src/data`
   - Size: 1 GB

7. `DATABASE_URL` değerini diske göre ayarla:
   ```
   file:/opt/render/project/src/data/dev.db
   ```

8. **Create Web Service** — build bitince site `https://momenthub.onrender.com` gibi bir URL alır.

---

## 3) Güncelleme (her değişiklikten sonra)

```powershell
git add .
git commit -m "Değişiklik açıklaması"
git push origin main
```

Render otomatik yeniden deploy eder (1–5 dk).

---

## Önemli notlar

- `.env` dosyası GitHub'a **gitmez** (güvenlik). Secret'ları sadece Render panelinden gir.
- Yüklenen fotoğraflar `public/uploads` altında — Render Disk kullanmazsan her deploy'da silinir.
- Ses odaları (Jitsi) internet bağlantısı ister, tarayıcı mikrofon izni gerekir.
- İlk üye olan kullanıcı otomatik **admin** olur.

---

## Sorun çıkarsa

- Build log: Render → Service → **Logs**
- `AUTH_SECRET` tanımlı değilse giriş/kayıt çalışmaz
- Veritabanı hatası: Disk mount path ile `DATABASE_URL` eşleşmeli
