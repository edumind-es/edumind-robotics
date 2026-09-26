#
# Copyright (C) 2024-2026 Luis Vilela Acuña <contacto@edumind.es>
# Author: Luis Vilela Acuña
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.
#

"""
En qué lengua responde el tutor, y con qué modelo.

No todos los modelos que caben en este servidor saben todas las lenguas, y
fingir lo contrario le sirve al alumno un texto ininteligible con apariencia
de respuesta. Medido el 2026-08-29 con la misma pregunta:

- qwen2.5:3b  -> castellano, inglés y chino correctos. En galego confunde
                500 ms con "dous segundos" y castellaniza; en català
                construye frases agramaticales; en euskera produce
                galimatías ("ducha o robot ou biotu bat sekundea").
- gemma4:e4b  -> galego y català correctos ("medio segundo", gramática
                propia), a 8 tokens/s en lugar de 13. En euskera sigue
                fallando: responde en castellano o en catalán.

De ahí el reparto de abajo. El euskera no tiene modelo: la app lo dice en
voz alta y el tutor responde en castellano, en lugar de servir algo que
parece euskera y no lo es.
"""
from typing import Dict, Optional

# Cómo se llama cada lengua dentro de la instrucción al modelo.
# La orden, repetida en la lengua de destino: refuerza mucho más que decirlo
# en castellano.
ORDEN_NATIVA: Dict[str, str] = {
    "es": "Escribe en castellano.",
    "gl": "Escribe TODO en galego. Non escribas en castelán.",
    "ca": "Escriu-ho TOT en català. No escriguis en castellà.",
    "en": "Write EVERYTHING in English. Do not write in Spanish.",
    "zh": "全部用简体中文回答。不要使用西班牙语。",
}

NOMBRES: Dict[str, str] = {
    "es": "castellano",
    "gl": "galego",
    "ca": "català",
    "eu": "euskara",
    "en": "English",
    "zh": "简体中文",
}

# Lenguas que el modelo pequeño y rápido maneja bien.
IDIOMAS_MODELO_RAPIDO = {"es", "en", "zh"}

# Lenguas que necesitan el modelo grande para salir bien paradas.
IDIOMAS_MODELO_GRANDE = {"gl", "ca"}

# Lenguas sin ningún modelo capaz: se responde en castellano.
IDIOMAS_SIN_TUTOR = {"eu"}


def idioma_efectivo(idioma: str) -> str:
    """La lengua en la que el tutor puede responder de verdad."""
    return "es" if idioma in IDIOMAS_SIN_TUTOR else idioma


def instruccion_idioma(idioma: str) -> str:
    """Orden de lengua para el prompt del sistema."""
    efectivo = idioma_efectivo(idioma)
    nombre = NOMBRES.get(efectivo, NOMBRES["es"])
    # La orden va al final del prompt y en la propia lengua pedida: puesta al
    # principio y en castellano, los modelos pequeños seguían la lengua
    # dominante del resto del prompt y respondían en castellano igualmente.
    texto = (
        f"=== INSTRUCCIÓN FINAL, LA MÁS IMPORTANTE ===\n"
        f"Toda tu respuesta debe estar escrita en {nombre}. "
        f"{ORDEN_NATIVA.get(efectivo, '')} "
        f"No escribas ni una sola frase en otra lengua. "
        f"Los nombres de las funciones de MicroPython no se traducen nunca: "
        f"display.show, sleep, button_a y demás se escriben igual en todas las lenguas."
    )
    if idioma in IDIOMAS_SIN_TUTOR:
        texto += (
            "\nEl alumno tiene la app en euskera pero ningún modelo disponible "
            "escribe euskera correcto, así que se le responde en castellano."
        )
    return texto


def modelo_para(idioma: str, por_defecto: str) -> Optional[str]:
    """
    Qué modelo usar. Devuelve None para quedarse con el de siempre.

    El modelo grande vive en la otra instancia de Ollama del servidor, así que
    también hay que cambiar de endpoint (ver endpoint_para).
    """
    if idioma in IDIOMAS_MODELO_GRANDE:
        return "gemma4:e4b"
    return None if idioma in IDIOMAS_MODELO_RAPIDO else por_defecto


def endpoint_para(idioma: str) -> Optional[str]:
    """Endpoint alternativo cuando la lengua necesita el modelo grande."""
    if idioma in IDIOMAS_MODELO_GRANDE:
        return "http://127.0.0.1:11435"
    return None


# Andamiaje del "explícame esta línea" en cada lengua.
#
# Pedirle a un modelo pequeño que responda en inglés mientras el resto del
# prompt está en castellano no funciona: sigue la lengua dominante. Con el
# chino sí funcionaba, porque cambia de alfabeto. La solución es escribirle
# las instrucciones directamente en la lengua de destino.
PLANTILLA_LINEA: Dict[str, str] = {
    "es": """Este es el programa completo del alumno:

```
{numerado}
```

Explica ÚNICAMENTE la línea {linea}: `{objetivo}`

Responde estas tres cosas, para un alumno de primaria:
1. Qué hace esa línea exactamente.
2. Por qué hace falta ahí, con las líneas que la rodean.
3. Qué pasaría si la borrase o cambiase su valor.

No expliques el resto del programa. No repitas el código entero.""",
    "gl": """Este é o programa completo do alumno:

```
{numerado}
```

Explica UNICAMENTE a liña {linea}: `{objetivo}`

Responde estas tres cousas, para un alumno de primaria:
1. Que fai esa liña exactamente.
2. Por que fai falta aí, coas liñas que a rodean.
3. Que pasaría se a borrase ou cambiase o seu valor.

Non expliques o resto do programa. Non repitas o código enteiro.
Escribe TODO en galego.""",
    "ca": """Aquest és el programa complet de l'alumne:

```
{numerado}
```

Explica NOMÉS la línia {linea}: `{objetivo}`

Respon aquestes tres coses, per a un alumne de primària:
1. Què fa aquesta línia exactament.
2. Per què cal aquí, amb les línies del voltant.
3. Què passaria si l'esborrés o en canviés el valor.

No expliquis la resta del programa. No repeteixis tot el codi.
Escriu-ho TOT en català.""",
    "en": """This is the pupil's complete program:

```
{numerado}
```

Explain ONLY line {linea}: `{objetivo}`

Answer these three things, for a primary-school pupil:
1. What that line does exactly.
2. Why it is needed there, in relation to the lines around it.
3. What would happen if they deleted it or changed its value.

Do not explain the rest of the program. Do not repeat the whole code.
Write your entire answer in English.""",
    "zh": """这是学生的完整程序：

```
{numerado}
```

只讲解第 {linea} 行：`{objetivo}`

请回答三件事，对象是小学生：
1. 这一行具体做什么。
2. 为什么这里需要它，和前后几行的关系。
3. 如果删掉它或改变它的数值会怎样。

不要讲解程序的其他部分，也不要重复整段代码。
全部用简体中文回答。""",
}


def plantilla_linea(idioma: str) -> str:
    """Instrucciones de 'explícame esta línea' en la lengua del alumno."""
    return PLANTILLA_LINEA.get(idioma_efectivo(idioma), PLANTILLA_LINEA["es"])
