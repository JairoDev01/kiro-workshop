# Validación — Saved Resources

Utiliza este checklist después de implementar la Spec y antes de continuar con los challenges.

No busca imponer una implementación específica. Busca comprobar que la vertical funcional cumple el objetivo del workshop.

## 1. Starter y regresión

- [ ] La aplicación sigue iniciando correctamente.
- [ ] El login mediante Cognito Managed Login continúa funcionando.
- [ ] El callback de autenticación continúa funcionando.
- [ ] El logout continúa funcionando.
- [ ] El menú de usuario sigue disponible.
- [ ] La llamada protegida `GET /hello` continúa funcionando.
- [ ] No se introdujo una nueva UI de autenticación dentro de React.

## 2. Crear recursos

- [ ] Existe una UI clara para ingresar `title`.
- [ ] Existe una UI clara para ingresar `url`.
- [ ] El usuario puede guardar un recurso válido.
- [ ] Un recurso nuevo recibe un `resourceId` generado por el backend.
- [ ] Un recurso nuevo recibe un `createdAt` generado por el backend.
- [ ] El frontend no envía un `ownerUserId` autoritativo.
- [ ] El recurso creado aparece en la experiencia del usuario.

Prueba sugerida:

```text
Title: AWS Lambda Best Practices
URL: https://docs.aws.amazon.com/lambda/
```

## 3. Validación de inputs

- [ ] Un título vacío es rechazado.
- [ ] Un título que contiene únicamente espacios es rechazado.
- [ ] Una URL inválida es rechazada.
- [ ] Una URL con un esquema no permitido es rechazada si no es `http` o `https`.
- [ ] Los errores son comprensibles para el usuario.
- [ ] El backend también valida los datos; la validación no existe únicamente en frontend.

## 4. Listar recursos

- [ ] `GET /resources` funciona con un usuario autenticado.
- [ ] Un usuario sin recursos recibe una respuesta válida.
- [ ] La UI representa correctamente el empty state.
- [ ] Un usuario con recursos puede verlos.
- [ ] Los datos sobreviven a un refresh/reload de la aplicación.

## 5. Ownership

Este es uno de los puntos más importantes de la vertical.

- [ ] El backend deriva el usuario desde el JWT validado.
- [ ] El request del frontend no controla el propietario del recurso.
- [ ] Los access patterns de DynamoDB soportan consultar recursos por propietario.
- [ ] Un usuario no recibe recursos pertenecientes a otro usuario.

Si tienes dos usuarios Cognito disponibles, prueba:

```text
Usuario A → crea Resource A
Usuario B → crea Resource B
```

Resultado esperado:

```text
Usuario A → solamente ve Resource A
Usuario B → solamente ve Resource B
```

## 6. DynamoDB

- [ ] Los recursos realmente se almacenan en DynamoDB.
- [ ] La tabla está definida mediante CDK.
- [ ] La estructura de claves responde al access pattern del MVP.
- [ ] No se agregaron índices o tablas que el MVP no necesita.
- [ ] El borrado/redeploy esperado del stack no depende de pasos manuales ocultos.

## 7. API y OpenAPI

- [ ] Existe `POST /resources`.
- [ ] Existe `GET /resources`.
- [ ] Ambas rutas están protegidas por el mecanismo de autenticación existente.
- [ ] OpenAPI documenta ambas rutas.
- [ ] OpenAPI documenta requests y responses relevantes.
- [ ] OpenAPI refleja autenticación y errores importantes.
- [ ] La implementación y el contrato no contradicen entre sí.

## 8. Backend

- [ ] La lógica de Saved Resources vive en el workspace de aplicación backend.
- [ ] La lógica de negocio no quedó implementada como Lambda inline dentro de CDK.
- [ ] Los handlers tienen responsabilidades razonablemente pequeñas.
- [ ] La validación crítica ocurre server-side.
- [ ] Los errores esperables se manejan de forma consistente.

## 9. IAM e infraestructura

- [ ] La infraestructura nueva está definida mediante CDK.
- [ ] Las Lambdas tienen únicamente los permisos DynamoDB necesarios.
- [ ] No se introdujeron servicios AWS que la feature no necesita.
- [ ] Las dependencias entre stacks siguen siendo simples y comprensibles.
- [ ] `cdk synth` funciona correctamente.

## 10. Frontend

- [ ] Existe loading state.
- [ ] Existe empty state.
- [ ] Existe success state.
- [ ] Existe error state.
- [ ] La UI conserva el lenguaje visual del starter.
- [ ] No se agregó sidebar sin necesidad.
- [ ] La experiencia funciona razonablemente en viewport pequeño.
- [ ] Las acciones principales son accesibles mediante teclado.

## 11. Tests y build

Ejecuta los comandos disponibles en el repositorio para validar:

- [ ] tests;
- [ ] typecheck;
- [ ] frontend build;
- [ ] CDK synth.

Si alguno falla, corrígelo antes de continuar.

## 12. Scope check

Confirma que la feature común NO agregó todavía:

- [ ] edición;
- [ ] eliminación;
- [ ] categorías;
- [ ] tags;
- [ ] búsqueda;
- [ ] filtros;
- [ ] paginación;
- [ ] favoritos;
- [ ] sharing;
- [ ] recursos públicos;
- [ ] previews de URL.

Estas capacidades están reservadas para los challenges.

## 13. Checkpoint

Cuando todo lo anterior esté correcto:

```bash
git status
git add .
git commit -m "feat: add saved resources"
```

Ahora tu rama representa el checkpoint común del workshop.

Continúa con:

```text
workshop/02-challenges/README.es.md
```
