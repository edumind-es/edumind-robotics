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
Motor de lecciones y contexto educativo.
Gestiona objetivos, lecciones predefinidas y progreso del alumno.
"""
from typing import Dict, List, Optional
from enum import Enum
import json


class DifficultyLevel(str, Enum):
    """Niveles de dificultad"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class PlatformType(str, Enum):
    """Plataformas soportadas"""
    MICROBIT = "micro:bit"
    NEZHA = "nezha"


class LanguageType(str, Enum):
    """Lenguajes de programación soportados"""
    MICROPYTHON = "micropython"
    JAVASCRIPT = "javascript"
    MAKECODE = "makecode"
    SCRATCH = "scratch"


class LessonEngine:
    """Motor de lecciones educativas"""

    def __init__(self):
        self.lessons = self._load_default_lessons()
        self.challenges = self._load_default_challenges()

    def _load_default_lessons(self) -> Dict:
        """Carga catálogo de lecciones predefinidas"""
        return {
            "microbit_basics": {
                "id": "microbit_basics",
                "title": "Fundamentos de micro:bit",
                "description": "Aprende los conceptos básicos de programación con micro:bit",
                "platform": PlatformType.MICROBIT,
                "difficulty": DifficultyLevel.BEGINNER,
                "objectives": [
                    {
                        "id": "led_blink",
                        "title": "Hacer parpadear un LED",
                        "description": "Aprende a controlar los LEDs de la matriz 5x5",
                        "estimated_time": "10 min",
                        "languages": [LanguageType.MICROPYTHON, LanguageType.JAVASCRIPT]
                    },
                    {
                        "id": "button_input",
                        "title": "Detectar pulsación de botones",
                        "description": "Usa los botones A y B para interactuar",
                        "estimated_time": "15 min",
                        "languages": [LanguageType.MICROPYTHON, LanguageType.JAVASCRIPT]
                    },
                    {
                        "id": "display_text",
                        "title": "Mostrar texto en la pantalla",
                        "description": "Muestra mensajes que se desplazan en el display",
                        "estimated_time": "10 min",
                        "languages": [LanguageType.MICROPYTHON, LanguageType.JAVASCRIPT]
                    },
                    {
                        "id": "temperature_sensor",
                        "title": "Leer el sensor de temperatura",
                        "description": "Obtén la temperatura del entorno",
                        "estimated_time": "15 min",
                        "languages": [LanguageType.MICROPYTHON, LanguageType.JAVASCRIPT]
                    }
                ]
            },
            "microbit_sensors": {
                "id": "microbit_sensors",
                "title": "Sensores y actuadores en micro:bit",
                "description": "Trabaja con sensores avanzados: acelerómetro, brújula, luz",
                "platform": PlatformType.MICROBIT,
                "difficulty": DifficultyLevel.INTERMEDIATE,
                "objectives": [
                    {
                        "id": "accelerometer",
                        "title": "Usar el acelerómetro",
                        "description": "Detecta movimiento y orientación",
                        "estimated_time": "20 min",
                        "languages": [LanguageType.MICROPYTHON, LanguageType.JAVASCRIPT]
                    },
                    {
                        "id": "compass",
                        "title": "Crear una brújula digital",
                        "description": "Usa el magnetómetro para orientación",
                        "estimated_time": "25 min",
                        "languages": [LanguageType.MICROPYTHON, LanguageType.JAVASCRIPT]
                    },
                    {
                        "id": "light_sensor",
                        "title": "Medir nivel de luz ambiental",
                        "description": "Usa el display como sensor de luz",
                        "estimated_time": "15 min",
                        "languages": [LanguageType.MICROPYTHON, LanguageType.JAVASCRIPT]
                    }
                ]
            },
            "nezha_basics": {
                "id": "nezha_basics",
                "title": "Iniciación con Nezha",
                "description": "Programa tu primer robot con Nezha + micro:bit",
                "platform": PlatformType.NEZHA,
                "difficulty": DifficultyLevel.BEGINNER,
                "objectives": [
                    {
                        "id": "motor_control",
                        "title": "Controlar motores DC",
                        "description": "Aprende a mover tu robot con motores",
                        "estimated_time": "20 min",
                        "languages": [LanguageType.MICROPYTHON, LanguageType.SCRATCH]
                    },
                    {
                        "id": "servo_control",
                        "title": "Usar servomotores",
                        "description": "Control preciso de ángulos con servos",
                        "estimated_time": "20 min",
                        "languages": [LanguageType.MICROPYTHON, LanguageType.SCRATCH]
                    },
                    {
                        "id": "ultrasonic_sensor",
                        "title": "Sensor ultrasónico de distancia",
                        "description": "Evita obstáculos con sensor de ultrasonidos",
                        "estimated_time": "25 min",
                        "languages": [LanguageType.MICROPYTHON, LanguageType.SCRATCH]
                    }
                ]
            },
            "nezha_projects": {
                "id": "nezha_projects",
                "title": "Proyectos con Nezha",
                "description": "Construye robots autónomos y creativos",
                "platform": PlatformType.NEZHA,
                "difficulty": DifficultyLevel.INTERMEDIATE,
                "objectives": [
                    {
                        "id": "line_follower",
                        "title": "Robot seguidor de línea",
                        "description": "Usa sensores de línea para seguir trazados",
                        "estimated_time": "40 min",
                        "languages": [LanguageType.MICROPYTHON]
                    },
                    {
                        "id": "obstacle_avoidance",
                        "title": "Robot esquiva obstáculos",
                        "description": "Navegación autónoma evitando objetos",
                        "estimated_time": "35 min",
                        "languages": [LanguageType.MICROPYTHON]
                    }
                ]
            }
        }

    def _load_default_challenges(self) -> List[Dict]:
        """Carga retos creativos guiados"""
        return [
            {
                "id": "challenge_1",
                "title": "🎮 Crea un mini-juego con los botones",
                "description": "Diseña un juego de reflejos usando botones y LEDs",
                "difficulty": DifficultyLevel.BEGINNER,
                "platform": PlatformType.MICROBIT,
                "estimated_time": "30 min",
                "hint": "Usa random para generar patrones impredecibles"
            },
            {
                "id": "challenge_2",
                "title": "🌡️ Estación meteorológica",
                "description": "Muestra temperatura y nivel de luz en tiempo real",
                "difficulty": DifficultyLevel.INTERMEDIATE,
                "platform": PlatformType.MICROBIT,
                "estimated_time": "40 min",
                "hint": "Combina sensores de temperatura y luz"
            },
            {
                "id": "challenge_3",
                "title": "🤖 Robot explorador autónomo",
                "description": "Crea un robot que explore y mapee su entorno",
                "difficulty": DifficultyLevel.ADVANCED,
                "platform": PlatformType.NEZHA,
                "estimated_time": "60 min",
                "hint": "Combina sensor ultrasónico con control de motores"
            }
        ]

    def get_lesson(self, lesson_id: str) -> Optional[Dict]:
        """Obtiene una lección por ID"""
        return self.lessons.get(lesson_id)

    def get_all_lessons(self) -> List[Dict]:
        """Obtiene todas las lecciones"""
        return list(self.lessons.values())

    def get_lessons_by_platform(self, platform: PlatformType) -> List[Dict]:
        """Filtra lecciones por plataforma"""
        return [
            lesson for lesson in self.lessons.values()
            if lesson["platform"] == platform
        ]

    def get_lessons_by_difficulty(self, difficulty: DifficultyLevel) -> List[Dict]:
        """Filtra lecciones por dificultad"""
        return [
            lesson for lesson in self.lessons.values()
            if lesson["difficulty"] == difficulty
        ]

    def get_challenges(self) -> List[Dict]:
        """Obtiene todos los retos"""
        return self.challenges

    def get_challenge(self, challenge_id: str) -> Optional[Dict]:
        """Obtiene un reto específico"""
        return next(
            (c for c in self.challenges if c["id"] == challenge_id),
            None
        )

    def build_educational_context(
        self,
        objective: str,
        platform: PlatformType,
        language: LanguageType,
        difficulty: DifficultyLevel
    ) -> str:
        """
        Construye contexto educativo para la IA.

        Esto ayuda a la IA a generar respuestas más precisas y pedagógicas.
        """
        context = f"""Eres un tutor educativo especializado en robótica con micro:bit y Nezha.

CONTEXTO EDUCATIVO:
- Plataforma: {platform.value}
- Lenguaje: {language.value}
- Nivel: {difficulty.value}
- Objetivo del alumno: {objective}

BREVEDAD (prioritario): responde en menos de 200 palabras. El modelo corre en local
sobre CPU: cada palabra de más es tiempo de espera del alumno. Ve al grano, no repitas
el enunciado y no añadas secciones que nadie ha pedido.

FORMATO - Markdown, solo las secciones que hagan falta:
- Explicación breve del concepto (2-3 frases).
- Código en bloque ```python cuando aporte algo (mínimo y funcional).
- Qué hace cada línea nueva, en viñetas cortas.
- Relaciona con los componentes físicos del {platform.value} cuando venga a cuento.

Si la pregunta es conceptual y no pide código, responde solo con la explicación.
"""

        # Añadir información específica de la plataforma
        if platform == PlatformType.MICROBIT:
            # Referencia de API real. Sin esto los modelos pequeños inventan
            # funciones de Arduino (digitalWrite, led.on) o se sacan métodos
            # inexistentes; con la lista delante se ciñen a lo que el simulador
            # entiende de verdad.
            context += """
IMPORTANTE: el micro:bit NO tiene un LED suelto ni pines configurables tipo
Arduino. Tiene una MATRIZ de 5x5 LEDs integrada. Cuando el alumno dice "un LED"
se refiere a esa matriz: se enciende con `display.show(...)` o
`display.set_pixel(x, y, 9)`, nunca conectando nada a un pin.

API REAL DE MICRO:BIT EN MICROPYTHON. Usa SOLO estas funciones:
- `from microbit import *` (siempre la primera línea)
- Pantalla: `display.show(Image.HEART)`, `display.scroll("texto")`,
  `display.set_pixel(x, y, brillo)`, `display.clear()`
- Imágenes: `Image.HEART`, `Image.HAPPY`, `Image.SAD`, `Image.YES`, `Image.NO`
- Espera: `sleep(milisegundos)`
- Botones: `button_a.is_pressed()`, `button_b.was_pressed()`
- Sensores: `temperature()`, `accelerometer.get_x()`, `compass.heading()`
- Pines: `pin0.read_analog()`, `pin0.write_digital(1)`

PROHIBIDO (son de Arduino u otros entornos y NO funcionan en micro:bit):
`digitalWrite`, `analogWrite`, `delay()`, `import time`, `Pin(...)`, `pin0.on()`,
`pin0.off()`, `led.on()`, `microbit_lib`, `GPIO`.
"""
        elif platform == PlatformType.NEZHA:
            context += """
NEZHA (se programa desde el micro:bit, empieza por `from microbit import *`):
- 4 puertos de motor DC (M1-M4) y 4 de servo (S1-S4)
- Sensores disponibles: ultrasónico, seguidor de línea, color
- El micro:bit es el cerebro: la lógica y los sensores del propio micro:bit
  siguen estando disponibles con la misma API.

PROHIBIDO: `digitalWrite`, `led.on()`, `delay()`. Son de Arduino y no funcionan.
"""

        return context

    def get_step_by_step_guide(self, objective_id: str, lesson_id: str) -> Optional[Dict]:
        """Obtiene guía paso a paso para un objetivo específico"""
        lesson = self.get_lesson(lesson_id)
        if not lesson:
            return None

        objective = next(
            (obj for obj in lesson["objectives"] if obj["id"] == objective_id),
            None
        )

        return objective


# Instancia global del motor de lecciones
lesson_engine = LessonEngine()
