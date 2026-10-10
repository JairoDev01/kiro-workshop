# Challenge — DevOps / Platform

## Misión

Protege el repositorio contra cambios que rompan el proyecto.

El starter ya incluye scripts y comandos para construir, probar y sintetizar la aplicación.

Tu objetivo es crear un workflow de **Continuous Integration con GitHub Actions** que ejecute validaciones automáticamente en cada cambio relevante.

## Resultado esperado

Al finalizar, un Pull Request debe poder demostrar automáticamente que el proyecto:

```text
instala dependencias
→ pasa typecheck
→ pasa tests
→ construye frontend
→ sintetiza CDK
```

## Definition of Done

La solución se considera completa cuando:

- existe un workflow de GitHub Actions versionado en el repositorio;
- se ejecuta en Pull Requests;
- utiliza `npm ci`;
- ejecuta typecheck;
- ejecuta tests;
- ejecuta el build requerido;
- ejecuta `cdk synth`;
- falla si uno de esos pasos falla;
- no contiene access keys AWS hardcodeadas;
- el pipeline mínimo no depende de long-lived AWS credentials;
- utiliza las versiones de Node y comandos compatibles con el repo;
- evita duplicar innecesariamente lógica que ya existe en npm scripts;
- un run exitoso puede demostrarse en GitHub.

## Restricciones

No introduzcas un segundo sistema de build.

No copies secretos al workflow.

No agregues credenciales personales.

No conviertas deployment en requisito del challenge principal.

No agregues herramientas SaaS externas si GitHub Actions puede resolver el objetivo.

No reescribas la estructura del monorepo solo para facilitar CI.

## Decisiones que debes razonar con Kiro

Debes decidir:

- triggers exactos del workflow;
- versión de Node;
- estrategia de cache de npm si aporta valor;
- orden de validaciones;
- comandos del repo que deben reutilizarse;
- si conviene dividir jobs o mantener un job simple;
- cómo ejecutar `cdk synth` sin deployment.

Prioriza claridad y feedback rápido.

## Stretch Goal

Solo después de que CI funcione correctamente:

### Deployment con GitHub OIDC

Investiga cómo permitir deployment a AWS desde GitHub Actions usando OIDC federation.

Si lo implementas:

- no almacenes AWS access keys de larga duración;
- define IAM mediante infraestructura como código cuando corresponda;
- aplica least privilege;
- mantén CI y deployment como responsabilidades distinguibles.

OIDC deployment es **bonus**, no requisito para completar este challenge.

## Validación sugerida

Crea un branch y un Pull Request.

Primero demuestra un run exitoso.

Después, temporalmente, introduce un cambio que haga fallar una validación y confirma que GitHub Actions marque el workflow como fallido.

Luego revierte el cambio.

Valida:

- install;
- typecheck;
- tests;
- build;
- `cdk synth`.

## Tu tarea

1. Inspecciona `package.json`, workspaces y scripts existentes.
2. Revisa la estructura del monorepo.
3. Diseña tu prompt para Kiro.
4. Genera una Spec.
5. Revisa Requirements, Design y Tasks.
6. Implementa el workflow.
7. Crea un Pull Request.
8. Demuestra un run exitoso.
9. Haz commit.

El objetivo es **automatizar las mismas garantías que un buen ingeniero revisaría antes de integrar un cambio**.
