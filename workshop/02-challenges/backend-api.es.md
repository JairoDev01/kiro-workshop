# Challenge — Backend / API

## Misión

Evoluciona el API de Saved Resources para que pueda crecer más allá de un conjunto pequeño de datos.

La feature común ya permite crear y listar recursos propios.

Tu objetivo es agregar **paginación compatible con DynamoDB** y fortalecer el contrato de errores del API.

## Resultado esperado

Al finalizar:

- `GET /resources` soporta paginación;
- el frontend puede solicitar y mostrar una página adicional;
- el API usa un cursor/token opaco en vez de paginación por offset;
- inputs inválidos producen errores consistentes;
- ownership sigue aislado por usuario;
- OpenAPI documenta el nuevo contrato.

## Definition of Done

La solución se considera completa cuando:

- `GET /resources` acepta un tamaño de página razonable;
- existe un límite máximo de página;
- inputs fuera de rango o inválidos son rechazados de forma consistente;
- la respuesta puede incluir un cursor/token para continuar;
- el cursor público no expone directamente detalles internos de DynamoDB;
- la implementación utiliza la semántica natural de DynamoDB y no simula `OFFSET`;
- el cursor no permite saltarse el ownership del usuario autenticado;
- el frontend demuestra que puede cargar la siguiente página;
- los errores de Saved Resources siguen un formato consistente;
- OpenAPI documenta parámetros, respuestas y errores;
- existen tests de paginación, validación, ownership y cursor inválido;
- create/list existentes continúan funcionando.

## Restricciones

No reemplaces DynamoDB.

No debilites el JWT Authorizer.

No expongas directamente un `LastEvaluatedKey` crudo como parte del contrato público.

No introduzcas una base de datos relacional únicamente para obtener paginación por offset.

No rediseñes la UI fuera de lo necesario para demostrar la paginación.

No agregues caching, queues u otros servicios AWS sin requerimiento.

## Decisiones que debes razonar con Kiro

Deberás decidir, entre otras cosas:

- nombre y semántica del parámetro de page size;
- máximo permitido;
- representación del continuation token;
- estructura de la respuesta paginada;
- formato consistente de errores;
- cómo manejar tokens inválidos o manipulados;
- cómo preservar ownership durante la continuación.

La solución debe mantener OpenAPI como fuente de verdad.

## Stretch Goals

Después del challenge principal puedes elegir **uno**:

- crear un error schema reutilizable para los endpoints de Saved Resources;
- agregar tests adicionales para cursores manipulados;
- agregar ordenamiento explícito compatible con el access pattern;
- aplicar límites configurables sin hardcodearlos dentro de handlers.

## Validación sugerida

Crea suficientes recursos para necesitar más de una página.

Prueba:

```text
GET /resources?limit=<valor>
→ primera página
→ continuation token

GET /resources?limit=<valor>&cursor=<token>
→ siguiente página
```

Verifica también:

```text
cursor inválido
→ error controlado

limit inválido
→ error controlado
```

Si tienes dos usuarios:

```text
Usuario A y Usuario B tienen recursos.

El cursor emitido para A nunca debe permitir consultar recursos de B.
```

Ejecuta además:

- tests;
- typecheck;
- frontend build;
- `cdk synth`.

## Tu tarea

1. Inspecciona el access pattern actual.
2. Lee Steering y OpenAPI.
3. Diseña tu prompt para Kiro.
4. Genera una Spec.
5. Revisa Requirements, Design y Tasks.
6. Implementa.
7. Valida el comportamiento real del API.
8. Haz commit.

El objetivo es que Kiro te ayude a **diseñar un API coherente con DynamoDB**, no a disfrazar DynamoDB como una base de datos relacional.
