# PRIMI DATA v0.7

Actualización de interfaz sobre v0.6. La búsqueda nacional usa `ine-nombres.json` generado por `python3 sync_ine.py`.

## Actualizar en Mac
1. Detener servidor con Ctrl+C.
2. Sustituir los archivos de la carpeta `~/Downloads/primi-data` por los de este ZIP (sin borrar `ine-nombres.json`).
3. Si no existe `ine-nombres.json`, ejecutar `python3 sync_ine.py`.
4. Ejecutar `python3 -m http.server 8000` y abrir http://localhost:8000.

Los datos provinciales/municipales no están integrados; no inferirlos del total nacional.


## v0.8: módulo provincial preparado

La pantalla consulta automáticamente `ine-provincias.json` cuando existe. No se incluyen cifras provinciales inventadas. Para generar el fichero a partir de una exportación CSV del INE con columnas Provincia y Personas:

`python3 sync_provincias.py exportacion.csv --nombre PRIMITIVO --sexo H --provincia Provincia --frecuencia Personas`

Revisar manualmente el CSV y sus cabeceras antes de importar. El archivo debe contener exclusivamente provincias, sin subtotales, y un único nombre/sexo. No es una integración automática completa: la consulta territorial oficial requiere otra vía de obtención validada.
