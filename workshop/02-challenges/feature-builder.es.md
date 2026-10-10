# Challenge — Feature Builder

## Misión

Evoluciona Saved Resources desde una experiencia de crear/listar hacia una experiencia básica de administración de recursos.

La aplicación ya permite crear recursos y consultar únicamente los recursos del usuario autenticado.

Tu objetivo es permitir que el usuario también pueda **editar y eliminar sus propios recursos** sin romper el ownership ni la experiencia existente.

## Resultado esperado

Al finalizar, un usuario autenticado debe poder:

- editar el `title` y `url` de un recurso propio;
- eliminar un recurso propio;
- recibir feedback claro cuando una operación tiene éxito;
- recibir feedback claro cuando una operación falla;
- seguir viendo únicamente sus propios recursos.

## Definition of Done

La solución se considera completa cuando:

- existe una forma clara de iniciar la edición de un recurso;
- el usuario puede modificar `title` y `url`;
- los mismos criterios de validación de la feature común siguen aplicando;
- existe una acción explícita para eliminar un recurso;
- una eliminación requiere una interacción que reduzca eliminaciones accidentales;
- el frontend refleja correctamente los cambios sin manipulación manual de datos;
- el backend valida ownership antes de modificar o eliminar;
- un usuario no puede editar ni eliminar recursos pertenecientes a otro usuario;
- OpenAPI refleja los nuevos comportamientos;
- existen pruebas enfocadas para edición, eliminación, validación y ownership;
- la experiencia existente de crear/listar recursos continúa funcionando.

## Restricciones

Preserva la arquitectura existente.

No cambies:

- Cognito Managed Login;
- Authorization Code + PKCE;
- API Gateway JWT Authorizer;
- DynamoDB como persistencia;
- CloudFront/S3;
- AWS CDK como IaC.

No confíes en un `ownerUserId` enviado por frontend.

No agregues un nuevo módulo de navegación únicamente para esta feature.

No conviertas el challenge en un rediseño completo de la aplicación.

## Decisiones que debes razonar con Kiro

No existe una única implementación correcta.

Entre otras cosas, deberás decidir:

- cómo representar la actualización en el API;
- cómo modelar la interacción de edición en frontend;
- cómo confirmar una eliminación;
- qué errores debe devolver el backend;
- cómo mantener una experiencia consistente con el diseño existente.

Kiro debe inspeccionar el repositorio y Steering antes de proponer la solución.

## Stretch Goals

Solo después de completar el challenge principal, puedes elegir **uno** de estos objetivos:

- agregar categorías;
- agregar filtro por categoría;
- agregar búsqueda client-side sobre los recursos ya cargados;
- mejorar la experiencia de edición con validación inline.

No intentes completar todos los stretch goals.

## Validación sugerida

Prueba al menos estos escenarios:

```text
Usuario A
→ crea Resource A
→ edita Resource A
→ ve los cambios
→ elimina Resource A
→ Resource A desaparece
```

Y, si tienes dos usuarios disponibles:

```text
Usuario A → posee Resource A
Usuario B → posee Resource B

Usuario A no puede modificar ni eliminar Resource B.
```

Verifica además:

- tests;
- typecheck;
- frontend build;
- `cdk synth`;
- regresión de `GET /hello`.

## Tu tarea

1. Lee Steering y el estado actual del repositorio.
2. Diseña el prompt que utilizarás con Kiro.
3. Crea una Spec.
4. Revisa `requirements.md`, `design.md` y `tasks.md`.
5. Ajusta la Spec si es necesario.
6. Implementa.
7. Valida.
8. Haz commit de tu solución.

El objetivo del challenge no es copiar una implementación específica.

El objetivo es **guiar a Kiro para evolucionar una feature real sin romper las reglas del sistema existente**.
