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
Servicio de exportación de código.
Permite exportar código MicroPython a formatos para hardware real.
"""
import json
import re
import zipfile
import io
from typing import Optional, Dict, Any
from dataclasses import dataclass


@dataclass
class ExportResult:
    """Resultado de exportación"""
    success: bool
    data: Optional[bytes] = None
    filename: str = ""
    content_type: str = ""
    error: Optional[str] = None


class ExportService:
    """
    Servicio para exportar código a diferentes formatos.
    
    Soporta:
    - MicroPython (.py) - Archivo listo para cargar
    - MakeCode JSON - Para importar en MakeCode
    - Scratch 3.0 (.sb3) - Proyecto Scratch con extensión micro:bit
    """

    HARDWARE_PROFILES: Dict[str, Dict[str, Any]] = {
        "microbit_v1": {
            "label": "micro:bit v1",
            "platform": "micro:bit",
            "runtime": "MicroPython",
            "connection": "USB mass storage or serial flash",
            "notes": [
                "Compatible with display, buttons, accelerometer, compass and pins.",
                "Some audio features require external speaker wiring.",
            ],
        },
        "microbit_v2": {
            "label": "micro:bit v2",
            "platform": "micro:bit",
            "runtime": "MicroPython",
            "connection": "USB mass storage or serial flash",
            "notes": [
                "Compatible with display, buttons, accelerometer, compass, microphone, speaker and pins.",
                "This export only uses APIs present in the EDUmind local simulator subset unless the code says otherwise.",
            ],
        },
        "nezha": {
            "label": "Nezha + micro:bit",
            "platform": "nezha",
            "runtime": "MicroPython with Nezha extension/library",
            "connection": "Flash micro:bit, then connect to Nezha expansion board",
            "notes": [
                "Requires Nezha-compatible MicroPython library on the target setup.",
                "Check motor ports M1/M2 and servo ports before powering the robot.",
                "Start with low motor speeds while validating wiring.",
            ],
        },
        "makey_makey": {
            "label": "Makey Makey / touch pins",
            "platform": "makey_makey",
            "runtime": "MicroPython touch/pin input",
            "connection": "USB micro:bit plus conductive objects or Makey Makey style wiring",
            "notes": [
                "Uses touch-capable pins and simple music calls where available.",
                "Keep conductive objects supervised in classroom contexts.",
            ],
        },
    }

    def _safe_name(self, name: str) -> str:
        normalized = re.sub(r"[^a-zA-Z0-9_-]+", "_", name.strip())
        return normalized.strip("_") or "EDUmind_Project"

    def export_micropython(self, code: str, filename: str = "main") -> ExportResult:
        """
        Exporta código como archivo MicroPython listo para cargar.
        
        El archivo .py se puede cargar directamente al micro:bit
        usando el modo REPL o herramientas como mu-editor.
        """
        try:
            # Asegurar que el código tiene el import correcto
            if "from microbit import" not in code and "import microbit" not in code:
                code = "from microbit import *\n\n" + code
            
            return ExportResult(
                success=True,
                data=code.encode('utf-8'),
                filename=f"{self._safe_name(filename)}.py",
                content_type="text/x-python"
            )
        except Exception as e:
            return ExportResult(
                success=False,
                error=str(e)
            )

    def export_makecode_json(self, code: str, project_name: str = "EDUmind Project") -> ExportResult:
        """
        Exporta código como proyecto MakeCode.
        
        MakeCode usa un formato JSON específico que incluye
        el código Python y metadatos del proyecto.
        """
        try:
            # Estructura de proyecto MakeCode
            project = {
                "meta": {
                    "name": project_name,
                    "editor": "blocksprj"
                },
                "text": {
                    "main.py": code,
                    "README.md": f"# {project_name}\n\nProyecto creado con EDUmind Robotics Lab",
                    "pxt.json": json.dumps({
                        "name": project_name,
                        "description": "Proyecto exportado desde EDUmind Robotics Lab",
                        "dependencies": {
                            "core": "*",
                            "microbit": "*"
                        },
                        "files": ["main.py"]
                    }, indent=2)
                }
            }
            
            json_data = json.dumps(project, indent=2, ensure_ascii=False)
            
            return ExportResult(
                success=True,
                data=json_data.encode('utf-8'),
                filename=f"{self._safe_name(project_name)}_makecode.json",
                content_type="application/json"
            )
        except Exception as e:
            return ExportResult(
                success=False,
                error=str(e)
            )

    def export_scratch_sb3(self, code: str, project_name: str = "EDUmind Project") -> ExportResult:
        """
        Exporta código como proyecto Scratch 3.0 (.sb3).
        
        El formato .sb3 es un archivo ZIP que contiene:
        - project.json: Definición del proyecto
        - Sprites y assets
        """
        try:
            # Crear archivo ZIP en memoria
            zip_buffer = io.BytesIO()
            
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
                # Proyecto base de Scratch con extensión micro:bit
                project_json = {
                    "targets": [
                        {
                            "isStage": True,
                            "name": "Stage",
                            "variables": {},
                            "lists": {},
                            "broadcasts": {},
                            "blocks": {},
                            "comments": {},
                            "currentCostume": 0,
                            "costumes": [
                                {
                                    "name": "backdrop1",
                                    "dataFormat": "svg",
                                    "assetId": "cd21514d0531fdffb22204e0ec5ed84a",
                                    "md5ext": "cd21514d0531fdffb22204e0ec5ed84a.svg",
                                    "rotationCenterX": 240,
                                    "rotationCenterY": 180
                                }
                            ],
                            "sounds": [],
                            "volume": 100,
                            "layerOrder": 0,
                            "tempo": 60,
                            "videoTransparency": 50,
                            "videoState": "on",
                            "textToSpeechLanguage": "es-ES"
                        },
                        {
                            "isStage": False,
                            "name": "micro:bit",
                            "variables": {},
                            "lists": {},
                            "broadcasts": {},
                            "blocks": self._code_to_scratch_blocks(code),
                            "comments": {
                                "comment1": {
                                    "blockId": None,
                                    "x": 100,
                                    "y": 100,
                                    "width": 300,
                                    "height": 100,
                                    "minimized": False,
                                    "text": f"Código original:\n{code[:200]}..."
                                }
                            },
                            "currentCostume": 0,
                            "costumes": [
                                {
                                    "name": "microbit",
                                    "dataFormat": "svg",
                                    "assetId": "microbit_default",
                                    "rotationCenterX": 48,
                                    "rotationCenterY": 50
                                }
                            ],
                            "sounds": [],
                            "volume": 100,
                            "layerOrder": 1,
                            "visible": True,
                            "x": 0,
                            "y": 0,
                            "size": 100,
                            "direction": 90,
                            "draggable": False,
                            "rotationStyle": "all around"
                        }
                    ],
                    "monitors": [],
                    "extensions": ["microbit"],
                    "meta": {
                        "semver": "3.0.0",
                        "vm": "0.2.0",
                        "agent": "EDUmind Robotics Lab"
                    }
                }
                
                zf.writestr("project.json", json.dumps(project_json, indent=2))
                
                # Añadir asset mínimo para backdrop
                backdrop_svg = '''<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360">
                    <rect width="100%" height="100%" fill="#ffffff"/>
                </svg>'''
                zf.writestr("cd21514d0531fdffb22204e0ec5ed84a.svg", backdrop_svg)
            
            zip_buffer.seek(0)
            
            return ExportResult(
                success=True,
                data=zip_buffer.getvalue(),
                filename=f"{self._safe_name(project_name)}.sb3",
                content_type="application/x-scratch"
            )
        except Exception as e:
            return ExportResult(
                success=False,
                error=str(e)
            )

    def _code_to_scratch_blocks(self, code: str) -> Dict:
        """
        Convierte código Python a bloques Scratch básicos.
        Esta es una conversión simplificada para demostración.
        """
        blocks = {}
        block_id = 0
        
        # Detectar patrones comunes y crear bloques
        if "display.show" in code:
            block_id += 1
            blocks[f"block_{block_id}"] = {
                "opcode": "microbit_displaySymbol",
                "next": None,
                "parent": None,
                "inputs": {
                    "MATRIX": [1, "01010:10101:10001:01010:00100"]
                },
                "fields": {},
                "shadow": False,
                "topLevel": True,
                "x": 100,
                "y": 100
            }
        
        if "while True" in code:
            block_id += 1
            prev_block = f"block_{block_id - 1}" if block_id > 1 else None
            blocks[f"block_{block_id}"] = {
                "opcode": "control_forever",
                "next": None,
                "parent": prev_block,
                "inputs": {},
                "fields": {},
                "shadow": False,
                "topLevel": block_id == 1,
                "x": 100 if block_id == 1 else None,
                "y": 200 if block_id == 1 else None
            }
        
        if "button_a" in code or "button_b" in code:
            block_id += 1
            blocks[f"block_{block_id}"] = {
                "opcode": "microbit_whenButtonPressed",
                "next": None,
                "parent": None,
                "inputs": {},
                "fields": {
                    "BTN": ["A", None]
                },
                "shadow": False,
                "topLevel": True,
                "x": 300,
                "y": 100
            }
        
        return blocks

    def export_hardware_bundle(
        self,
        code: str,
        project_name: str = "EDUmind Project",
        hardware_target: str = "microbit_v2",
        settings: Optional[Dict[str, Any]] = None,
    ) -> ExportResult:
        """
        Exporta un paquete ZIP autocontenido para pasar del simulador al hardware real.

        Incluye:
        - main.py
        - hardware_profile.json
        - hardware_settings.py
        - README_HARDWARE.md
        """
        try:
            safe_name = self._safe_name(project_name)
            profile = self.HARDWARE_PROFILES.get(hardware_target, self.HARDWARE_PROFILES["microbit_v2"])
            settings = settings or {}

            micropython = self.export_micropython(code, "main")
            if not micropython.success or micropython.data is None:
                return micropython

            hardware_profile = {
                "project_name": project_name,
                "exported_by": "EDUmind Robotics Lab",
                "hardware_target": hardware_target,
                "profile": profile,
                "settings": {
                    "motor_ports": settings.get("motor_ports", {"left": 1, "right": 2}),
                    "servo_ports": settings.get("servo_ports", {"default": 1}),
                    "touch_pins": settings.get("touch_pins", [0, 1, 2]),
                    "safe_motor_speed": settings.get("safe_motor_speed", 40),
                    "requires_teacher_supervision": True,
                },
                "privacy": {
                    "contains_personal_data": False,
                    "requires_cloud_service": False,
                    "local_first": True,
                },
            }

            settings_py = f'''"""
