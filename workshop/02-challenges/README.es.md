# Challenges — Elige tu camino

A esta altura del workshop todos deberían haber completado y validado la feature común de Saved Resources.

Ahora cambia la dinámica.

Durante la primera parte recibiste un prompt completo y recorrimos juntos el flujo con Kiro.

En esta sección recibirás un problema, restricciones y una Definition of Done.

Tu primera tarea será decidir **cómo guiar a Kiro**.

## Antes de comenzar

Asegúrate de que Saved Resources esté funcionando y de haber creado un commit.

Por ejemplo:

```bash
git status
```

Tu branch actual debe representar el checkpoint común del workshop.

No regreses a `main`.

## Elige un challenge

Los challenges disponibles son:

### Feature Builder

Archivo:

```text
feature-builder.es.md
```

Objetivo principal:

> Evolucionar Saved Resources para permitir editar y eliminar recursos.

### Backend / API

Archivo:

```text
backend-api.es.md
```

Objetivo principal:

> Agregar paginación compatible con DynamoDB y fortalecer el contrato de errores del API.

### Cloud / Infrastructure

Archivo:

```text
cloud-infrastructure.es.md
```

Objetivo principal:

> Agregar observabilidad útil con CloudWatch y AWS CDK.

### DevOps / Platform

Archivo:

```text
devops-platform.es.md
```

Objetivo principal:

> Crear Continuous Integration con GitHub Actions.

### Kiro Advanced

Archivo:

```text
kiro-advanced.es.md
```

Objetivo principal:

> Crear guardrails y automatizaciones útiles con capacidades reales de Kiro.

## Crea tu rama

Desde tu rama con Saved Resources completado, crea una nueva rama para el challenge elegido.

Ejemplos:

```bash
git switch -c challenge/feature
```

```bash
git switch -c challenge/backend
```

```bash
git switch -c challenge/cloud
```

```bash
git switch -c challenge/devops
```

```bash
git switch -c challenge/kiro-advanced
```

No necesitas crear todas.

Elige una.

## La diferencia con la feature común

En la feature común recibiste:

```text
Requerimiento
+
Prompt completo
```

En los challenges recibirás:

```text
Misión
+
Definition of Done
+
Restricciones
+
Stretch Goals
```

Ahora tú debes convertir eso en instrucciones efectivas para Kiro.

## Flujo recomendado

Mantén el mismo proceso de ingeniería:

```text
Problema
→ Steering
→ Prompt creado por ti
→ Spec
→ Requirements
→ Design
→ Tasks
→ Implementación
→ Validación
```

No empieces por:

```text
"Implementa esto..."
```

Primero dale a Kiro suficiente contexto para razonar sobre el cambio.

## Revisa lo que Kiro propone

Cuestiona decisiones que:

- agreguen complejidad innecesaria;
- cambien arquitectura sin un requerimiento;
- ignoren Steering;
- ignoren patrones existentes;
- debiliten seguridad u ownership;
- introduzcan servicios innecesarios;
- amplíen el scope sin justificación.

Kiro puede proponer.

Tú sigues siendo responsable de aceptar, modificar o rechazar la propuesta.

## Stretch Goals

Cada challenge contiene objetivos opcionales.

No son requisitos para completar el challenge.

Primero completa la Definition of Done principal.

Si tienes tiempo restante, elige uno.

## No existe una única solución correcta

Dos participantes pueden resolver el mismo challenge de manera diferente y ambos resultados ser válidos.

Debes poder explicar:

- qué problema resolviste;
- qué contexto le diste a Kiro;
- qué decisiones tomó Kiro;
- cuáles aceptaste o modificaste;
- cómo validaste el resultado.

El reto no es generar más código.

El reto es **guiar a Kiro dentro de un sistema real**.
