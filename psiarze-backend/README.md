# Psiarze Backend (FastAPI)

Minimalny backend pod aplikację **Psiarze** (auth, psy, znajomi, czaty, lokalizacje).

## Start lokalnie (Windows / PowerShell)

```powershell
cd "D:\Programy\psiarze-backend"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Health: `http://localhost:8000/health`
- Swagger: `http://localhost:8000/docs`
- Base API: `http://localhost:8000/api/...`

## Najważniejsze endpointy

- `POST /api/auth/register` → `{email, username, password}` → token JWT
- `POST /api/auth/login` → `{email, password}` → token JWT
- `GET /api/users/me` (Authorization: Bearer ...)
- `GET /api/dogs/mine` / `POST /api/dogs/mine`
- `GET /api/friends/requests` / `POST /api/friends/requests` / `.../accept`
- `POST /api/chats/rooms` (tworzy/znajduje 1:1 room) / `GET /api/chats/rooms`
- `GET /api/chats/rooms/{room_id}/messages` / `POST /api/chats/rooms/{room_id}/messages`
- `PUT /api/locations/me` / `GET /api/locations/friends`

## Frontend (Next.js)

- Dodaj w fetchach nagłówek: `Authorization: Bearer <token>`.
- CORS jest ustawiony na localhost porty 3000–3005 (możesz zmienić w `.env`).

---

## 🚀 Deploy na Render (krok po kroku)

### 1. Utwórz repo na GitHub

```powershell
cd "D:\Programy\psiarze-backend"
git init
git add .
git commit -m "Initial commit"
```

Potem na github.com utwórz nowe repo (np. `psiarze-backend`) i połącz:

```powershell
git remote add origin https://github.com/TWOJ_USER/psiarze-backend.git
git branch -M main
git push -u origin main
```

### 2. Załóż konto na Render.com

Wejdź na https://render.com i załóż konto (możesz przez GitHub).

### 3. Utwórz bazę danych PostgreSQL (Free)

1. Dashboard → **New** → **PostgreSQL**
2. Nazwa: `psiarze-db`
3. Region: Frankfurt (EU)
4. Plan: **Free**
5. Kliknij **Create Database**
6. Po utworzeniu skopiuj **Internal Database URL** (coś jak `postgres://psiarze_db_user:xxx@dpg-xxx.frankfurt-postgres.render.com/psiarze_db`)

### 4. Utwórz Web Service

1. Dashboard → **New** → **Web Service**
2. Połącz swoje repo GitHub (`psiarze-backend`)
3. Ustawienia:
   - **Name**: `psiarze-api`
   - **Region**: Frankfurt (EU)
   - **Branch**: `main`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Plan: **Free**

### 5. Dodaj Environment Variables

W ustawieniach Web Service → **Environment** dodaj:

| Key | Value |
|-----|-------|
| `ENVIRONMENT` | `prod` |
| `DATABASE_URL` | (wklej Internal Database URL z kroku 3) |
| `JWT_SECRET` | (wygeneruj losowy 32+ znakowy string, np. `openssl rand -hex 32`) |
| `CORS_ORIGINS` | `https://twoja-apka.vercel.app` (lub `*` na początek) |

### 6. Deploy!

Kliknij **Create Web Service** i poczekaj ~2-3 minuty.

Po deployu dostaniesz URL typu:
```
https://psiarze-api.onrender.com
```

Sprawdź:
- Health: `https://psiarze-api.onrender.com/health`
- Swagger: `https://psiarze-api.onrender.com/docs`

### 7. Połącz frontend

W aplikacji Next.js ustaw URL backendu, np. w `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://psiarze-api.onrender.com
```

I używaj go w fetchach:

```typescript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
```

---

## 🍓 Deploy na Raspberry Pi (później)

1. Zainstaluj Python 3.11+ i PostgreSQL (lub użyj SQLite)
2. Sklonuj repo, utwórz venv, zainstaluj zależności
3. Skopiuj `.env.example` → `.env`, ustaw zmienne
4. Uruchom jako usługę systemd:

```ini
# /etc/systemd/system/psiarze-api.service
[Unit]
Description=Psiarze API
After=network.target

[Service]
User=pi
WorkingDirectory=/home/pi/psiarze-backend
Environment="PATH=/home/pi/psiarze-backend/.venv/bin"
ExecStart=/home/pi/psiarze-backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable psiarze-api
sudo systemctl start psiarze-api
```

5. Skonfiguruj router (port forwarding 8000) lub użyj tunelu (ngrok/cloudflared)

