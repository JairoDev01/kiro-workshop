# kiro-essentials

[English](./README.md) | **Español**

SPA de React con autenticación mediante AWS Cognito (Managed Login v2, flujo de
código de autorización con PKCE), servida a través de CloudFront + S3 privado,
con una HTTP API de API Gateway protegida por un autorizador JWT de Cognito. La
infraestructura se gestiona con AWS CDK.

## Acceder al evento de AWS

Únete al evento de AWS Workshop Studio para acceder a la cuenta sandbox aprovisionada para este workshop:

👉 **[Unirse al evento de AWS](https://catalog.us-east-1.prod.workshops.aws/join?access-code=9ac1-00e3fc-37)**

Si el botón no funciona, copia y pega esta URL en tu navegador:

```
https://catalog.us-east-1.prod.workshops.aws/join?access-code=9ac1-00e3fc-37
```

Sigue las instrucciones en pantalla para unirte, y luego usa las credenciales de tu sandbox en la sección de **AWS Access Keys** de `.env` durante el setup.

## Estructura del workspace

| Ruta | Paquete | Descripción |
|------|---------|-------------|
| `apps/web` | @kiro-essentials/web | Frontend SPA de React (Vite + TypeScript) |
| `apps/api` | @kiro-essentials/api | Workspace de backend Lambda (sin handlers en el alcance actual, solo auth) |
| `packages/contracts` | @kiro-essentials/contracts | Contrato OpenAPI (esquema de seguridad `BearerAuth` de Cognito) |
| `infra` | @kiro-essentials/infra | Infraestructura como código con AWS CDK |

## Primeros pasos

### Requisitos previos

- Node.js 20+
- Credenciales de AWS (access keys) para la cuenta sandbox del workshop
- No se requiere Bash, Git Bash ni WSL — la configuración se ejecuta de forma
  nativa en Windows, macOS y Linux
- No se requiere instalar AWS CLI ni AWS CDK globalmente — los scripts usan el
  AWS SDK y `npx cdk`

> Las cuentas sandbox del workshop no usan IAM Identity Center / SSO. Te
> autenticas con las **access keys** proporcionadas para tu sandbox. El comando
> de setup las lee de `.env`; no se escribe nada en un perfil de AWS CLI.

### Inicio rápido (multiplataforma)

Los mismos comandos funcionan en **Windows PowerShell**, **Símbolo del sistema
de Windows**, **Terminal de macOS** y **Linux**:

```
npm run init
# completa la sección de AWS Access Keys en .env
npm run setup
```

`npm run init` es un paso que se ejecuta una sola vez: instala las dependencias
y crea `.env` a partir de `.env.example`, y luego te pide agregar tus
credenciales del workshop de AWS. Abre `.env`, completa la sección de **AWS
Access Keys** (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`,
`AWS_SESSION_TOKEN` si tu sandbox es temporal, y `AWS_REGION`), y luego ejecuta
`npm run setup` una vez para realizar la configuración completa.

En una ejecución exitosa, `npm run setup`:

1. Carga tus access keys de AWS desde `.env` y las valida con STS, luego
   resuelve la cuenta/región.
2. Hace el bootstrap del entorno para CDK (idempotente) y despliega los stacks
   en orden de dependencia (`FrontendHostingStack` → `AuthStack` →
   `ApiGatewayAuthorizerStack`).
3. Resuelve los outputs de CloudFormation y escribe `VITE_COGNITO_*` y
   `VITE_API_URL` de vuelta en `.env` (tus keys de AWS se conservan).
4. Crea y confirma un usuario de prueba de Cognito para que puedas iniciar
   sesión de inmediato.
5. Compila la SPA y la publica en S3 + CloudFront.
6. Imprime un resumen con las URLs local y de producción y las credenciales de
   prueba, y luego inicia el servidor de desarrollo local
   (http://localhost:5173).

Después inicia sesión con las credenciales de prueba impresas (por defecto
`testuser@example.com` / `TestPassw0rd!`).

El prefijo de dominio de la Hosted UI de Cognito usa por defecto
`kiro-essentials-<accountId>` para que sea globalmente único entre cuentas
sandbox; puedes sobrescribirlo con la variable de entorno
`COGNITO_DOMAIN_PREFIX` si lo necesitas.

#### Opciones de setup (flags multiplataforma)

Los flags funcionan igual en cualquier shell. Con npm, colócalos después de
`--`:

```
npm run setup -- --skip-deploy
npm run setup -- --skip-frontend-deploy
npm run setup -- --skip-dev-server
npm run setup -- --skip-test-user
npm run setup -- --test-user-email=you@example.com --test-user-password='Str0ngPass!'
```

| Flag | Efecto |
|------|--------|
| `--skip-deploy` | Reutiliza los stacks ya desplegados; solo (re)escribe `.env` y el usuario de prueba (también omite la publicación del frontend). |
| `--skip-frontend-deploy` | Despliega la infraestructura pero no publica el frontend en S3/CloudFront. |
| `--skip-dev-server` | Finaliza el setup sin iniciar el servidor de desarrollo local. |
| `--skip-test-user` | No crea/actualiza el usuario de prueba de Cognito. |
| `--test-user-email` / `--test-user-password` | Sobrescribe las credenciales de prueba por defecto. |

Las variables de entorno equivalentes (`SKIP_DEPLOY`, `SKIP_FRONTEND_DEPLOY`,
`SKIP_DEV_SERVER`, `SKIP_TEST_USER`, `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`)
siguen siendo compatibles por retrocompatibilidad.

Ejemplo — refrescar `.env` y el usuario de prueba sin volver a desplegar:

```
npm run setup -- --skip-deploy
```

### Configuración manual del entorno (alternativa)

Si prefieres no ejecutar `npm run setup`, crea `.env` en la raíz del repo
(`npm run init` lo crea desde `.env.example` por ti) y completa los valores de
Cognito a partir de los outputs del `AuthStack` (`UserPoolId`,
`UserPoolClientId`, `CognitoDomain`). Vite lee `.env` desde la raíz del repo
(`apps/web/vite.config.ts` define `envDir: '../..'`) y solo lo carga al
arrancar, así que reinicia `npm run dev:web` después de editarlo.

> `.env` está en el `.gitignore` y nunca debe subirse al repositorio.

## Scripts disponibles

Ejecuta todos los scripts desde la raíz del repositorio:

| Script | Descripción |
|--------|-------------|
| `npm run dev:web` | Inicia el servidor de desarrollo del frontend |
| `npm run build:web` | Compila el frontend para producción |
| `npm run build:api` | Verifica tipos del workspace de backend |
| `npm run build:infra` | Compila la infraestructura CDK |
| `npm run typecheck` | Ejecuta las verificaciones de TypeScript en todos los workspaces |
| `npm run test` | Ejecuta las pruebas en todos los workspaces |
| `npm run cdk:synth` | Sintetiza las plantillas de CloudFormation |
| `npm run cdk:deploy` | Despliega todos los stacks en AWS |

Setup / despliegue del workshop (multiplataforma — Windows, macOS, Linux):

| Script | Descripción |
|--------|-------------|
| `npm run init` | Init de una sola vez: instala dependencias y crea `.env` desde `.env.example` (completa tus credenciales de AWS después) |
| `npm run setup` | Setup completo: carga + valida credenciales desde `.env`, despliega stacks, escribe `.env`, crea un usuario de prueba, publica el frontend e inicia el servidor de desarrollo |
| `npm run deploy` | Despliega los stacks de CDK en orden de dependencia (`-- --diff` para solo diff, `-- <StackName>` para un solo stack) |
| `npm run deploy:frontend` | Compila la SPA y la publica en S3 + CloudFront (producción) |

Ejemplos:

```
npm run deploy
npm run deploy -- --diff
npm run deploy -- AuthStack
```

> La lógica de setup y despliegue vive por completo en los scripts de Node.js
> dentro de `scripts/` (`init.mjs`, `setup.mjs`, `deploy.mjs`,
> `deploy-frontend.mjs`), que se ejecutan de forma nativa en Windows, macOS y
> Linux. Usa siempre los comandos `npm run` indicados arriba.

## Stack tecnológico

- **Frontend:** React 18, TypeScript, Vite, React Router, oidc-client-ts
- **Auth:** AWS Cognito Managed Login v2 (Hosted UI), flujo de código de autorización con PKCE
- **Hosting:** CloudFront + S3 privado (OAC)
- **API:** HTTP API de API Gateway con un autorizador JWT de Cognito
- **Infraestructura:** AWS CDK
- **Testing:** Vitest, React Testing Library
