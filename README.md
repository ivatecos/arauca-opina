# Arauca Opina 🌿

Plataforma oficial de participación ciudadana de la **Gobernación de Arauca**, Colombia.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Vite + React 19 + Tailwind CSS v4 |
| Backend | Node.js + Express |
| Base de datos | Supabase (PostgreSQL + Auth) |
| QR | librería `qrcode` |
| Hosting | Vercel (frontend) + Supabase (DB) |

## Estructura del proyecto

```
arauca-opina/
├── frontend/          # Aplicación React
│   ├── src/
│   │   ├── componentes/   # Componentes reutilizables
│   │   ├── context/       # Context API (Auth)
│   │   ├── hooks/         # Custom hooks
│   │   ├── layouts/       # Layouts de página
│   │   ├── lib/           # Configuración de Supabase
│   │   └── paginas/       # Páginas de la aplicación
│   └── .env.example
├── backend/           # API Express
│   ├── src/
│   │   ├── lib/       # Cliente Supabase admin
│   │   └── rutas/     # Endpoints API
│   └── .env.example
└── database/
    └── schema.sql     # Esquema completo de la BD
```

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd arauca-opina
```

### 2. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el archivo `database/schema.sql`
3. Activa la autenticación por email en **Authentication > Providers**
4. Copia las credenciales desde **Project Settings > API**

### 3. Variables de entorno

**Frontend:**
```bash
cp frontend/.env.example frontend/.env
# Edita frontend/.env con tus credenciales de Supabase
```

**Backend:**
```bash
cp backend/.env.example backend/.env
# Edita backend/.env con tus credenciales de Supabase
```

### 4. Instalar dependencias

```bash
# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

### 5. Ejecutar en desarrollo

```bash
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 - Backend
cd backend && npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Módulos

| # | Módulo | Estado |
|---|--------|--------|
| 1 | Setup base + Autenticación | ✅ Completo |
| 2 | Registro ciudadano | ✅ Completo |
| 3 | Encuestas ciudadanas | 🔄 En desarrollo |
| 4 | Votaciones / Proyectos | 🔄 En desarrollo |
| 5 | Propuestas ciudadanas | 🔄 En desarrollo |
| 6 | Sistema de códigos QR | 🔄 En desarrollo |
| 7 | Panel de administración | 🔄 En desarrollo |

## Despliegue en producción

### Frontend → Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desde la carpeta frontend/
cd frontend
vercel --prod
```

Configura las variables de entorno en el dashboard de Vercel.

### Backend → Railway / Render

El backend puede desplegarse en Railway, Render o cualquier servicio que soporte Node.js.

## Roles de usuario

| Rol | Permisos |
|-----|----------|
| `ciudadano` | Registrarse, responder encuestas, enviar propuestas, votar proyectos |
| `administrador` | Todo lo anterior + crear/gestionar encuestas, proyectos, generar QR, ver reportes |

Para crear un administrador, cambia el `rol` del usuario en la tabla `usuarios` de Supabase.

## Licencia

Uso institucional - Gobernación de Arauca © 2025
