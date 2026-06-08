# Seguridad y despliegue profesional

Esta guía resume los pasos para dejar el entorno de producción endurecido y sin dependencias manuales.

## 1. Nginx + TLS

1. Ajusta las rutas de certificado en `ops/nginx/edumind-robotics.conf` (por defecto apunta a Let’s Encrypt).
2. Copia la configuración:
   ```bash
   sudo cp ops/nginx/edumind-robotics.conf /etc/nginx/sites-available/edumind-robotics
   sudo ln -sf /etc/nginx/sites-available/edumind-robotics /etc/nginx/sites-enabled/edumind-robotics
   sudo nginx -t && sudo systemctl reload nginx
   ```
3. El bloque de puerto 80 redirige a HTTPS automáticamente; el bloque HTTPS incluye cabeceras HSTS y desactiva el caché del service worker.

## 2. Backend aislado en loopback

1. Edita/instala `ops/systemd/edumind-robotics.service`.
2. Recarga e inicia:
   ```bash
   sudo cp ops/systemd/edumind-robotics.service /etc/systemd/system/edumind-robotics.service
   sudo systemctl daemon-reload
   sudo systemctl enable --now edumind-robotics
   ```
3. El servicio publica uvicorn en `127.0.0.1:8002` y fija `OLLAMA_HOST=127.0.0.1:11434` para evitar accesos externos.

## 3. Ollama

Si Ollama corre como servicio, añade un override:
```bash
sudo systemctl edit ollama
```
```
[Service]
Environment="OLLAMA_HOST=127.0.0.1:11434"
```
Guarda, recarga (`sudo systemctl daemon-reload && sudo systemctl restart ollama`) y verifica con `ss -ltnp | grep 11434`.

## 4. Firewall

```bash
sudo /usr/sbin/ufw allow 80/tcp
sudo /usr/sbin/ufw allow 443/tcp
sudo /usr/sbin/ufw deny 8002/tcp
sudo /usr/sbin/ufw deny 11434/tcp
sudo /usr/sbin/ufw reload
```
Confirma con `sudo /usr/sbin/ufw status verbose`.

## 5. Frontend

- Solo se registra el service worker en producción (`frontend/src/main.tsx`) para evitar cachés durante desarrollo.
- El service worker ignora `/api/`, así que tras desplegar basta con un `Ctrl+Shift+R` o “Unregister” en DevTools → Application → Service Workers.
- Configura tu entorno local copiando `.env.example`:
  ```bash
  cd frontend
  cp .env.example .env.local
  npm install
  npm run dev
  ```

## 6. Pruebas rápidas

```bash
curl -s http://127.0.0.1:8002/api/health
curl -ks https://robotics.edumind.es/api/health
API_BASE=http://127.0.0.1:8002 ./venv/bin/python backend/test_simulator.py
```

> Nota: si el comando `test_chat.py` tarda en la segunda prueba, aumenta el timeout de HTTPX (`timeout=120.0`) o revisa la carga del modelo en Ollama.
