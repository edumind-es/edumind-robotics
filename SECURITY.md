# Política de seguridad

## Cómo informar de un fallo

**No abras un issue público.** Escribe a **contacto@edumind.es** con el asunto `[Seguridad]`.

También puedes usar el aviso privado de GitHub: pestaña **Security → Report a vulnerability** de este repositorio.

Incluye, en la medida en que puedas: qué has encontrado, cómo reproducirlo, qué impacto crees que tiene y en qué versión o URL lo has visto.

## Qué puedes esperar

| | |
|---|---|
| Acuse de recibo | en 72 horas |
| Primera valoración | en 7 días naturales |
| Corrección de fallos graves | lo antes posible, con aviso a quien informó antes de publicarla |

Este proyecto lo mantiene una sola persona compaginándolo con la docencia. Los plazos son compromisos de buena fe, no un SLA contractual. Si un aviso queda sin respuesta, insiste: se habrá perdido, no ignorado.

## Divulgación responsable

Te pedimos que no hagas público el fallo hasta que exista una corrección o hayan pasado 90 días desde el aviso. A cambio, se te acredita en las notas de la versión salvo que prefieras el anonimato.

No hay programa de recompensas: es un proyecto educativo sin financiación.

## Datos de alumnado

Si el fallo expone datos personales de menores, **dilo en la primera línea del correo**. Esos avisos se tratan como prioridad absoluta y por delante de cualquier otra consideración.

Nunca incluyas datos reales de alumnado en el aviso, ni siquiera como prueba del fallo: descríbelo, no lo adjuntes.

## Alcance

Este repositorio es una *release saneada*: excluye deliberadamente secretos de producción, configuración viva, copias de seguridad, contenido subido por personas usuarias y estado de despliegue. Los ficheros `.env.example` son plantillas — **genera secretos nuevos en cada instalación**.

Si despliegas un fork, revisa antes: autenticación, CORS, cookies, permisos de base de datos, gestión de subidas, límites de peticiones, registros, copias de seguridad e integraciones con terceros.
