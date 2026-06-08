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
EDUmind Robotics API
Sistema de aprendizaje de programación asistida por IA para micro:bit y Nezha
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from .routers import chat, lessons, simulator, code, export, system
from .services import ollama_service, lesson_engine
from .simulator import simulator_manager
from .models.schemas import HealthResponse, ModelsListResponse, OllamaModel

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Crear aplicación FastAPI
app = FastAPI(
    title="EDUmind Robotics API",
    version="1.0.0",
    description="API para aprendizaje de robótica educativa con IA local (micro:bit + Nezha)",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS - permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://robotics.edumind.es",
        "https://auth.edumind.es",
        "https://panel.edumind.es",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(chat.router)
app.include_router(lessons.router)
app.include_router(simulator.router)
app.include_router(code.router)
app.include_router(export.router)
app.include_router(system.router)


# ==================== HEALTH & STATUS ENDPOINTS ====================

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """
    Endpoint de salud del sistema.
    Verifica disponibilidad de Ollama y modelos.
    """
    ollama_available = await ollama_service.check_health()
    models = await ollama_service.list_models()
    model_names = [m.get("name", "unknown") for m in models]

    return HealthResponse(
        status="ok" if ollama_available else "degraded",
        ollama_available=ollama_available,
        models_available=model_names,
        version="1.0.0"
    )


@app.get("/api/ready")
async def readiness_check():
    """
    Readiness operativo para despliegue.
    No exige que Ollama esté perfecto para servir simulador/editor, pero expone
    claramente si la IA local está disponible y si la política local-first pasa.
    """
    ollama_available = await ollama_service.check_health()
    policy = ollama_service.get_policy_status()

    return {
        "ready": policy["ai_endpoint_local"] and policy["remote_ai_allowed"] is False,
        "status": "ok" if ollama_available else "degraded",
        "capabilities": {
            "frontend_pwa": True,
            "simulator": True,
            "export": True,
            "local_ai": ollama_available,
            "privacy_first_policy": policy["prompts_persisted"] is False,
        },
        "active_simulator_sessions": len(simulator_manager.sessions),
        "policy": {
            "mode": policy["mode"],
            "privacy": policy["privacy"],
            "ai_endpoint_local": policy["ai_endpoint_local"],
            "remote_ai_allowed": policy["remote_ai_allowed"],
        },
        "version": "1.0.0",
    }


@app.get("/api/models", response_model=ModelsListResponse)
async def list_models():
    """Lista modelos disponibles en Ollama"""
    models = await ollama_service.list_models()

    ollama_models = [
        OllamaModel(
            name=m.get("name", "unknown"),
            size=m.get("size"),
            modified_at=m.get("modified_at")
        )
        for m in models
    ]

    return ModelsListResponse(
        models=ollama_models,
        total=len(ollama_models)
    )


@app.get("/api/metrics")
async def get_metrics():
    """Get application metrics."""
    from .services.metrics_service import metrics
    return metrics.get_metrics()


@app.get("/api/metrics/prometheus")
async def get_prometheus_metrics():
    """Get Prometheus metrics."""
    from fastapi.responses import PlainTextResponse
    from .services.metrics_service import metrics
    return PlainTextResponse(metrics.get_prometheus_metrics())



# ==================== STARTUP & SHUTDOWN ====================

@app.on_event("startup")
async def startup_event():
    """Evento de inicio de la aplicación"""
    logger.info("🚀 Starting EDUmind Robotics API...")

    # Verificar Ollama
    ollama_ok = await ollama_service.check_health()
    if ollama_ok:
        logger.info("✅ Ollama is available")
        models = await ollama_service.list_models()
        logger.info(f"📦 Available models: {[m.get('name') for m in models]}")
    else:
        logger.warning("⚠️ Ollama is not available - AI features will not work")

    # Cargar lecciones
    lessons_count = len(lesson_engine.get_all_lessons())
    challenges_count = len(lesson_engine.get_challenges())
    logger.info(f"📚 Loaded {lessons_count} lessons and {challenges_count} challenges")

    logger.info("✅ EDUmind Robotics API is ready!")


@app.on_event("shutdown")
async def shutdown_event():
    """Evento de cierre de la aplicación"""
    logger.info("👋 Shutting down EDUmind Robotics API...")
    await ollama_service.close()
    logger.info("✅ Cleanup complete")


# Root endpoint
@app.get("/")
async def root():
    """Endpoint raíz con información de la API"""
    return {
        "name": "EDUmind Robotics API",
        "version": "1.0.0",
        "description": "API para aprendizaje de robótica educativa con IA",
        "docs": "/api/docs",
        "endpoints": {
            "health": "/api/health",
            "models": "/api/models",
            "chat": "/api/chat",
            "lessons": "/api/lessons",
            "policy": "/api/system/policy"
        }
    }
