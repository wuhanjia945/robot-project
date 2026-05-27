from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.requirement import router as requirement_router
from app.api.solution import router as solution_router
from app.api.algorithm import router as algorithm_router
from app.api.hardware import router as hardware_router
from app.api.validator import router as validator_router
from app.api.market import router as market_router
from app.config import settings

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(requirement_router)
app.include_router(solution_router)
app.include_router(algorithm_router)
app.include_router(hardware_router)
app.include_router(validator_router)
app.include_router(market_router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}


@app.on_event("startup")
async def startup_event():
    print(f"[START] {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"[INFO] Server: http://{settings.HOST}:{settings.PORT}")
    print(f"[INFO] Debug: {'ON' if settings.DEBUG else 'OFF'}")
