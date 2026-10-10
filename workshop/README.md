# AWS Community Day Guatemala — Kiro Workshop

Este directorio contiene los materiales prácticos del workshop de Kiro.

La idea central del laboratorio es:

> **No construir una aplicación desde cero con IA, sino aprender a evolucionar una aplicación AWS real con Kiro.**

Todos los participantes parten del mismo starter, completan una feature común y luego eligen un challenge de especialización.

## Comenzar

El workshop se impartirá en español.

→ [Comenzar la feature común](./01-common-feature/README.es.md)

English version:

→ [Start the common feature](./01-common-feature/README.en.md)

## Recorrido del workshop

```text
Starter funcional
→ Steering
→ Feature común
→ Spec
→ Requirements
→ Design
→ Tasks
→ Implementación
→ Validación
→ Challenge de especialización
```

La primera parte es guiada y todos trabajan sobre el mismo objetivo.

Después, cada participante elige una dirección distinta y decide cómo guiar a Kiro para resolverla.

## Estructura

```text
workshop/
├── README.md
│
├── 01-common-feature/
│   ├── README.es.md
│   ├── README.en.md
│   ├── prompt.es.md
│   ├── prompt.en.md
│   ├── validation.es.md
│   └── validation.en.md
│
└── 02-challenges/
    ├── README.es.md
    ├── README.en.md
    ├── feature-builder.es.md
    ├── feature-builder.en.md
    ├── backend-api.es.md
    ├── backend-api.en.md
    ├── cloud-infrastructure.es.md
    ├── cloud-infrastructure.en.md
    ├── devops-platform.es.md
    ├── devops-platform.en.md
    ├── kiro-advanced.es.md
    └── kiro-advanced.en.md
```

## Parte 1 — Feature común

Todos los participantes desarrollan **Saved Resources**.

En esta etapa se entrega un prompt completo para que todos puedan observar el mismo flujo de trabajo con Kiro:

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

La meta no es únicamente completar la feature, sino entender cómo Kiro utiliza el contexto del repositorio para tomar decisiones coherentes.

## Parte 2 — Challenges

Después de completar y hacer commit de la feature común, cada participante crea una nueva rama y selecciona un challenge.

Los paths disponibles son:

- Feature Builder
- Backend / API
- Cloud / Infrastructure
- DevOps / Platform
- Kiro Advanced

En esta etapa ya no se entrega un prompt completo.

Cada challenge proporciona:

- una misión;
- una Definition of Done;
- restricciones;
- decisiones que deben razonarse;
- stretch goals opcionales.

El participante debe convertir ese contexto en instrucciones efectivas para Kiro.

## Principio del workshop

> **La meta no es salir con una demo. La meta es salir con algo que puedas seguir construyendo.**
