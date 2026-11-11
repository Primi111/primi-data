# PRIMI DATA: paquete preparado para publicación

Esta versión incluye `ine-nombres.json` (datos nacionales oficiales del INE, referencia 2025-01-01) y los ficheros provinciales/municipales del paquete v1.0. Los datos territoriales se refieren a PRIMITIVO (hombres), no a cualquier nombre.

## Probar en el Mac

1. Descomprime el ZIP.
2. Abre Terminal en la carpeta `primi-data`.
3. Ejecuta `python3 -m http.server 8000`.
4. Visita http://localhost:8000.

## Publicar con GitHub Pages

1. Crea una cuenta en https://github.com si no tienes.
2. Crea un repositorio público, por ejemplo `primi-data`.
3. Sube **el contenido interior** de la carpeta `primi-data` a la raíz del repositorio (no la carpeta contenedora).
4. En Settings > Pages, selecciona Deploy from a branch, `main`, carpeta `/ (root)`, Save.
5. GitHub Pages mostrará la dirección pública HTTPS, normalmente `https://USUARIO.github.io/primi-data/`.

Importante: todavía no se ha publicado ni verificado la URL. No subas datos privados al repositorio público. La publicación depende de que el propietario realice los pasos en su cuenta.
