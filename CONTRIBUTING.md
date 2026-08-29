# Cómo colaborar en EDUmind Robotics

Gracias por acercarte. Este proyecto nace en un aula de Educación Física y crece con la gente que lo usa.

**Todo el proyecto —código, comentarios, commits e issues— está en español.** Es una decisión deliberada: quien enseña en España debe poder leer el código que usa en clase.

## Se puede colaborar sin programar

Es la vía más valiosa y la más escasa. No necesitas saber programar para:

- **Contar cómo te ha ido en clase.** Qué funcionó, qué estorbó, qué esperabas que hiciera y no hacía. Abre un issue con la plantilla *Propuesta*.
- **Reportar un fallo.** Con lo que hiciste, lo que pasó y lo que esperabas basta. Plantilla *Fallo*.
- **Revisar los textos.** Erratas, lenguaje poco claro, instrucciones que no se entienden.
- **Traducir** al gallego, catalán, euskera o inglés.
- **Revisar la accesibilidad**: contraste, tamaños, uso con teclado, lectores de pantalla.

## Montar el entorno

Las instrucciones concretas están en el [README](README.md). Además, antes del primer commit:

```bash
git config core.hooksPath .githooks
```

Esto activa los ganchos del repositorio: uno rápido antes de cada commit y la tanda completa antes de cada push. También activa el guardián que impide subir secretos por accidente.

## Flujo de trabajo

1. Abre un issue antes de ponerte con algo grande. Evita trabajo duplicado y conversaciones tardías.
2. Rama desde `main` con nombre descriptivo: `fix/marcador-no-actualiza`, `feat/exportar-pdf`.
3. Commits en imperativo y en español, con tipo: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`.
   `fix(marcador): recalcular el total al borrar un tanteo`
4. Que pase la tanda de pruebas en local antes de abrir el PR.
5. Abre el PR contra `main` y rellena la plantilla.

## Un PR no se acepta si

- Rompe las pruebas existentes.
- Añade una dependencia sin justificarla en la descripción.
- Incluye secretos, credenciales o ficheros `.env`.
- Incluye datos reales de alumnado, aunque sean de prueba.
- Cambia el comportamiento sin actualizar la documentación que lo describe.
- Está escrito en un idioma distinto del español.

## La línea roja: datos personales

Este proyecto lo usan docentes con datos de menores. Cualquier cambio que amplíe qué datos se recogen, dónde se guardan o quién puede verlos **debe discutirse en un issue antes de escribir código**, y actualizar la documentación de privacidad en el mismo PR.

Nunca subas datos reales de alumnado, ni siquiera como fixture. Usa nombres inventados.

## Nada de secretos en el repositorio

Ni claves, ni tokens, ni contraseñas, ni ficheros `.env`, ni volcados de base de datos. Si necesitas una variable nueva, añádela a `.env.example` con un valor de ejemplo y documenta para qué sirve.

Si crees que has subido un secreto por error, **no abras un issue público**: escribe a contacto@edumind.es. Ver [SECURITY.md](SECURITY.md).

## Licencia de lo que aportas

Al enviar un PR aceptas que tu contribución se publique bajo la licencia doble del proyecto, **AGPL-3.0-or-later** *o* **EUPL-1.2** (ver [LICENSE](LICENSE)).

La marca EDUmind® y sus logotipos no se ceden con el código: ver [TRADEMARKS.md](TRADEMARKS.md).

## Dudas

Abre un issue o escribe a contacto@edumind.es. No hay pregunta demasiado básica.
