# PWA Fiesta de 15 - Delfi 📸💖

Esta es una Aplicación Web Progresiva (PWA) diseñada para capturar y compartir los mejores momentos de la fiesta de 15 años de Delfi. Los invitados pueden subir fotos, calificarlas y verlas en una galería interactiva organizada por categorías (Momentos).

## ✨ Características

- **Autenticación Híbrida**: Ingreso con cuenta de Google o registro local (Nombre, Apellido, Usuario).
- **Galería Interactiva**: Visualización de fotos con sistema de puntuación (estrellas) y filtros por categorías (Entrada, Vals, Carioca).
- **Subida de Fotos**: Sistema de carga optimizado para móviles con almacenamiento local automático.
- **Panel de Administración**: Gestión de fotos para moderar contenido.
- **PWA**: Instalable en dispositivos móviles para una experiencia nativa.

## 🚀 Tecnologías

- **Frontend**: React.js, Vite, CSS Vanilla, Lucide React, Axios.
- **Backend**: Node.js, Express, Better-SQLite3, JWT, BcryptJS, Passport.js.
- **Base de Datos**: SQLite (almacenamiento ligero y eficiente).

## 🛠️ Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto localmente:

### 1. Clonar el repositorio
```bash
git clone <url-del-repo>
cd AppFiestaDelfi
```

### 2. Configurar el Servidor (Backend)
```bash
cd server
npm install
```
Crea un archivo `.env` en la carpeta `server/` con la siguiente estructura:
```env
PORT=5000
JWT_SECRET=tu-secreto-para-tokens
SESSION_SECRET=tu-secreto-para-sesiones
CLIENT_URL=http://localhost:5173

# Opcional (Google Auth)
GOOGLE_CLIENT_ID=tu-id-de-cliente
GOOGLE_CLIENT_SECRET=tu-secreto-de-cliente
```

### 3. Configurar el Cliente (Frontend)
```bash
cd ../client
npm install
```

## 🏃 Cómo Ejecutar

Debes iniciar tanto el servidor como el cliente en terminales separadas:

### Iniciar el Servidor
```bash
# En la carpeta /server
npm run dev
```

### Iniciar el Cliente
```bash
# En la carpeta /client
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## 📂 Estructura de Carpetas

- `/client`: Código fuente de React (Vite).
- `/server`: API de Node.js y lógica de negocio.
- `/server/uploads`: Carpeta donde se guardan las fotos subidas localmente.
- `/server/database.sqlite`: Archivo de base de datos local.

---
Creado con ❤️ para el cumple de Delfi.
