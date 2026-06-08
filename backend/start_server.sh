#!/bin/bash

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
# Script para iniciar el servidor EDUmind Robotics API

echo "🚀 Starting EDUmind Robotics API Server..."
echo ""

# Navegar al directorio del backend
cd "$(dirname "$0")"

# Verificar que Ollama esté corriendo
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "⚠️  WARNING: Ollama is not running!"
    echo "Please start Ollama first with: ollama serve"
    echo ""
fi

# Configurar PYTHONPATH para incluir paquetes de usuario
export PYTHONPATH=/home/nuevoadmin/.local/lib/python3.10/site-packages:$PYTHONPATH

PORT=${PORT:-8002}

# Iniciar servidor con uvicorn
echo "📡 Starting server on http://0.0.0.0:${PORT}"
echo "📖 API docs available at http://localhost:${PORT}/api/docs"
echo ""

python3 -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT}" --reload
