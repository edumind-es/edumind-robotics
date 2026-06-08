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
Servicio de validación de código MicroPython.
Proporciona análisis sintáctico, detección de errores comunes y sugerencias educativas.
"""
import ast
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


class SeverityLevel(str, Enum):
    """Niveles de severidad para los mensajes de validación"""
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"
    SUGGESTION = "suggestion"


@dataclass
class ValidationMessage:
    """Mensaje de validación individual"""
    severity: SeverityLevel
    message: str
    line: Optional[int] = None
    column: Optional[int] = None
    suggestion: Optional[str] = None


@dataclass
class ValidationResult:
    """Resultado completo de validación"""
    is_valid: bool
    messages: List[ValidationMessage]
    score: int  # 0-100, calidad del código
    can_execute: bool  # Si es seguro ejecutar


class CodeValidator:
    """
    Validador de código MicroPython con enfoque educativo.
    Detecta errores comunes y proporciona sugerencias para principiantes.
    """

    # Patrones de código peligroso
    DANGEROUS_PATTERNS = [
        (r'\bimport\s+os\b', 'No se puede importar el módulo "os" en micro:bit'),
        (r'\bimport\s+sys\b', 'No se puede importar el módulo "sys" en micro:bit'),
        (r'\bimport\s+subprocess\b', 'No se puede importar "subprocess" en micro:bit'),
        (r'\bopen\s*\(', 'No se puede usar open() en el simulador'),
        (r'\beval\s*\(', 'No se puede usar eval() por seguridad'),
        (r'\bexec\s*\(', 'No se puede usar exec() por seguridad'),
        (r'\bcompile\s*\(', 'No se puede usar compile() por seguridad'),
        (r'__import__', 'No se puede usar __import__() por seguridad'),
        (r'\bglobals\s*\(', 'No se puede acceder a globals()'),
        (r'\blocals\s*\(', 'No se puede acceder a locals()'),
    ]

    # Imports válidos para micro:bit
    VALID_IMPORTS = [
        'microbit', 'random', 'math', 'time', 'music', 'speech',
        'neopixel', 'radio', 'machine', 'micropython'
    ]

    # Errores comunes de principiantes
    COMMON_MISTAKES = [
        {
            'pattern': r'print\s*\([^)]*\)',
            'severity': SeverityLevel.INFO,
            'message': 'print() funcionará pero no se verá en hardware. Usa display.scroll() para mostrar texto.',
            'suggestion': 'Cambia print("texto") por display.scroll("texto")'
        },
        {
            'pattern': r'display\.show\s*\(\s*["\'][^"\']{2,}["\']\s*\)',
            'severity': SeverityLevel.WARNING,
            'message': 'display.show() con texto largo solo mostrará la primera letra.',
            'suggestion': 'Para texto largo usa display.scroll() en lugar de display.show()'
        },
        {
            'pattern': r'while\s+True\s*:(?!.*sleep)',
            'severity': SeverityLevel.WARNING,
            'message': 'Bucle infinito sin sleep() puede bloquear el simulador.',
            'suggestion': 'Añade sleep(100) dentro del bucle para permitir que el simulador responda'
        },
        {
            'pattern': r'from\s+microbit\s+import\s+display',
            'severity': SeverityLevel.INFO,
            'message': 'Puedes usar "from microbit import *" para importar todo.',
            'suggestion': 'from microbit import * es más sencillo para principiantes'
        },
    ]

    # Buenas prácticas
    BEST_PRACTICES = [
        {
            'check': lambda code: 'from microbit import' not in code and 'import microbit' not in code,
            'message': 'Falta importar el módulo microbit',
            'suggestion': 'Añade "from microbit import *" al inicio del código',
            'severity': SeverityLevel.ERROR
        },
        {
            'check': lambda code: len(code.strip()) < 10,
            'message': 'El código parece estar vacío o muy corto',
            'suggestion': 'Escribe al menos una acción, por ejemplo: display.show(Image.HEART)',
            'severity': SeverityLevel.WARNING
        },
    ]

    def __init__(self):
        self.messages: List[ValidationMessage] = []

    def validate(self, code: str) -> ValidationResult:
        """
        Valida el código completo y retorna resultado con mensajes.
        
        Args:
            code: Código MicroPython a validar
            
        Returns:
            ValidationResult con estado y mensajes
        """
        self.messages = []
        score = 100
        can_execute = True

        # 1. Verificar código vacío
        if not code or not code.strip():
            self.messages.append(ValidationMessage(
                severity=SeverityLevel.ERROR,
                message="El código está vacío",
                suggestion="Escribe código Python para micro:bit"
            ))
            return ValidationResult(
                is_valid=False,
                messages=self.messages,
                score=0,
                can_execute=False
            )

        # 2. Verificar longitud máxima
        if len(code) > 50000:
            self.messages.append(ValidationMessage(
                severity=SeverityLevel.ERROR,
                message="El código es demasiado largo (máximo 50KB)",
                suggestion="Reduce el tamaño del código"
            ))
            return ValidationResult(
                is_valid=False,
                messages=self.messages,
                score=0,
                can_execute=False
            )

        # 3. Verificar patrones peligrosos
        for pattern, msg in self.DANGEROUS_PATTERNS:
            if re.search(pattern, code):
                self.messages.append(ValidationMessage(
                    severity=SeverityLevel.ERROR,
                    message=msg
                ))
                can_execute = False
                score -= 25

        # 4. Verificar sintaxis
        syntax_result = self._check_syntax(code)
        if not syntax_result[0]:
            self.messages.append(ValidationMessage(
                severity=SeverityLevel.ERROR,
                message=f"Error de sintaxis: {syntax_result[1]}",
                line=syntax_result[2],
                suggestion="Revisa la sintaxis del código en la línea indicada"
            ))
            can_execute = False
            score -= 30

        # 5. Verificar buenas prácticas
        for practice in self.BEST_PRACTICES:
            if practice['check'](code):
                self.messages.append(ValidationMessage(
                    severity=practice['severity'],
                    message=practice['message'],
                    suggestion=practice['suggestion']
                ))
                if practice['severity'] == SeverityLevel.ERROR:
                    score -= 20
                elif practice['severity'] == SeverityLevel.WARNING:
                    score -= 10

        # 6. Verificar errores comunes
        for mistake in self.COMMON_MISTAKES:
            if re.search(mistake['pattern'], code, re.DOTALL):
                self.messages.append(ValidationMessage(
                    severity=mistake['severity'],
                    message=mistake['message'],
                    suggestion=mistake['suggestion']
                ))
                if mistake['severity'] == SeverityLevel.WARNING:
                    score -= 5

        # 7. Verificar imports
        self._check_imports(code)

        # Ajustar score
        score = max(0, min(100, score))

        # Determinar si es válido
        is_valid = not any(
            msg.severity == SeverityLevel.ERROR 
            for msg in self.messages
        )

        return ValidationResult(
            is_valid=is_valid,
            messages=self.messages,
            score=score,
            can_execute=can_execute
        )

    def _check_syntax(self, code: str) -> Tuple[bool, str, Optional[int]]:
        """
        Verifica sintaxis Python usando AST.
        
        Returns:
            (es_válido, mensaje_error, número_línea)
        """
        try:
            # Preprocesar para quitar imports de microbit antes de parsear
            preprocessed = self._preprocess_for_syntax(code)
            ast.parse(preprocessed)
            return (True, "", None)
        except SyntaxError as e:
            return (False, str(e.msg), e.lineno)
        except Exception as e:
            return (False, str(e), None)

    def _preprocess_for_syntax(self, code: str) -> str:
        """
        Preprocesa código para validación sintáctica.
        Reemplaza imports de microbit por código válido.
        """
        # Reemplazar "from microbit import *" por un placeholder válido
        code = re.sub(
            r'from\s+microbit\s+import\s+\*',
            '# placeholder: from microbit import *',
            code
        )
        code = re.sub(
            r'import\s+microbit',
            '# placeholder: import microbit',
            code
        )
        return code

    def _check_imports(self, code: str):
        """Verifica que los imports sean válidos para micro:bit"""
        import_pattern = r'(?:from|import)\s+(\w+)'
        imports = re.findall(import_pattern, code)
        
        for imp in imports:
            if imp not in self.VALID_IMPORTS:
                self.messages.append(ValidationMessage(
                    severity=SeverityLevel.WARNING,
                    message=f'El módulo "{imp}" puede no estar disponible en micro:bit',
                    suggestion=f'Usa solo módulos compatibles: {", ".join(self.VALID_IMPORTS[:5])}...'
                ))

    def get_suggestions(self, code: str) -> List[Dict]:
        """
        Obtiene sugerencias educativas para mejorar el código.
        
        Returns:
            Lista de sugerencias con título, descripción y código ejemplo
        """
        suggestions = []
        
        # Sugerencia: añadir comentarios
        if '#' not in code:
            suggestions.append({
                'title': '💡 Añade comentarios',
                'description': 'Los comentarios ayudan a entender el código',
                'example': '# Este código muestra un corazón\ndisplay.show(Image.HEART)'
            })

        # Sugerencia: usar funciones
        if 'def ' not in code and len(code) > 200:
            suggestions.append({
                'title': '📦 Organiza con funciones',
                'description': 'Las funciones hacen el código más legible',
                'example': 'def mostrar_animacion():\n    display.show(Image.HEART)\n    sleep(500)\n    display.clear()'
            })

        # Sugerencia: manejar botones
        if 'button' not in code.lower():
            suggestions.append({
                'title': '🔘 Usa los botones',
                'description': 'Los botones A y B permiten interacción',
                'example': 'if button_a.is_pressed():\n    display.show(Image.HAPPY)'
            })

        # Sugerencia: usar sensores
        if 'temperature' not in code and 'accelerometer' not in code:
            suggestions.append({
                'title': '🌡️ Explora los sensores',
                'description': 'micro:bit tiene sensores de temperatura y movimiento',
                'example': 'temp = temperature()\ndisplay.scroll(str(temp))'
            })

        return suggestions

    def get_line_errors(self, code: str) -> Dict[int, List[str]]:
        """
        Obtiene errores organizados por línea para el editor.
        
        Returns:
            Diccionario {número_línea: [lista_de_errores]}
        """
        result = self.validate(code)
        errors_by_line: Dict[int, List[str]] = {}
        
        for msg in result.messages:
            if msg.line:
                if msg.line not in errors_by_line:
                    errors_by_line[msg.line] = []
                errors_by_line[msg.line].append(msg.message)
        
        return errors_by_line


# Instancia global del validador
code_validator = CodeValidator()
