# Privacidad — EDUmind Robotics Lab

Qué datos maneja la app, dónde se quedan y cuánto tiempo. (Este es el texto
en español que describe la app en sí; `PRIVACY.md` describe el alcance de
esta publicación del código.)

## Lo que NO hace

- No pide nombre, apellidos, correo, curso ni ningún dato identificativo.
- No tiene cuentas de alumnado. El inicio de sesión (SSO) es opcional y
  está pensado para el profesorado; en la instancia pública está apagado.
- No lleva analítica (Matomo se retiró en la v1.0.1) ni cookies.
- No carga nada de terceros al abrir: tipografías, editor y estilos van
  dentro del propio sitio. Los únicos enlaces externos son los del pie
  (licencias, GitHub, redes) y las instrucciones de exportación (MakeCode,
  Scratch, Mu), que se abren en una ventana nueva solo si se pulsan.
- No envía nada a proveedores de IA: el tutor es un modelo que corre en el
  mismo servidor de la app (Ollama). El backend rechaza cualquier dirección
  de Ollama que no sea local.

## Lo que guarda el navegador (solo en ese dispositivo)

En `localStorage`, sin fecha de caducidad, hasta que se borren los datos
del sitio en el navegador:

| Clave | Contenido |
|---|---|
| `edumind_robotics_projects` | proyectos guardados (nombre del proyecto y código) |
| historial de código | últimas versiones del código del editor |
| logros | qué hitos se han conseguido |
| tema, modo e-ink, preferencias de accesibilidad e idioma | ajustes de la interfaz |

Nada de esto sale del dispositivo salvo que el propio usuario use
«Exportar» (descarga un fichero en su equipo).

## Lo que recibe el servidor

- Las preguntas al tutor y el código que se pide explicar o simular llegan
  al backend de la propia app (`/api/...`) para procesarse. **No se
  guardan**: no hay base de datos ni escritura a fichero; `/api/system/policy`
  lo declara (`prompts_persisted: false`).
- El servidor web (nginx) guarda registros de acceso con la IP anonimizada
  y los borra según la política de purga del servidor de EDUmind.
- Si un centro instala su propia instancia, esos registros quedan en su
  servidor y bajo su responsabilidad.

## Consejo para el aula

El atajo «Mostrar mi nombre en LEDs» invita a escribir un nombre en el
chat. Llega al servidor de la app y no se guarda, pero si se prefiere
evitarlo, basta con usar un apodo o una palabra cualquiera.

## Contacto

Luis Vilela Acuña · EDUmind® · contacto@edumind.es
