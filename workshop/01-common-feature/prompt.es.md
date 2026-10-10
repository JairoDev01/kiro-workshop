# Prompt común — Saved Resources

Copia el siguiente prompt en Kiro.

---

Crea una nueva feature spec llamada `saved-resources-foundation`.

Antes de crear la Spec:

1. Lee los archivos relevantes de `.kiro/steering`.
2. Inspecciona la implementación actual del repositorio.
3. No asumas arquitectura, comportamiento o dependencias que no existan actualmente.

Presta especial atención a:

- el workspace autenticado actual;
- el flujo existente de autenticación con Cognito/OIDC;
- el uso del access token en llamadas protegidas;
- el JWT Authorizer de API Gateway;
- la integración existente con `GET /hello`;
- el contrato OpenAPI actual;
- `apps/api` como workspace de lógica de aplicación backend;
- la infraestructura CDK existente y sus límites entre stacks;
- los patrones actuales de frontend, estilos y pruebas;
- los scripts y configuración existentes cuando sean relevantes.

## Contexto

Este repositorio es un starter AWS ya funcional.

Actualmente ya existen:

- frontend React + TypeScript;
- autenticación mediante Amazon Cognito Managed Login;
- OAuth 2.0 Authorization Code Flow + PKCE;
- API Gateway HTTP API;
- Cognito JWT Authorizer;
- AWS Lambda;
- CloudFront + S3 privado;
- AWS CDK;
- un endpoint protegido `GET /hello`.

El objetivo es evolucionar el sistema existente, no reconstruirlo ni reemplazar su arquitectura aceptada.

## Objetivo

Permitir que un usuario autenticado pueda guardar recursos útiles y consultar únicamente los recursos que le pertenecen.

Un recurso guardado debe contener:

- `resourceId`, generado por el backend;
- `title`;
- `url`;
- `createdAt`, generado por el backend.

El ownership debe derivarse en el backend a partir de la identidad Cognito validada.

Nunca aceptes un `ownerUserId` autoritativo enviado por el frontend.

## Alcance MVP

Implementa la primera vertical funcional de Saved Resources.

La API debe soportar:

```http
POST /resources
GET /resources
```

### POST /resources

Debe recibir únicamente la información necesaria para crear el recurso:

```json
{
  "title": "AWS Lambda Best Practices",
  "url": "https://docs.aws.amazon.com/"
}
```

El backend debe generar:

- `resourceId`;
- `createdAt`;
- ownership a partir del JWT validado.

### GET /resources

Debe devolver únicamente los recursos pertenecientes al usuario autenticado.

No debe permitir que un usuario consulte recursos de otro usuario.

## Persistencia

Usa Amazon DynamoDB como persistencia.

Diseña el access pattern más simple que satisfaga el comportamiento requerido.

No agregues índices, tablas adicionales o complejidad de modelado sin una necesidad concreta.

## Backend

La lógica de aplicación debe vivir en el workspace backend existente, normalmente bajo `apps/api`, siguiendo las convenciones actuales del repositorio.

No implementes lógica de negocio como código inline dentro de CDK.

La infraestructura debe definir infraestructura.

La aplicación debe contener el comportamiento de negocio.

## Autorización y seguridad

Preserva el límite actual de autenticación:

```text
React
→ Cognito Managed Login
→ Authorization Code + PKCE
→ API Gateway JWT Authorizer
→ Lambda
```

No implementes autenticación personalizada.

No agregues formularios de contraseña dentro de React.

No confíes en ownership enviado por el cliente.

El backend debe obtener el identificador del usuario desde los claims del JWT validado.

## Validación

Como mínimo:

- `title` no puede quedar vacío después de aplicar trim;
- `url` debe ser una URL válida usando `http` o `https`;
- `resourceId` debe generarse server-side;
- `createdAt` debe generarse server-side;
- el ownership debe derivarse server-side;
- un usuario no puede recibir recursos pertenecientes a otro usuario.

Define errores claros y consistentes para entradas inválidas y fallos esperables.

## Frontend

Integra Saved Resources dentro del workspace autenticado existente.

Preserva:

- el header actual;
- el menú de usuario;
- logout;
- la experiencia de autenticación existente;
- la visualización actual del estado de la API protegida `/hello`.

Evoluciona el espacio principal del workspace para incorporar Saved Resources.

El usuario debe poder:

- ver un estado de carga;
- ver un empty state cuando aún no tenga recursos;
- crear un recurso mediante título y URL;
- ver el nuevo recurso después de crearlo;
- ver sus recursos existentes;
- recibir feedback claro si una operación falla.

Reutiliza los componentes, estilos, tokens y patrones visuales existentes.

No agregues sidebar ni navegación innecesaria.

## OpenAPI

OpenAPI sigue siendo la fuente de verdad del contrato del API.

Actualiza el contrato para reflejar correctamente:

- `POST /resources`;
- `GET /resources`;
- esquemas de request;
- esquemas de response;
- autenticación;
- errores relevantes.

No agregues endpoints fuera del alcance de esta feature.

## Infraestructura

Usa la arquitectura AWS CDK existente.

Agrega únicamente la infraestructura requerida para esta feature.

La solución probablemente necesitará:

- una tabla DynamoDB;
- permisos IAM mínimos para las Lambdas;
- rutas protegidas en API Gateway;
- integración de los handlers necesarios.

Preserva dependencias simples y acíclicas entre stacks.

No agregues nuevos servicios AWS sin un requerimiento concreto.

## Pruebas

Incluye pruebas enfocadas para validar al menos:

- creación de recursos;
- listado de recursos;
- validación backend;
- aislamiento de ownership entre usuarios;
- estados loading / empty / success / error en frontend;
- regresión del workspace autenticado existente.

Reutiliza los patrones de testing existentes en el repositorio.

## Fuera de alcance

No implementes en esta Spec:

- edición;
- eliminación;
- categorías;
- tags;
- búsqueda;
- filtros;
- paginación;
- favoritos;
- sharing;
- recursos públicos;
- URL previews;
- scraping de metadata;
- nuevos métodos de autenticación;
- nuevos módulos de navegación;
- infraestructura no necesaria para esta vertical.

Estas capacidades podrán formar parte de challenges posteriores.

## Criterios de aceptación

La Spec debe dejar criterios verificables que cubran, como mínimo:

1. Un usuario autenticado puede crear un recurso con título y URL.
2. `resourceId` y `createdAt` se generan en backend.
3. El ownership se deriva del JWT validado y no del request del cliente.
4. `GET /resources` devuelve únicamente recursos del usuario autenticado.
5. Los recursos persisten en DynamoDB.
6. La UI muestra loading, empty, success y error states apropiados.
7. Un recurso creado aparece en la experiencia del usuario sin requerir manipulación manual de datos.
8. Inputs inválidos reciben errores claros.
9. OpenAPI refleja el contrato implementado.
10. La infraestructura necesaria está definida con CDK.
11. Los permisos IAM aplican least privilege razonable.
12. El flujo existente de Cognito y `/hello` continúa funcionando.
13. No se agregan capacidades fuera del alcance del MVP.

## Entregable de esta etapa

Crea únicamente:

- `requirements.md`
- `design.md`
- `tasks.md`

Sigue el proceso definido en `.kiro/steering`.

No implementes todavía.

Detente después de generar la Spec y espera revisión.
