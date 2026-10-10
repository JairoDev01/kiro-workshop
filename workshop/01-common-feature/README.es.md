# Feature común — Saved Resources

Todos los participantes construirán primero la misma vertical funcional.

La intención de esta parte del workshop es recorrer una feature completa de extremo a extremo utilizando Kiro dentro de una aplicación AWS existente.

## Objetivo

Un usuario autenticado debe poder guardar un recurso mediante un título y una URL, y consultar únicamente los recursos que le pertenecen.

La implementación deberá evolucionar el starter existente sin reemplazar su arquitectura base.

## Antes de comenzar

Parte desde `main` y crea una rama de trabajo para la feature común:

```bash
git switch main
git pull
git switch -c workshop/common-resources
```

Todos pueden utilizar el mismo nombre de rama local para que sea más fácil seguir los pasos del laboratorio.

Verifica también que el starter esté funcionando correctamente antes de continuar.

## Materiales de esta sección

```text
01-common-feature/
├── README.es.md
├── README.en.md
├── prompt.es.md
├── prompt.en.md
├── validation.es.md
└── validation.en.md
```

Para el workshop en español utilizarás principalmente:

- `prompt.es.md`
- `validation.es.md`

Las versiones `.en.md` están disponibles como referencia alternativa.

## Flujo de trabajo

Abre:

```text
workshop/01-common-feature/prompt.es.md
```

y utilízalo con Kiro para crear la Spec.

El flujo esperado es:

```text
Repositorio existente
→ Steering
→ Prompt
→ Spec
→ Requirements
→ Design
→ Tasks
→ Implementación
→ Validación
```

## No implementes todavía

Cuando Kiro genere la Spec, detente.

Primero revisa:

1. `requirements.md`
2. `design.md`
3. `tasks.md`

Antes de aprobar la implementación, asegúrate de entender:

- qué comportamiento propone Kiro;
- qué partes del sistema cambiarán;
- qué decisiones de arquitectura propone;
- cómo preservará autenticación y ownership;
- cómo evolucionará OpenAPI;
- qué infraestructura agregará;
- qué pruebas considera necesarias.

El objetivo es revisar y razonar la propuesta, no aceptar automáticamente todo lo generado.

## Qué aprenderemos

La feature común está diseñada para tocar varias capas reales de la aplicación sin introducir un dominio complejo.

Durante el ejercicio trabajarás con:

- React;
- Cognito;
- API Gateway;
- JWT Authorizer;
- Lambda;
- DynamoDB;
- AWS CDK;
- OpenAPI;
- testing;
- autorización basada en la identidad autenticada.

El objetivo no es únicamente que Saved Resources funcione.

El objetivo es observar cómo Kiro utiliza Steering, arquitectura y código existente para proponer una solución coherente.

## Implementación

Una vez revisados y aceptados:

```text
requirements.md
design.md
tasks.md
```

continúa con la implementación utilizando Kiro.

No amplíes el alcance más allá de la Spec aprobada.

## Validación

Cuando la implementación termine, abre:

```text
workshop/01-common-feature/validation.es.md
```

y verifica el resultado antes de continuar.

La validación cubre, entre otras cosas:

- regresión del starter;
- creación de recursos;
- validación;
- persistencia;
- ownership;
- API/OpenAPI;
- DynamoDB;
- IAM/CDK;
- frontend;
- tests;
- scope.

## Crear el checkpoint

Cuando la feature esté funcionando y validada:

```bash
git status
git add .
git commit -m "feat: add saved resources"
```

Ese commit se convierte en tu punto común para el siguiente bloque.

## Siguiente paso

Continúa con:

```text
workshop/02-challenges/README.es.md
```

No regreses a `main`.

Tu challenge debe partir de la feature común que acabas de construir.
