#
# Copyright (C) 2024-2025 EDUmind - Los Mundos Edufis
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
Servicio de generación de código MicroPython.
Proporciona plantillas, ejemplos y generación basada en IA.
"""
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum


class DifficultyLevel(str, Enum):
    """Niveles de dificultad"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class Platform(str, Enum):
    """Plataformas soportadas"""
    MICROBIT = "microbit"
    NEZHA = "nezha"
    MAKEY_MAKEY = "makey_makey"


@dataclass
class CodeTemplate:
    """Plantilla de código educativo"""
    id: str
    title: str
    description: str
    difficulty: DifficultyLevel
    platform: Platform
    code: str
    tags: List[str]
    explanation: str


class CodeGenerator:
    """
    Generador de código educativo para micro:bit, Nezha y Makey Makey.
    Proporciona plantillas y generación basada en objetivos.
    """

    def __init__(self):
        self.templates = self._load_templates()

    def _load_templates(self) -> Dict[str, CodeTemplate]:
        """Carga catálogo de plantillas de código"""
        templates = {
            # ===== MICRO:BIT BEGINNER =====
            "heart_blink": CodeTemplate(
                id="heart_blink",
                title="❤️ Corazón parpadeante",
                description="Muestra un corazón que parpadea en la matriz LED",
                difficulty=DifficultyLevel.BEGINNER,
                platform=Platform.MICROBIT,
                code='''from microbit import *

# Corazón que parpadea infinitamente
while True:
    display.show(Image.HEART)  # Mostrar corazón
    sleep(500)                  # Esperar medio segundo
    display.clear()             # Apagar LEDs
    sleep(500)                  # Esperar medio segundo
''',
                tags=["led", "animación", "bucle"],
                explanation="Este código usa un bucle infinito (while True) para mostrar y ocultar un corazón."
            ),

            "hello_world": CodeTemplate(
                id="hello_world",
                title="👋 Hola Mundo",
                description="Muestra un mensaje de bienvenida en el display",
                difficulty=DifficultyLevel.BEGINNER,
                platform=Platform.MICROBIT,
                code='''from microbit import *

# Mostrar mensaje de bienvenida
display.scroll("Hola!")

# Luego mostrar una cara feliz
display.show(Image.HAPPY)
''',
                tags=["texto", "scroll", "display"],
                explanation="display.scroll() hace que el texto se desplace por la pantalla."
            ),

            "button_counter": CodeTemplate(
                id="button_counter",
                title="🔢 Contador con botones",
                description="Cuenta presiones del botón A y muestra el número",
                difficulty=DifficultyLevel.BEGINNER,
                platform=Platform.MICROBIT,
                code='''from microbit import *

contador = 0

while True:
    if button_a.was_pressed():
        contador = contador + 1
        display.show(str(contador))
    
    if button_b.was_pressed():
        contador = 0
        display.show("0")
    
    sleep(50)  # Pequeña pausa
''',
                tags=["botones", "contador", "interactividad"],
                explanation="button_a.was_pressed() detecta si el botón fue presionado desde la última vez que lo comprobamos."
            ),

            "dice": CodeTemplate(
                id="dice",
                title="🎲 Dado digital",
                description="Genera un número aleatorio al agitar el micro:bit",
                difficulty=DifficultyLevel.BEGINNER,
                platform=Platform.MICROBIT,
                code='''from microbit import *
import random

while True:
    # Detectar si se agita el micro:bit
    if accelerometer.was_gesture("shake"):
        # Generar número del 1 al 6
        numero = random.randint(1, 6)
        display.show(str(numero))
    
    sleep(50)
''',
                tags=["aleatorio", "acelerómetro", "juego"],
                explanation="El acelerómetro detecta gestos como sacudir (shake) el dispositivo."
            ),

            "thermometer": CodeTemplate(
                id="thermometer",
                title="🌡️ Termómetro",
                description="Muestra la temperatura actual",
                difficulty=DifficultyLevel.BEGINNER,
                platform=Platform.MICROBIT,
                code='''from microbit import *

while True:
    # Leer temperatura en Celsius
    temp = temperature()
    
    # Mostrar en pantalla
    display.scroll(str(temp) + "C")
    
    # Esperar 2 segundos antes de volver a medir
    sleep(2000)
''',
                tags=["sensor", "temperatura"],
                explanation="temperature() retorna la temperatura del procesador en grados Celsius."
            ),

            # ===== MICRO:BIT INTERMEDIATE =====
            "compass": CodeTemplate(
                id="compass",
                title="🧭 Brújula digital",
                description="Muestra la dirección hacia el norte",
                difficulty=DifficultyLevel.INTERMEDIATE,
                platform=Platform.MICROBIT,
                code='''from microbit import *

# Calibrar brújula primero
compass.calibrate()

while True:
    # Obtener dirección (0-359 grados)
    direccion = compass.heading()
    
    # Determinar punto cardinal
    if direccion < 45 or direccion >= 315:
        display.show("N")
    elif direccion < 135:
        display.show("E")
    elif direccion < 225:
        display.show("S")
    else:
        display.show("O")
    
    sleep(100)
''',
                tags=["brújula", "sensor", "navegación"],
                explanation="La brújula mide la dirección magnética. 0° es el norte."
            ),

            "light_alarm": CodeTemplate(
                id="light_alarm",
                title="🔦 Alarma de luz",
                description="Activa alarma cuando hay poca luz",
                difficulty=DifficultyLevel.INTERMEDIATE,
                platform=Platform.MICROBIT,
                code='''from microbit import *

UMBRAL_LUZ = 50  # Nivel de luz mínimo

while True:
    nivel_luz = display.read_light_level()
    
    if nivel_luz < UMBRAL_LUZ:
        # ¡Poca luz! Mostrar advertencia
        display.show(Image.SAD)
        sleep(200)
        display.clear()
        sleep(200)
    else:
        # Luz suficiente
        display.show(Image.HAPPY)
    
    sleep(100)
''',
                tags=["sensor", "luz", "alarma"],
                explanation="display.read_light_level() usa los LEDs como sensor de luz."
            ),

            "step_counter": CodeTemplate(
                id="step_counter",
                title="👟 Contador de pasos",
                description="Cuenta pasos usando el acelerómetro",
                difficulty=DifficultyLevel.INTERMEDIATE,
                platform=Platform.MICROBIT,
                code='''from microbit import *
import math

pasos = 0
ultimo_valor = 0
UMBRAL = 300  # Sensibilidad del detector

while True:
    # Calcular magnitud del movimiento
    x = accelerometer.get_x()
    y = accelerometer.get_y()
    z = accelerometer.get_z()
    magnitud = math.sqrt(x*x + y*y + z*z)
    
    # Detectar paso (cambio brusco)
    if abs(magnitud - ultimo_valor) > UMBRAL:
        pasos = pasos + 1
        display.show(str(pasos % 10))  # Mostrar último dígito
    
    ultimo_valor = magnitud
    sleep(50)
''',
                tags=["acelerómetro", "fitness", "sensor"],
                explanation="Detectamos pasos midiendo cambios bruscos en la aceleración."
            ),

            # ===== NEZHA TEMPLATES =====
            "nezha_motors": CodeTemplate(
                id="nezha_motors",
                title="🚗 Control de motores",
                description="Mueve un robot con dos motores",
                difficulty=DifficultyLevel.BEGINNER,
                platform=Platform.NEZHA,
                code='''from microbit import *
from nezha import *

# Crear objeto Nezha
robot = Nezha()

while True:
    if button_a.is_pressed():
        # Avanzar: ambos motores hacia adelante
        robot.motor(1, 50)   # Motor 1 al 50%
        robot.motor(2, 50)   # Motor 2 al 50%
    elif button_b.is_pressed():
        # Retroceder
        robot.motor(1, -50)
        robot.motor(2, -50)
    else:
        # Parar
        robot.motor(1, 0)
        robot.motor(2, 0)
    
    sleep(50)
''',
                tags=["motores", "robot", "nezha"],
                explanation="Los motores aceptan valores de -100 a 100. Negativo = reversa."
            ),

            "nezha_servo": CodeTemplate(
                id="nezha_servo",
                title="🦾 Control de servo",
                description="Mueve un servomotor con los botones",
                difficulty=DifficultyLevel.BEGINNER,
                platform=Platform.NEZHA,
                code='''from microbit import *
from nezha import *

robot = Nezha()
angulo = 90  # Posición inicial: centro

while True:
    if button_a.is_pressed():
        # Girar hacia la izquierda
        angulo = max(0, angulo - 10)
        robot.servo(1, angulo)
        display.show("<")
    
    if button_b.is_pressed():
        # Girar hacia la derecha
        angulo = min(180, angulo + 10)
        robot.servo(1, angulo)
        display.show(">")
    
    sleep(100)
''',
                tags=["servo", "robot", "nezha"],
                explanation="Los servos tienen un rango de 0° a 180°."
            ),

            "nezha_obstacle": CodeTemplate(
                id="nezha_obstacle",
                title="🚧 Evitar obstáculos",
                description="Robot que detecta y evita obstáculos",
                difficulty=DifficultyLevel.INTERMEDIATE,
                platform=Platform.NEZHA,
                code='''from microbit import *
from nezha import *

robot = Nezha()
DISTANCIA_SEGURA = 20  # centímetros

while True:
    # Leer sensor ultrasónico
    distancia = robot.ultrasonic()
    
    if distancia < DISTANCIA_SEGURA:
        # ¡Obstáculo! Retroceder y girar
        display.show("!")
        robot.motor(1, -50)
        robot.motor(2, -50)
        sleep(500)
        
        # Girar a la derecha
        robot.motor(1, 50)
        robot.motor(2, -50)
        sleep(300)
    else:
        # Camino libre, avanzar
        display.show(Image.HAPPY)
        robot.motor(1, 40)
        robot.motor(2, 40)
    
    sleep(100)
''',
                tags=["ultrasónico", "robot", "autónomo"],
                explanation="El sensor ultrasónico mide distancias de 2 a 400 cm."
            ),

            "nezha_line_follower": CodeTemplate(
                id="nezha_line_follower",
                title="➖ Seguidor de línea",
                description="Robot que sigue una línea negra",
                difficulty=DifficultyLevel.INTERMEDIATE,
                platform=Platform.NEZHA,
                code='''from microbit import *
from nezha import *

robot = Nezha()

while True:
    # Leer sensores de línea (izquierda, centro, derecha)
    izq = robot.line_sensor("left")
    centro = robot.line_sensor("center")
    der = robot.line_sensor("right")
    
    if centro:
        # Centrado en la línea, avanzar
        robot.motor(1, 40)
        robot.motor(2, 40)
    elif izq:
        # Línea a la izquierda, girar izquierda
        robot.motor(1, 20)
        robot.motor(2, 40)
    elif der:
        # Línea a la derecha, girar derecha
        robot.motor(1, 40)
        robot.motor(2, 20)
    else:
        # Perdida la línea, buscar
        robot.motor(1, 30)
        robot.motor(2, -30)
    
    sleep(50)
''',
                tags=["línea", "robot", "autónomo"],
                explanation="Los sensores de línea detectan superficies oscuras/claras."
            ),

            # ===== MAKEY MAKEY TEMPLATES =====
            "makey_piano": CodeTemplate(
                id="makey_piano",
                title="🎹 Piano interactivo",
                description="Crea un piano con objetos conductores",
                difficulty=DifficultyLevel.BEGINNER,
                platform=Platform.MAKEY_MAKEY,
                code='''from microbit import *
import music

# Notas musicales para cada pin
NOTAS = {
    0: "C4:4",    # Pin 0 = Do
    1: "D4:4",    # Pin 1 = Re
    2: "E4:4",    # Pin 2 = Mi
}

while True:
    # Leer cada pin táctil
    if pin0.is_touched():
        music.play(NOTAS[0])
        display.show("1")
    
    if pin1.is_touched():
        music.play(NOTAS[1])
        display.show("2")
    
    if pin2.is_touched():
        music.play(NOTAS[2])
        display.show("3")
    
    sleep(50)
''',
                tags=["música", "táctil", "makey"],
                explanation="Los pines táctiles detectan cuando tocas objetos conductores."
            ),

            "makey_controller": CodeTemplate(
                id="makey_controller",
                title="🎮 Control de juego",
                description="Usa objetos como controles de juego",
                difficulty=DifficultyLevel.BEGINNER,
                platform=Platform.MAKEY_MAKEY,
                code='''from microbit import *

# Direcciones
ARRIBA = Image("00900:00900:00900:00000:00000")
ABAJO = Image("00000:00000:00900:00900:00900")
IZQ = Image("00000:09000:09000:09000:00000")
DER = Image("00000:00090:00090:00090:00000")

while True:
    if pin0.is_touched():
        display.show(ARRIBA)
    elif pin1.is_touched():
        display.show(ABAJO)
    elif pin2.is_touched():
        display.show(IZQ)
    elif button_a.is_pressed():
        display.show(DER)
    else:
        display.clear()
    
    sleep(50)
''',
                tags=["control", "juego", "táctil"],
                explanation="Puedes crear imágenes personalizadas con la clase Image()."
            ),

            "makey_drum": CodeTemplate(
                id="makey_drum",
                title="🥁 Batería electrónica",
                description="Crea una batería con frutas u objetos",
                difficulty=DifficultyLevel.INTERMEDIATE,
                platform=Platform.MAKEY_MAKEY,
                code='''from microbit import *
import music

# Sonidos de batería (usando tonos)
BOMBO = "C2:2"
CAJA = "E4:1"
HIHAT = "G5:1"

while True:
    if pin0.is_touched():
        # Bombo
        music.play(BOMBO)
        display.show(Image.TARGET)
        sleep(100)
        display.clear()
    
    if pin1.is_touched():
        # Caja
        music.play(CAJA)
        display.show(Image.SQUARE)
        sleep(100)
        display.clear()
    
    if pin2.is_touched():
        # Hi-hat
        music.play(HIHAT)
        display.show(Image.DIAMOND_SMALL)
        sleep(50)
        display.clear()
    
    sleep(20)
''',
                tags=["música", "batería", "táctil"],
                explanation="Combina diferentes tonos para crear sonidos de percusión."
            ),
        }

        return templates

    def get_template(self, template_id: str) -> Optional[CodeTemplate]:
        """Obtiene una plantilla por ID"""
        return self.templates.get(template_id)

    def list_templates(
        self,
        platform: Optional[Platform] = None,
        difficulty: Optional[DifficultyLevel] = None
    ) -> List[CodeTemplate]:
        """
        Lista plantillas filtradas por plataforma y/o dificultad.
        """
        result = list(self.templates.values())

        if platform:
            result = [t for t in result if t.platform == platform]

        if difficulty:
            result = [t for t in result if t.difficulty == difficulty]

        return result

    def search_templates(self, query: str) -> List[CodeTemplate]:
        """
        Busca plantillas por texto en título, descripción o tags.
        """
        query = query.lower()
        results = []

        for template in self.templates.values():
            if (query in template.title.lower() or
                query in template.description.lower() or
                any(query in tag for tag in template.tags)):
                results.append(template)

        return results

    def get_template_for_objective(self, objective: str) -> Optional[CodeTemplate]:
        """
        Sugiere una plantilla basada en un objetivo del alumno.
        """
        objective_lower = objective.lower()

        # Mapeo de palabras clave a plantillas
        keyword_map = {
            ("corazón", "heart", "parpadear", "blink"): "heart_blink",
            ("hola", "mensaje", "texto", "scroll"): "hello_world",
            ("botón", "button", "contar", "contador"): "button_counter",
            ("dado", "aleatorio", "random", "juego"): "dice",
            ("temperatura", "termómetro", "calor"): "thermometer",
            ("brújula", "compass", "norte", "dirección"): "compass",
            ("luz", "oscuro", "alarma", "sensor"): "light_alarm",
            ("pasos", "caminar", "fitness"): "step_counter",
            ("motor", "mover", "robot", "ruedas"): "nezha_motors",
            ("servo", "brazo", "girar"): "nezha_servo",
            ("obstáculo", "evitar", "ultrasónico"): "nezha_obstacle",
            ("línea", "seguir", "seguidor"): "nezha_line_follower",
            ("piano", "música", "nota"): "makey_piano",
            ("control", "juego", "mando"): "makey_controller",
            ("batería", "tambor", "drum"): "makey_drum",
        }

        for keywords, template_id in keyword_map.items():
            if any(kw in objective_lower for kw in keywords):
                return self.templates.get(template_id)

        return None

    def generate_from_description(
        self,
        description: str,
        platform: Platform = Platform.MICROBIT
    ) -> str:
        """
        Genera código base desde una descripción.
        Esto crea un esqueleto que la IA puede completar.
        """
        # Detectar componentes mencionados
        uses_buttons = any(w in description.lower() for w in ["botón", "button", "presionar"])
        uses_display = any(w in description.lower() for w in ["mostrar", "display", "led", "pantalla"])
        uses_sensors = any(w in description.lower() for w in ["sensor", "temperatura", "luz", "acelerómetro"])
        uses_loop = any(w in description.lower() for w in ["siempre", "continuamente", "bucle", "infinito"])

        # Construir código base
        code_parts = ["from microbit import *", ""]
        
        if platform == Platform.NEZHA:
            code_parts.extend(["from nezha import *", "robot = Nezha()", ""])

        code_parts.append(f"# {description}")
        code_parts.append("")

        if uses_loop:
            code_parts.append("while True:")
            indent = "    "
        else:
            indent = ""

        if uses_buttons:
            code_parts.append(f"{indent}if button_a.is_pressed():")
            code_parts.append(f"{indent}    # Acción cuando se presiona A")
            code_parts.append(f"{indent}    pass")
            code_parts.append("")

        if uses_display:
            code_parts.append(f"{indent}# Mostrar algo en el display")
            code_parts.append(f"{indent}display.show(Image.HEART)")
            code_parts.append("")

        if uses_sensors:
            code_parts.append(f"{indent}# Leer sensores")
            code_parts.append(f"{indent}temp = temperature()")
            code_parts.append("")

        if uses_loop:
            code_parts.append(f"{indent}sleep(100)")

        return "\n".join(code_parts)


# Instancia global del generador
code_generator = CodeGenerator()
