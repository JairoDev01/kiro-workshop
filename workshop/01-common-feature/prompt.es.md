# Prompt común — Saved Resources (Local)

Crea una nueva feature spec llamada `saved-resources-local-foundation`.

Antes de crear la Spec:

1. Lee los archivos relevantes de `.kiro/steering`.
2. Inspecciona la implementación actual del repositorio.
3. Inspecciona específicamente:
   - el home autenticado actual;
   - el área principal del workspace;
   - el empty state `Listo para evolucionar`;
   - el panel `Estado del entorno`;
   - la implementación actual de `GET /hello`;
   - `apps/api`;
   - los scripts npm existentes;
   - la configuración local del frontend;
   - OpenAPI;
   - los patrones actuales de testing.
4. No asumas que esta feature debe desplegar infraestructura AWS.

## Decisión explícita para el workshop

Para esta feature, el runtime del workshop será completamente local.

La cuenta AWS disponible para los participantes no tiene permisos suficientes para desplegar infraestructura.

Por lo tanto, esta Spec NO debe requerir:

- API Gateway;
- Lambda desplegada;
- DynamoDB;
- IAM;
- CDK deploy;
- AWS credentials;
- JWT Authorizer;
- validación de access tokens;
- autorización backend.

El API de Saved Resources será un API HTTP local convencional.

Esta decisión es intencional para el workshop.

Si `.kiro/steering` describe API Gateway, Lambda, JWT Authorizer, DynamoDB o CDK como parte de la arquitectura AWS de referencia, no interpretes eso como un requisito para implementar esta feature local.

No modifiques la arquitectura AWS de referencia salvo que sea estrictamente necesario documentar la diferencia entre runtime local y arquitectura desplegable.

---

# Contexto

El repositorio ya tiene:

- React + TypeScript;
- Vite;
- Cognito Managed Login;
- Authorization Code + PKCE;
- un home autenticado;
- un panel técnico de estado;
- un área principal del workspace preparada para nuevas features;
- un workspace backend en `apps/api`.

Durante el workshop, Cognito puede continuar utilizándose para iniciar sesión en la aplicación.

Sin embargo, el API local de esta feature **no estará protegido**.

El API local:

- no debe validar JWT;
- no debe validar Cognito;
- no debe requerir `Authorization`;
- no debe implementar un authorizer;
- no debe implementar ownership por usuario.

Debe comportarse como un API HTTP local convencional.

---

# Objetivo

Permitir que el usuario pueda:

- crear un recurso mediante título y URL;
- consultar los recursos creados durante la ejecución actual del API;
- ver esos recursos integrados dentro del workspace.

Los datos deben almacenarse únicamente en memoria.

Cuando el proceso del API local se reinicie, los recursos pueden perderse.

Ese comportamiento es esperado para este workshop.

---

# Modelo

Un recurso debe contener aproximadamente:

```ts
{
  resourceId: string;
  title: string;
  url: string;
  createdAt: string;
}