Hardware settings generated by EDUmind Robotics Lab.
Adjust these values before running on real hardware if your wiring differs.
"""

HARDWARE_TARGET = "{hardware_target}"
MOTOR_LEFT = {hardware_profile["settings"]["motor_ports"]["left"]}
MOTOR_RIGHT = {hardware_profile["settings"]["motor_ports"]["right"]}
SERVO_DEFAULT = {hardware_profile["settings"]["servo_ports"]["default"]}
TOUCH_PINS = {hardware_profile["settings"]["touch_pins"]}
SAFE_MOTOR_SPEED = {hardware_profile["settings"]["safe_motor_speed"]}
REQUIRES_TEACHER_SUPERVISION = True
'''

            readme = self._build_hardware_readme(project_name, hardware_profile)

            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
                zf.writestr("main.py", micropython.data)
                zf.writestr("hardware_settings.py", settings_py)
                zf.writestr("hardware_profile.json", json.dumps(hardware_profile, indent=2, ensure_ascii=False))
                zf.writestr("README_HARDWARE.md", readme)

            zip_buffer.seek(0)
            return ExportResult(
                success=True,
                data=zip_buffer.getvalue(),
                filename=f"{safe_name}_{hardware_target}_hardware_bundle.zip",
                content_type="application/zip",
            )
        except Exception as e:
            return ExportResult(success=False, error=str(e))

    def _build_hardware_readme(self, project_name: str, hardware_profile: Dict[str, Any]) -> str:
        profile = hardware_profile["profile"]
        settings = hardware_profile["settings"]
        notes = "\n".join(f"- {note}" for note in profile["notes"])

        return f"""# {project_name} - paquete para hardware real

