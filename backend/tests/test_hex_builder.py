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
Pruebas del .hex para micro:bit.

Sin una placa delante no se puede comprobar que arranque, pero sí se puede
comprobar todo lo que haría que NO arrancase: un fichero mal formado, un
checksum equivocado, el programa en la dirección que no toca o un runtime
que se ha corrompido al unir las partes. Eso es lo que se verifica aquí.
"""
import binascii

import pytest

from app.services.hex_builder import (
    DIRECCION_SCRIPT,
    ScriptDemasiadoLargo,
    crear_hex,
    extraer_script,
    runtime,
)

CODIGO = 'from microbit import *\ndisplay.show(Image.HEART)\nsleep(500)\n'


def test_el_runtime_es_intel_hex_valido():
    lineas = runtime().split()
    assert all(l.startswith(":") for l in lineas)
    assert lineas[-1] == ":00000001FF", "debe terminar con el registro de fin de fichero"


def test_todos_los_registros_tienen_checksum_correcto():
    """
    Un solo checksum mal y el gestor de arranque del micro:bit rechaza el
    fichero entero. Se comprueban los ~14.500 registros.
    """
    for linea in crear_hex(CODIGO).split():
        crudo = binascii.unhexlify(linea[1:])
        # La suma de todos los bytes, checksum incluido, debe dar 0.
        assert sum(crudo) & 0xFF == 0, f"checksum incorrecto en {linea}"


def test_el_fichero_termina_en_fin_de_fichero():
    assert crear_hex(CODIGO).split()[-1] == ":00000001FF"


def test_el_codigo_se_puede_volver_a_leer():
    """La prueba que sustituye a enchufar una placa."""
    assert extraer_script(crear_hex(CODIGO)) == CODIGO


def test_conserva_acentos_y_enes():
    codigo = 'from microbit import *\n# Enseña un corazón\ndisplay.show(Image.HEART)\n'
    assert extraer_script(crear_hex(codigo)) == codigo


def test_normaliza_los_saltos_de_linea_de_windows():
    """El micro:bit espera saltos Unix; un fichero de Windows lo confundiría."""
    assert "\r" not in extraer_script(crear_hex("a = 1\r\nb = 2\r\n"))


def test_el_script_va_en_su_direccion():
    """
    El runtime busca el programa en 0x3E000. Si acaba en otra dirección, la
    placa arranca pero no encuentra nada que ejecutar.
    """
    contenido = crear_hex(CODIGO)
    assert ":020000040003F7" in contenido, "falta el registro de dirección extendida"

    # El runtime ya trae un registro de dirección extendida propio, así que se
    # busca el registro concreto que lleva la cabecera "MP" del programa.
    esperada = DIRECCION_SCRIPT - 0x30000
    cabecera = None
    for linea in contenido.split():
        crudo = binascii.unhexlify(linea[1:])
        if len(crudo) > 6 and crudo[3] == 0 and crudo[4:6] == b"MP":
            cabecera = crudo
            break

    assert cabecera is not None, "no se encuentra el programa dentro del .hex"
    assert int.from_bytes(cabecera[1:3], "big") == esperada


def test_el_runtime_no_se_altera():
    """Unir las partes no puede tocar ni un byte del runtime original."""
    original = runtime().split()
    resultado = crear_hex(CODIGO).split()
    assert resultado[: len(original) - 5] == original[:-5]
    assert resultado[-5:] == original[-5:]


def test_rechaza_un_programa_demasiado_largo():
    """
    Antes de estropear nada: si no cabe, se dice con un mensaje que explica
    qué hacer, en lugar de generar un fichero que la placa rechazará.
    """
    with pytest.raises(ScriptDemasiadoLargo) as error:
        crear_hex("x = 1\n" * 3000)
    assert "acortarlo" in str(error.value)


def test_un_programa_vacio_no_rompe():
    assert extraer_script(crear_hex("")) == ""
