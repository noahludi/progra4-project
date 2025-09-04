# Proyecto PROGRA4 – Reseñas de Libros

Aplicación de reseñas de libros construida con Next.js.

---

## 🌐 Producción

URL pública: https://progra4-project-noahludi.vercel.app/  
Repositorio: https://github.com/noahludi/progra4-project

---

## 🚀 Deploy local (con Docker)

### 1) Build de la imagen
docker build -t progra4-project .

### 2) Correr el contenedor
docker run --rm -p 3000:3000 progra4-project
# abrir http://localhost:3000

### 3) Con variables de entorno (si las hubiera)
docker run --rm -p 3000:3000 --env-file .env.local progra4-project

---

## 🔧 Variables de entorno necesarias

Actualmente la app no necesita secretos para funcionar. Opcionalmente podés definir:

PORT=3000   # Puerto de la app (npm start o Docker)

---

## ⚙️ CI/CD (GitHub Actions)

Los workflows están en .github/workflows/ y automatizan build, tests y publicación de imagen Docker en GHCR.

1) Build en Pull Requests — pr-build.yml
   - on: pull_request
   - Instala dependencias y ejecuta npm run build.
   - Si falla, el PR falla.

2) Tests en Pull Requests — pr-test.yml
   - on: pull_request
   - Corre npm test.
   - Si falla un test, el PR falla.

3) Docker a GHCR en main — release-docker.yml
   - on: push a main
   - Construye la imagen con el Dockerfile y la publica en GHCR.
   - Tags: latest, <version>, sha-<commit>

---

## ✅ Demostración de GitHub Actions

A) Checks en Pull Request
   - Crear PR contra main.
   - En pestaña Checks deben pasar: CI - Build on PR, CI - Tests on PR.

B) Publicación de imagen en GHCR
   - Hacer merge a main.
   - Verificar en Actions → Release - Docker to GHCR.
   - Revisar en Packages los tags:
     ghcr.io/noahludi/progra4-project:latest
     ghcr.io/noahludi/progra4-project:<version>
     ghcr.io/noahludi/progra4-project:sha-<commit>

C) Probar la imagen
   docker pull ghcr.io/noahludi/progra4-project:latest
   docker run --rm -p 3000:3000 ghcr.io/noahludi/progra4-project:latest

   # si es privada:
   echo <PAT_CON_read:packages> | docker login ghcr.io -u noahludi --password-stdin
   docker pull ghcr.io/noahludi/progra4-project:latest

---

## 🧰 Troubleshooting

- No corren los workflows → confirmar que los YAML estén en .github/workflows/ y Actions habilitado.
- Push a GHCR falla → activar Workflow permissions: Read and write.
- No veo la imagen → revisar Actions y Packages.
- Docker local sin permisos → agregá tu user al grupo docker o usá sudo.
