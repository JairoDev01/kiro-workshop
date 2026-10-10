# kiro-essentials

[English](./README.md) | **Español**

Un starter **100% local** de SPA React + API Express. El frontend (Vite) y la
API backend se ejecutan por completo en tu máquina — **no hay AWS en runtime**:
sin CDK, sin API Gateway, sin Lambda, sin DynamoDB y sin login de Cognito. La
autenticación está simulada localmente y los datos son efímeros.

> **Modo local.** Este repo era originalmente un starter de AWS/Cognito/CDK. Se
> simplificó para ejecutarse 100% local en el workshop. La autenticación está
> simulada (un usuario demo fijo) y la API es un servidor Express local. El
> código de infraestructura AWS en `infra/` se conserva como referencia pero
> **no se usa** en el flujo local.

## Estructura del workspace

| Ruta | Paquete | Descripción |
|------|---------|-------------|
| `apps/web` | @kiro-essentials/web | Frontend SPA de React (Vite + TypeScript) |
| `apps/api` | @kiro-essentials/api | API backend Express local (TypeScript, `tsx`) |
| `packages/contracts` | @kiro-essentials/contracts | Contrato OpenAPI |
| `infra` | @kiro-essentials/infra | Infraestructura AWS CDK (solo referencia — sin uso en modo local) |

## Primeros pasos

### Requisitos previos

- Node.js 20+
- Nada más. Sin cuenta de AWS, sin credenciales de AWS, sin AWS CLI, sin CDK.

### Inicio rápido

```
npm install
npm run dev:local
```

Luego abre **http://localhost:5173** y haz clic en **"Iniciar sesión"** — te
lleva directo al home como un usuario simulado con sesión iniciada. El panel
"Estado del entorno" llama automáticamente a la API local `GET /hello`.

`npm run dev:local` inicia ambos procesos juntos, con salida prefijada para
distinguirlos:

- `[web]` → servidor de desarrollo Vite en **http://localhost:5173**
- `[api]` → API Express local en **http://localhost:3001**

Presiona `Ctrl+C` para detener ambos.

### Cómo funciona (modo local)

- **La auth está simulada.** No hay login real. Al hacer clic en "Iniciar
  sesión" navegas a `/home` con un usuario demo fijo (`demo@local.dev`). Ver
  `apps/web/src/lib/auth/mock-auth.tsx`.
- **La API es un servidor Express local.** `GET /hello` devuelve un JSON de
  demostración. No se requiere ni se valida ningún token. Ver `apps/api/src/`.
- **Los datos son efímeros.** Lo que se almacene vive en memoria en la API (o en
  el `localStorage` del navegador en el frontend) y se pierde al reiniciar.

### Configuración del entorno

Vite lee `.env` desde la raíz del repo (`apps/web/vite.config.ts` define
`envDir: '../..'`). Para el modo local la única variable que importa es:

```
VITE_API_URL=http://localhost:3001
```

`.env.example` documenta el conjunto completo. `.env` está en el `.gitignore` y
nunca debe subirse al repositorio. Las variables `VITE_COGNITO_*` y `AWS_*` ya
no se usan en runtime en modo local (se conservan solo como documentación).

> Vite solo lee `.env` al arrancar, así que reinicia el servidor de desarrollo
> después de editarlo.

## Scripts disponibles

Ejecuta todos los scripts desde la raíz del repositorio:

| Script | Descripción |
|--------|-------------|
| `npm run dev:local` | **Inicia todo localmente** — la API y la web juntas |
| `npm run dev:web` | Inicia solo el servidor de desarrollo del frontend (http://localhost:5173) |
| `npm run dev:api` | Inicia solo el servidor de la API local (http://localhost:3001) |
| `npm run build:web` | Compila el frontend para producción |
| `npm run build:api` | Verifica tipos del workspace de backend |
| `npm run typecheck` | Ejecuta las verificaciones de TypeScript en todos los workspaces |
| `npm run test` | Ejecuta las pruebas en todos los workspaces |

## Stack tecnológico

- **Frontend:** React 18, TypeScript, Vite, React Router
- **Auth:** simulada localmente (sin Cognito, sin tokens)
- **Backend:** API Express local (TypeScript, ejecutada con `tsx`)
- **Datos:** efímeros (en memoria / `localStorage`)
- **Testing:** Vitest, React Testing Library, Supertest

## Modo AWS heredado (referencia)

La ruta original de despliegue en AWS (stacks de CDK, Cognito, API Gateway +
Lambda, CloudFront + S3) todavía existe bajo `infra/` y `scripts/` pero **no
forma parte del flujo local**. Se conserva solo como referencia y no es
necesaria para ejecutar o desarrollar la app localmente.
