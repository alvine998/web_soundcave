# Docker Setup untuk Web SoundCave

## Prerequisites
- Docker
- Docker Compose

## Cara Menggunakan

### 1. Build dan Run dengan Docker Compose

```bash
# Build dan start container
docker-compose up -d

# Atau build terlebih dahulu
docker-compose build
docker-compose up -d
```

### 2. Build Image secara Manual

```bash
# Build image
docker build -t web_soundcave:latest .

# Run container
docker run -d \
  -p 3050:3050 \
  -e NEXT_PUBLIC_BASE_URL_API=http://localhost:6002 \
  --name web_soundcave \
  web_soundcave:latest
```

### 3. Environment Variables

Anda dapat mengatur environment variables melalui:
- File `.env` (untuk docker-compose)
- Atau langsung di `docker-compose.yml`

Contoh `.env`:
```
NEXT_PUBLIC_BASE_URL_API=http://your-api-url:6002
```

### 4. Akses Aplikasi

Setelah container berjalan, akses aplikasi di:
```
http://localhost:3050
```

### 5. Commands yang Berguna

```bash
# Melihat logs
docker-compose logs -f

# Stop container
docker-compose down

# Restart container
docker-compose restart

# Rebuild setelah perubahan
docker-compose up -d --build

# Masuk ke dalam container
docker exec -it web_soundcave sh
```

## Troubleshooting

### Port sudah digunakan
Jika port 3050 sudah digunakan, ubah di `docker-compose.yml`:
```yaml
ports:
  - "3051:3050"  # Gunakan port lain di host
```

### Build gagal
Pastikan:
- Node.js version sesuai (20.x)
- pnpm lockfile ada
- Semua dependencies terinstall dengan benar

### Container tidak start
Cek logs dengan:
```bash
docker-compose logs web_soundcave
```
