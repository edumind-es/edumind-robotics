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
Simulador de micro:bit y Nezha para pruebas sin hardware.
"""
from .microbit_sim import MicrobitSimulator, Image
from .nezha_sim import NezhaSimulator
from .code_executor import CodeExecutor, create_executor
from .simulator_manager import SimulatorManager, simulator_manager

__all__ = [
    "MicrobitSimulator",
    "NezhaSimulator",
    "CodeExecutor",
    "create_executor",
    "Image",
    "SimulatorManager",
    "simulator_manager"
]
