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
Motor de ejecución de código MicroPython en sandbox.
Ejecuta código de forma segura emulando la API de micro:bit.
"""
import ast
import time
import math
import random
from typing import Dict, Any, Optional
from .microbit_sim import MicrobitSimulator, Image as MicrobitImage
from .nezha_sim import NezhaSimulator


class LoopGuardTransformer(ast.NodeTransformer):
    """Añade un contador global a cada bucle antes de compilarlo."""

    @staticmethod
    def _guard() -> ast.Expr:
        return ast.Expr(
            value=ast.Call(
                func=ast.Name(id="__edumind_tick", ctx=ast.Load()),
                args=[],
                keywords=[],
            )
        )

    def visit_For(self, node: ast.For):
        self.generic_visit(node)
        node.body.insert(0, self._guard())
        return node

    def visit_While(self, node: ast.While):
        self.generic_visit(node)
        node.body.insert(0, self._guard())
        return node


class MicrobitAPI:
    """
    API emulada de micro:bit para ejecución en simulador.
    Proporciona las mismas funciones que el módulo 'microbit' real.
    """

    def __init__(self, simulator: MicrobitSimulator):
        self.sim = simulator
        self.Image = MicrobitImage

        # Display object
        self.display = DisplayAPI(simulator)

        # Button objects
        self.button_a = ButtonAPI(simulator, "a")
        self.button_b = ButtonAPI(simulator, "b")

        # Accelerometer object
        self.accelerometer = AccelerometerAPI(simulator)

        # Compass object
        self.compass = CompassAPI(simulator)

        # Pin objects
        self.pin0 = PinAPI(simulator, 0)
        self.pin1 = PinAPI(simulator, 1)
        self.pin2 = PinAPI(simulator, 2)

    def temperature(self) -> int:
        """Retorna temperatura actual"""
        return self.sim.get_temperature()

    def running_time(self) -> int:
        """Retorna tiempo de ejecución en milisegundos"""
        return int((time.time() - self.sim.last_update) * 1000)

    def sleep(self, ms: int):
        """Simula sleep (en simulador no bloquea)"""
        self.sim.add_log(f"sleep({ms}ms)")
        time.sleep(min(max(ms, 0) / 1000.0, 0.01))

    def panic(self, code: int = 0):
        """Simula panic"""
        self.sim.add_error(f"PANIC: {code}")
        self.sim.running = False

    def reset(self):
        """Resetea el micro:bit"""
        self.sim.reset()


class MusicAPI:
    """API mínima de música para código educativo y Makey Makey."""

    def __init__(self, simulator: MicrobitSimulator):
        self.sim = simulator

    def play(self, tune, wait=True, loop=False):
        """Registra la reproducción de notas sin depender de hardware real."""
        self.sim.add_log(f"music.play({tune})")

    def pitch(self, frequency: int, duration: int = -1, wait: bool = True):
        """Registra un tono simple."""
        self.sim.add_log(f"music.pitch({frequency}, {duration})")

    def stop(self):
        """Registra la parada de sonido."""
        self.sim.add_log("music.stop()")


class RandomAPI:
    """Subset seguro de random para ejemplos educativos."""

    def randint(self, a: int, b: int) -> int:
        return random.randint(a, b)

    def choice(self, values):
        return random.choice(values)

    def random(self) -> float:
        return random.random()


class MathAPI:
    """Subset seguro de math para simulaciones de sensores."""

    sqrt = staticmethod(math.sqrt)
    floor = staticmethod(math.floor)
    ceil = staticmethod(math.ceil)
    sin = staticmethod(math.sin)
    cos = staticmethod(math.cos)
    pi = math.pi


class NezhaAPI:
    """API mínima compatible con plantillas Nezha."""

    def __init__(self, simulator: Optional[NezhaSimulator]):
        self.sim = simulator or NezhaSimulator("template-preview")

    def motor(self, motor: int, speed: int):
        self.sim.motor_set(motor, speed)

    def servo(self, servo: int, angle: int):
        self.sim.servo_set(servo, angle)

    def ultrasonic(self) -> int:
        return self.sim.ultrasonic_get_distance()

    def line_sensor(self, position: str) -> int:
        return self.sim.line_sensor_read(position)

    def stop(self):
        self.sim.stop()


class DisplayAPI:
    """API del display"""

    def __init__(self, simulator: MicrobitSimulator):
        self.sim = simulator

    def show(self, image_or_text, delay=400, wait=True, loop=False, clear=False):
        """Muestra imagen o texto"""
        self.sim.display_show(image_or_text)

    def scroll(self, text: str, delay=150, wait=True, loop=False):
        """Desplaza texto"""
        self.sim.display_scroll(text)

    def clear(self):
        """Limpia display"""
        self.sim.display_clear()

    def set_pixel(self, x: int, y: int, value: int):
        """Establece pixel"""
        self.sim.display_set_pixel(x, y, value)

    def get_pixel(self, x: int, y: int) -> int:
        """Obtiene valor de pixel"""
        return self.sim.display_get_pixel(x, y)

    def read_light_level(self) -> int:
        """Lee nivel de luz usando la API del display de micro:bit."""
        return self.sim.get_light_level()

    def on(self):
        """Enciende display"""
        for y in range(5):
            for x in range(5):
                self.sim.display_set_pixel(x, y, 9)

    def off(self):
        """Apaga display"""
        self.sim.display_clear()


class ButtonAPI:
    """API de botones"""

    def __init__(self, simulator: MicrobitSimulator, button: str):
        self.sim = simulator
        self.button = button

    def is_pressed(self) -> bool:
        """Verifica si está presionado"""
        if self.button == "a":
            return self.sim.button_a_is_pressed()
        return self.sim.button_b_is_pressed()

    def was_pressed(self) -> bool:
        """Verifica si fue presionado"""
        if self.button == "a":
            return self.sim.button_a_was_pressed()
        return self.sim.button_b_was_pressed()

    def get_presses(self) -> int:
        """Obtiene contador de presiones"""
        if self.button == "a":
            return self.sim.button_a_pressed_count
        return self.sim.button_b_pressed_count


class AccelerometerAPI:
    """API del acelerómetro"""

    def __init__(self, simulator: MicrobitSimulator):
        self.sim = simulator

    def get_x(self) -> int:
        """Aceleración en eje X"""
        return self.sim.accelerometer["x"]

    def get_y(self) -> int:
        """Aceleración en eje Y"""
        return self.sim.accelerometer["y"]

    def get_z(self) -> int:
        """Aceleración en eje Z"""
        return self.sim.accelerometer["z"]

    def get_values(self) -> tuple:
        """Retorna (x, y, z)"""
        acc = self.sim.accelerometer
        return (acc["x"], acc["y"], acc["z"])

    def was_gesture(self, gesture: str) -> bool:
        """Simula gestos frecuentes a partir de valores de acelerómetro."""
        if gesture != "shake":
            return False
        acc = self.sim.accelerometer
        return max(abs(acc["x"]), abs(acc["y"]), abs(acc["z"] + 1024)) > 700


class CompassAPI:
    """API de la brújula"""

    def __init__(self, simulator: MicrobitSimulator):
        self.sim = simulator

    def heading(self) -> int:
        """Dirección en grados"""
        return self.sim.get_compass_heading()

    def is_calibrated(self) -> bool:
        """Verifica si está calibrada"""
        return self.sim.compass_calibrated

    def calibrate(self):
        """Simula calibración"""
        self.sim.compass_calibrated = True
        self.sim.add_log("Compass calibrated")


class PinAPI:
    """API de pines"""

    def __init__(self, simulator: MicrobitSimulator, pin_number: int):
        self.sim = simulator
        self.pin_number = pin_number

    def read_analog(self) -> int:
        """Lee valor analógico"""
        return self.sim.pin_read_analog(self.pin_number)

    def read_digital(self) -> int:
        """Lee valor digital"""
        return self.sim.pin_read_digital(self.pin_number)

    def write_analog(self, value: int):
        """Escribe valor analógico"""
        self.sim.pin_write_analog(self.pin_number, value)

    def write_digital(self, value: int):
        """Escribe valor digital"""
        self.sim.pin_write_digital(self.pin_number, value)

    def is_touched(self) -> bool:
        """Simula pines táctiles usados por Makey Makey."""
        return bool(self.sim.pin_read_digital(self.pin_number) or self.sim.pin_read_analog(self.pin_number) > 100)


class CodeExecutor:
    """
    Ejecutor de código MicroPython con sandbox.
    NOTA: Por seguridad, usa un subset limitado de Python.
    """

    def __init__(self, simulator: MicrobitSimulator, nezha: Optional[NezhaSimulator] = None):
        self.simulator = simulator
        self.nezha = nezha
        self.microbit_api = MicrobitAPI(simulator)
        self.music_api = MusicAPI(simulator)
        self.random_api = RandomAPI()
        self.math_api = MathAPI()
        self.nezha_api = NezhaAPI(nezha)
        self.execution_error: Optional[str] = None

    def execute_code(self, code: str, max_iterations: int = 10000) -> Dict[str, Any]:
        """
        Ejecuta código MicroPython en el simulador.

        Args:
            code: Código a ejecutar
            max_iterations: Máximo de iteraciones de bucles (seguridad)

        Returns:
            Dict con estado de ejecución y posibles errores
        """
        self.execution_error = None
        self.simulator.running = True
        self.simulator.code = code

        iteration_count = 0

        def guard_iteration():
            nonlocal iteration_count
            iteration_count += 1
            if iteration_count > max_iterations:
                raise SecurityError(
                    f"Loop iteration limit exceeded ({max_iterations})"
                )

        def safe_range(*args):
            value = range(*args)
            try:
                if len(value) > max_iterations:
                    raise SecurityError(
                        f"Range limit exceeded ({max_iterations})"
                    )
            except OverflowError as exc:
                raise SecurityError("Range is too large") from exc
            return value

        # Crear contexto de ejecución seguro
        safe_globals = {
            "__builtins__": {
                # Funciones básicas permitidas
                "print": self._safe_print,
                "range": safe_range,
                "len": len,
                "str": str,
                "int": int,
                "float": float,
                "bool": bool,
                "list": list,
                "dict": dict,
                "tuple": tuple,
                "abs": abs,
                "min": min,
                "max": max,
                "sum": sum,
                "round": round,
            },
            # API de micro:bit
            "display": self.microbit_api.display,
            "button_a": self.microbit_api.button_a,
            "button_b": self.microbit_api.button_b,
            "accelerometer": self.microbit_api.accelerometer,
            "compass": self.microbit_api.compass,
            "pin0": self.microbit_api.pin0,
            "pin1": self.microbit_api.pin1,
            "pin2": self.microbit_api.pin2,
            "temperature": self.microbit_api.temperature,
            "sleep": self.microbit_api.sleep,
            "running_time": self.microbit_api.running_time,
            "panic": self.microbit_api.panic,
            "reset": self.microbit_api.reset,
            "music": self.music_api,
            "random": self.random_api,
            "math": self.math_api,
            "Nezha": lambda: self.nezha_api,
            # Clases
            "Image": MicrobitImage,
            "__edumind_tick": guard_iteration,
        }

        try:
            # Validar código antes de ejecutar
            self._validate_code(code)

            # Pre-procesar código para eliminar imports
            processed_code = self._preprocess_code(code, max_iterations=max_iterations)

            # Instrumentar todos los bucles y ejecutar el AST validado.
            tree = ast.parse(processed_code, mode="exec")
            tree = LoopGuardTransformer().visit(tree)
            ast.fix_missing_locations(tree)
            exec(compile(tree, "<edumind-simulator>", "exec"), safe_globals, {})

            return {
                "success": True,
                "state": self.simulator.get_state(),
                "error": None
            }

        except SyntaxError as e:
            error_msg = f"Syntax Error: {str(e)}"
            self.simulator.add_error(error_msg)
            return {
                "success": False,
                "state": self.simulator.get_state(),
                "error": error_msg
            }

        except Exception as e:
            error_msg = f"Runtime Error: {str(e)}"
            self.simulator.add_error(error_msg)
            return {
                "success": False,
                "state": self.simulator.get_state(),
                "error": error_msg
            }

        finally:
            self.simulator.running = False

    def _safe_print(self, *args, **kwargs):
        """Versión segura de print que añade al log"""
        message = " ".join(str(arg) for arg in args)
        self.simulator.add_log(f"PRINT: {message}")

    def _preprocess_code(self, code: str, max_iterations: int = 10000) -> str:
        """
        Pre-procesa el código para eliminar imports de microbit.
        Esto permite que el código de micro:bit funcione sin módulos.
        """
        lines = code.split('\n')
        processed_lines = []

        loop_index = 0
        for line in lines:
            stripped = line.strip()
            # Eliminar imports de microbit (ya están disponibles globalmente)
            if stripped.startswith('from microbit import') or \
               stripped.startswith('import microbit') or \
               stripped == 'import music' or \
               stripped.startswith('from music import') or \
               stripped == 'import random' or \
               stripped == 'import math' or \
               stripped.startswith('from nezha import') or \
               stripped == 'import nezha':
                # Reemplazar por comentario
                processed_lines.append(f"# {line}")
            elif stripped == "while True:":
                indent = line[:len(line) - len(line.lstrip())]
                processed_lines.append(
                    f"{indent}for __edumind_loop_{loop_index} in range({max_iterations}):"
                )
                loop_index += 1
            else:
                processed_lines.append(line)

        return '\n'.join(processed_lines)

    def _validate_code(self, code: str):
        """
        Valida que el código no contenga operaciones peligrosas.
        """
        if len(code) > 50000:  # 50KB max
            raise SecurityError("Code too long")

        tree = ast.parse(code, mode="exec")
        allowed_modules = {"microbit", "music", "random", "math", "nezha"}
        forbidden_names = {
            "__import__",
            "eval",
            "exec",
            "compile",
            "open",
            "input",
            "breakpoint",
            "globals",
            "locals",
            "vars",
            "getattr",
            "setattr",
            "delattr",
        }

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                if any(alias.name not in allowed_modules for alias in node.names):
                    raise SecurityError("Only educational simulator imports are allowed")
            elif isinstance(node, ast.ImportFrom):
                if node.level or node.module not in allowed_modules:
                    raise SecurityError("Only educational simulator imports are allowed")
            elif isinstance(node, ast.Name):
                if node.id.startswith("__") or node.id in forbidden_names:
                    raise SecurityError(f"Forbidden name: {node.id}")
            elif isinstance(node, ast.Attribute) and node.attr.startswith("__"):
                raise SecurityError(f"Forbidden attribute: {node.attr}")
            elif isinstance(
                node,
                (ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp),
            ):
                raise SecurityError("Comprehensions are not available in the simulator")

    def execute_step(self, code: str, step: int = 0) -> Dict[str, Any]:
        """
        Ejecuta código paso a paso (para debugging).
        En implementación completa, ejecutaría línea por línea.
        """
        # Simplificado: ejecuta todo de una vez
        # En versión completa, usaría ast para ejecutar línea por línea
        return self.execute_code(code)


class SecurityError(Exception):
    """Error de seguridad en ejecución de código"""
    pass


def create_executor(simulator_id: str = "default") -> CodeExecutor:
    """Factory function para crear ejecutor con simulador"""
    simulator = MicrobitSimulator(simulator_id)
    return CodeExecutor(simulator)
