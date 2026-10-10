# Challenge — Cloud / Infrastructure

## Misión

Haz que la aplicación sea observable.

Saved Resources ya funciona, pero un operador necesita poder responder preguntas básicas sobre la salud del sistema sin inspeccionar manualmente cada recurso AWS.

Tu objetivo es agregar **observabilidad útil mediante AWS CloudWatch y CDK**.

## Resultado esperado

Al finalizar, la infraestructura debe permitir responder preguntas como:

- ¿La API está recibiendo tráfico?
- ¿Están aumentando los errores?
- ¿Las Lambdas están fallando?
- ¿La latencia del backend está cambiando?
- ¿Existe una condición que amerite una alarma?

## Definition of Done

La solución se considera completa cuando:

- la observabilidad nueva está definida mediante AWS CDK;
- existe una política explícita y razonable de retención de logs donde aplique;
- existe al menos un CloudWatch Dashboard útil;
- el dashboard incluye métricas relevantes del API y/o Lambdas de Saved Resources;
- existen al menos dos alarmas significativas;
- las alarmas representan condiciones operacionales reales y no métricas arbitrarias;
- `cdk synth` funciona;
- el despliegue no requiere crear recursos de CloudWatch manualmente;
- el comportamiento funcional de Saved Resources no cambia;
- la autenticación existente no cambia.

## Señales sugeridas

No estás obligado a usar exactamente estas métricas, pero son ejemplos válidos:

- API request count;
- API 4xx / 5xx;
- Lambda errors;
- Lambda duration;
- Lambda throttles.

Elige señales que ayuden a diagnosticar el sistema.

## Restricciones

No agregues servicios AWS solo para aumentar la complejidad.

No cambies:

- Cognito;
- ownership;
- DynamoDB access patterns;
- la experiencia funcional del producto.

No crees dashboards o alarmas manualmente desde AWS Console como parte de la solución final.

No conviertas el challenge en una plataforma completa de observabilidad.

## Decisiones que debes razonar con Kiro

Debes decidir:

- cuáles son las métricas más útiles;
- qué umbrales tienen sentido para un workshop;
- cómo evitar alarmas completamente inútiles en un ambiente de poco tráfico;
- cómo organizar dashboard/alarms dentro del CDK existente;
- qué log retention es razonable;
- cómo mantener la infraestructura simple.

## Stretch Goals

Después del reto principal puedes elegir **uno**:

- agregar una custom metric con un caso concreto;
- agregar tracing si la arquitectura y tiempo lo justifican;
- agregar una vista más clara de latencia;
- agregar una alarma compuesta o una señal operacional adicional.

No agregues tracing u otros servicios antes de completar métricas, dashboard y alarmas básicas.

## Validación sugerida

Después de desplegar:

1. genera tráfico usando la aplicación;
2. crea algunos recursos;
3. provoca, de forma segura, alguna validación fallida;
4. abre el dashboard;
5. confirma que las métricas tienen sentido.

Revisa también:

- CloudWatch Dashboard;
- CloudWatch Alarms;
- log groups;
- retention;
- `cdk synth`;
- tests existentes.

## Tu tarea

1. Inspecciona la infraestructura CDK actual.
2. Identifica qué señales operacionales faltan.
3. Diseña tu prompt para Kiro.
4. Genera una Spec.
5. Revisa el diseño antes de implementar.
6. Implementa con CDK.
7. Despliega.
8. Demuestra la observabilidad funcionando.
9. Haz commit.

El objetivo es **hacer operable el sistema**, no hacer más grande el diagrama de arquitectura.
