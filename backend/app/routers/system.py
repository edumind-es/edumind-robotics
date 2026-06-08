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
Endpoints de transparencia operativa.
"""
from fastapi import APIRouter

from ..services import ollama_service


router = APIRouter(prefix="/api/system", tags=["System"])


@router.get("/policy")
async def get_policy():
    """Expone el modo local-first/privacy-first sin revelar secretos."""
    return {
        "product": "EDUmind Robotics",
        "audience": "educational",
        "principles": [
            "offline-first where possible",
            "local-first AI by default",
            "privacy-first data minimization",
            "safe educational robotics scope",
            "transparent human-in-the-loop AI",
        ],
        "ai": ollama_service.get_policy_status(),
        "student_safety": {
            "unsafe_requests_blocked": True,
            "personal_data_discouraged": True,
            "teacher_visibility_required": True,
            "autonomous_external_actions": False,
        },
    }