Este paquete se ha generado localmente desde EDUmind Robotics Lab.

## Hardware objetivo

- Perfil: {profile["label"]}
- Plataforma: {profile["platform"]}
- Runtime: {profile["runtime"]}
- Conexion: {profile["connection"]}

## Archivos

- `main.py`: codigo MicroPython principal.
- `hardware_settings.py`: ajustes de puertos, velocidad segura y supervision.
- `hardware_profile.json`: perfil legible por herramientas o auditoria docente.
- `README_HARDWARE.md`: estas instrucciones.

## Carga en micro:bit

1. Conecta la micro:bit por USB.
2. Abre Mu Editor o una herramienta compatible con MicroPython.
3. Revisa `hardware_settings.py` y ajusta puertos si tu montaje es distinto.
4. Carga `main.py` en la micro:bit.
5. Prueba primero sin motores elevados ni mecanismos peligrosos.

## Ajustes incluidos

- Motor izquierdo: {settings["motor_ports"]["left"]}
- Motor derecho: {settings["motor_ports"]["right"]}
- Servo por defecto: {settings["servo_ports"]["default"]}
- Pines tactiles: {settings["touch_pins"]}
- Velocidad segura recomendada: {settings["safe_motor_speed"]}
- Supervision docente requerida: si

## Notas de seguridad

{notes}

## Privacidad

Este paquete no requiere nube ni servicios externos. No incluye datos personales por diseno.
"""

    def get_hex_instructions(self) -> str:
        """
        Retorna instrucciones para generar archivo .hex.
        
        Nota: La generación real de .hex requiere el compilador
        mpy-cross y el firmware de micro:bit, lo cual es complejo
        de implementar en un servidor web.
        """
        return """
Para cargar tu código al micro:bit físico:

1. **Usando mu-editor (recomendado):**
   - Descarga mu-editor: https://codewith.mu/
   - Conecta tu micro:bit por USB
   - Copia el código .py
   - Haz clic en "Flash"

2. **Usando MakeCode:**
   - Exporta como MakeCode JSON
   - Abre https://makecode.microbit.org/
   - Importa el proyecto
   - Descarga el .hex desde MakeCode

3. **Usando Python directo:**
   - Conecta tu micro:bit
   - Copia el archivo .py a la unidad MICROBIT
   - El micro:bit ejecutará main.py automáticamente
"""


# Instancia global del servicio de exportación
export_service = ExportService()
