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
Genera el .hex que un micro:bit puede arrancar de verdad.

Hasta ahora la app ofrecía "exportar a .hex" y lo que devolvía eran
instrucciones para ir a MakeCode a descargarlo: una promesa sin cumplir.

Un .hex de MicroPython son dos cosas unidas: el runtime de MicroPython
(635 KB, incluido en app/firmware/) y el programa del alumno añadido en una
región concreta de la memoria flash. El formato es el de `uflash`, la
herramienta oficial de la Fundación micro:bit, y se reproduce aquí para no
depender de nada externo ni de que el aula tenga internet:

- El script va a la dirección 0x3E000, precedido de la cabecera "MP" y su
  longitud en dos bytes.
- Se rellena hasta múltiplo de 16 y se convierte a registros Intel HEX.
- Los registros se insertan antes de las cinco últimas líneas del runtime,
  que contienen datos de configuración del chip y el fin de fichero.
"""
import binascii
import struct
from pathlib import Path
from typing import List

# Dirección de la memoria flash donde el runtime busca el programa.
DIRECCION_SCRIPT = 0x3E000

# El espacio reservado para el programa del alumno.
TAMANO_MAXIMO = 0x1E00  # 7680 bytes

_RUTA_RUNTIME = (
    Path(__file__).resolve().parents[1] / "firmware" / "micropython-microbit-v1.1.1.hex"
)

_runtime_cache: str | None = None


class ScriptDemasiadoLargo(ValueError):
    """El programa no cabe en el espacio que el micro:bit reserva."""


def runtime() -> str:
    """El runtime de MicroPython, leído una sola vez."""
    global _runtime_cache
    if _runtime_cache is None:
        _runtime_cache = _RUTA_RUNTIME.read_text()
    return _runtime_cache


def _registros_del_script(script: bytes) -> List[str]:
    """Convierte el programa en registros Intel HEX en su dirección."""
    datos = b"MP" + struct.pack("<H", len(script)) + script
    # Los registros son de 16 bytes: se rellena con ceros hasta completar.
    relleno = (16 - len(datos) % 16) % 16
    datos += b"\x00" * relleno

    # Registro de dirección extendida: sitúa los siguientes en 0x0003xxxx.
    lineas = [":020000040003F7"]
    direccion = DIRECCION_SCRIPT - 0x30000

    for i in range(0, len(datos), 16):
        trozo = datos[i : i + 16]
        # longitud, dirección (2 bytes), tipo de registro (0 = datos)
        cuerpo = struct.pack(">BHB", len(trozo), direccion, 0) + trozo
        # La suma de todos los bytes del registro más su checksum debe dar 0.
        checksum = (-sum(bytearray(cuerpo))) & 0xFF
        lineas.append(
            ":%s%02X" % (binascii.hexlify(cuerpo).decode("ascii").upper(), checksum)
        )
        direccion += 16

    return lineas


def crear_hex(codigo: str) -> str:
    """
    Une el runtime de MicroPython con el programa del alumno.

    El resultado se puede copiar a la unidad MICROBIT y la placa arranca con
    ese programa.
    """
    # El micro:bit espera saltos de línea Unix.
    script = codigo.replace("\r\n", "\n").replace("\r", "\n").encode("utf-8")

    if len(script) > TAMANO_MAXIMO:
        raise ScriptDemasiadoLargo(
            f"El programa ocupa {len(script)} bytes y el micro:bit solo reserva "
            f"{TAMANO_MAXIMO}. Prueba a acortarlo o a quitar comentarios."
        )

    lineas_runtime = runtime().split()
    lineas_script = _registros_del_script(script)

    # Las cinco últimas líneas del runtime llevan la configuración del chip y
    # el fin de fichero: el programa va justo antes.
    salida = lineas_runtime[:-5] + lineas_script + lineas_runtime[-5:]
    return "\n".join(salida) + "\n"


def extraer_script(contenido_hex: str) -> str:
    """
    Recupera el programa de un .hex ya generado.

    Existe para poder comprobar en las pruebas que lo que se escribe se puede
    volver a leer: sin una placa delante, es la forma de verificar que el
    fichero está bien formado.
    """
    for indice, linea in enumerate(contenido_hex.split()):
        if not linea.startswith(":"):
            continue
        crudo = binascii.unhexlify(linea[1:])
        # Se busca el registro de datos que empieza con la cabecera "MP".
        if len(crudo) > 6 and crudo[3] == 0 and crudo[4:6] == b"MP":
            datos = b""
            for siguiente in contenido_hex.split()[indice:]:
                bloque = binascii.unhexlify(siguiente[1:])
                if bloque[3] != 0:
                    break
                datos += bloque[4:-1]
            longitud = struct.unpack("<H", datos[2:4])[0]
            return datos[4 : 4 + longitud].decode("utf-8")
    return ""
