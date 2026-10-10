# Challenge — Kiro Advanced

## Misión

Utiliza capacidades de automatización de Kiro para reducir validaciones repetitivas durante el desarrollo.

El repositorio ya utiliza Steering y Specs.

Tu objetivo es agregar **guardrails automatizados** que den feedback útil mientras el desarrollador trabaja con Kiro.

## Importante

Las capacidades disponibles pueden variar según la versión instalada de Kiro.

Antes de diseñar la solución:

- inspecciona qué mecanismos de Hooks/automation soporta realmente tu versión;
- no inventes sintaxis, triggers o capacidades;
- basa la solución en funcionalidades disponibles en el entorno.

## Resultado esperado

Al finalizar, el proyecto debe contar con al menos **dos automatizaciones útiles**.

Una debe validar cambios de aplicación, por ejemplo:

- tests relevantes;
- typecheck;
- otra validación equivalente.

La segunda debe proteger una frontera diferente, por ejemplo:

- API/OpenAPI;
- infraestructura/CDK;
- validación relacionada con Specs/Tasks;
- otra regla útil del repositorio.

## Definition of Done

La solución se considera completa cuando:

- existen al menos dos guardrails automatizados;
- cada uno tiene un propósito diferente;
- los triggers están claramente definidos;
- las validaciones producen feedback comprensible;
- un fallo es visible para el desarrollador;
- no modifican archivos no relacionados de forma inesperada;
- no exponen secretos;
- reutilizan scripts/comandos existentes cuando sea razonable;
- la automatización está documentada;
- se puede demostrar al menos un caso exitoso y uno fallido.

## Restricciones

No inventes funcionalidades que Kiro no soporte.

No dupliques un pipeline CI completo dentro de Kiro.

No ejecutes deploys destructivos automáticamente como parte de un guardrail local.

No agregues automatizaciones que modifiquen código silenciosamente sin un propósito claro.

No conviertas cada acción del desarrollador en una validación lenta.

Busca feedback rápido y útil.

## Decisiones que debes razonar con Kiro

Deberás decidir:

- qué eventos merecen automatización;
- qué validaciones ofrecen alto valor y bajo costo;
- qué debe permanecer en CI en vez de ejecutarse localmente;
- cómo evitar loops o ejecuciones excesivas;
- qué output ayuda realmente al desarrollador;
- cómo documentar el comportamiento para futuros usuarios del starter.

## Ideas de guardrails

Estas son ideas, no requisitos:

```text
Cambio de TypeScript
→ ejecutar typecheck o tests relevantes

Cambio de OpenAPI
→ validar contrato

Cambio de CDK
→ ejecutar synth

Finalización de una tarea de Spec
→ ejecutar una validación corta
```

Escoge automatizaciones que tengan sentido para el repositorio actual.

## Stretch Goal

Diseña un tercer guardrail que ayude al flujo de Specs o preparación de commits.

Debe seguir siendo rápido, comprensible y reutilizable.

## Validación sugerida

Para cada automatización:

1. demuestra un escenario que pasa;
2. introduce temporalmente un fallo;
3. demuestra el feedback;
4. corrige el fallo;
5. confirma que vuelve a pasar.

Documenta:

- trigger;
- comando/acción;
- objetivo;
- expected feedback.

## Tu tarea

1. Inspecciona las capacidades reales de Kiro disponibles.
2. Revisa Steering y scripts existentes.
3. Identifica dos puntos donde la automatización aporte valor.
4. Diseña tu prompt.
5. Si el cambio es suficientemente significativo, utiliza una Spec antes de implementar.
6. Implementa los guardrails.
7. Demuestra el feedback automático.
8. Documenta el resultado.
9. Haz commit.

El objetivo es **usar Kiro para mejorar el flujo de ingeniería**, no solo para generar código.
