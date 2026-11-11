# PRIMI DATA · Flujo de desarrollo

## Ramas
- `main`: versión publicada automáticamente mediante GitHub Pages. Mantener estable.
- `desarrollo`: cambios y pruebas antes de publicar.

## Publicación de mejoras
1. Comprobar la fuente oficial de los datos y sus limitaciones.
2. Preparar la mejora en `desarrollo` (o una rama de funcionalidad).
3. Validar archivos, coherencia de cifras y funcionamiento de la interfaz.
4. Abrir un pull request a `main`, revisar diferencias y fusionar solo versiones comprobadas.
5. Verificar el despliegue en GitHub Pages y conservar el historial para volver a versiones anteriores.

## Cobertura de datos
La base nacional `ine-nombres.json` permite consultar nombres nacionales con datos del INE. Los datos territoriales actuales (`ine-provincias.json` e `ine-municipios.json`) cubren solamente PRIMITIVO (hombres). Nunca presentar ausencia de datos publicados como ausencia de personas ni estimar rankings municipales con totales nacionales.

## Seguridad
El repositorio es público. No añadir contraseñas, claves de API, expedientes personales ni archivos de la farmacia.
