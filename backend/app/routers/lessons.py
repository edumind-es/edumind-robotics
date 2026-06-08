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
Router para gestión de lecciones y retos.
"""
from fastapi import APIRouter, HTTPException
from typing import List, Optional

from ..models.schemas import (
    Lesson,
    LessonListResponse,
    Challenge,
    ChallengeListResponse,
    PlatformType,
    DifficultyLevel
)
from ..services import lesson_engine

router = APIRouter(prefix="/api/lessons", tags=["Lessons"])


@router.get("/", response_model=LessonListResponse)
async def get_lessons(
    platform: Optional[PlatformType] = None,
    difficulty: Optional[DifficultyLevel] = None
):
    """
    Obtiene catálogo de lecciones.

    Filters:
        - platform: Filtra por plataforma (micro:bit, nezha)
        - difficulty: Filtra por dificultad (beginner, intermediate, advanced)
    """
    lessons = lesson_engine.get_all_lessons()

    # Aplicar filtros
    if platform:
        lessons = [l for l in lessons if l["platform"] == platform]

    if difficulty:
        lessons = [l for l in lessons if l["difficulty"] == difficulty]

    return LessonListResponse(
        lessons=lessons,
        total=len(lessons)
    )


@router.get("/{lesson_id}", response_model=Lesson)
async def get_lesson(lesson_id: str):
    """Obtiene una lección específica por ID"""
    lesson = lesson_engine.get_lesson(lesson_id)

    if not lesson:
        raise HTTPException(status_code=404, detail=f"Lesson {lesson_id} not found")

    return lesson


@router.get("/challenges/", response_model=ChallengeListResponse)
async def get_challenges(
    platform: Optional[PlatformType] = None,
    difficulty: Optional[DifficultyLevel] = None
):
    """
    Obtiene catálogo de retos creativos.

    Filters:
        - platform: Filtra por plataforma
        - difficulty: Filtra por dificultad
    """
    challenges = lesson_engine.get_challenges()

    # Aplicar filtros
    if platform:
        challenges = [c for c in challenges if c["platform"] == platform]

    if difficulty:
        challenges = [c for c in challenges if c["difficulty"] == difficulty]

    return ChallengeListResponse(
        challenges=challenges,
        total=len(challenges)
    )


@router.get("/challenges/{challenge_id}", response_model=Challenge)
async def get_challenge(challenge_id: str):
    """Obtiene un reto específico por ID"""
    challenge = lesson_engine.get_challenge(challenge_id)

    if not challenge:
        raise HTTPException(status_code=404, detail=f"Challenge {challenge_id} not found")

    return challenge
