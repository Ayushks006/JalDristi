from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes_ocean import router as ocean_router
from app.api.routes_erddap import router as erddap_router
from app.api.routes_upload import router as upload_router

app = FastAPI(
    title="JalDristi API",
    description="Backend API for JalDristi — Interactive 3D Ocean Intelligence & Visualization Platform (SIH 2026)",
    version=settings.VERSION,
    debug=settings.DEBUG
)

# CORS configuration to enable frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach API routers
app.include_router(ocean_router, prefix=settings.API_V1_STR)
app.include_router(erddap_router, prefix=settings.API_V1_STR)
app.include_router(upload_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "title": "JalDristi Backend API",
        "badge": "SIH 2026 PROTOTYPE",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "JalDristi Engine",
        "version": settings.VERSION
    }
