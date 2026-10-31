import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from . import models  # noqa: F401  (register tables)
from .api import router
from .config import settings
from .db import Base, SessionLocal, engine, ensure_schema
from .seed import seed_all

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("campuspilot")


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_schema(engine)
    with SessionLocal() as db:
        added = seed_all(db)
        if added:
            log.info("Seeded: %s", list(added))
    yield


cors_origins = list(settings.cors_origins)
for o in [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://0.0.0.0:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]:
    if o not in cors_origins:
        cors_origins.append(o)

app = FastAPI(title="CampusPilot AI API", version=settings.version, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
app.include_router(router)


@app.exception_handler(Exception)
async def unhandled(request: Request, exc: Exception):
    log.error("unhandled error category=%s path=%s", type(exc).__name__, request.url.path)  # no message/stack: may contain user data
    return JSONResponse({"detail": "Internal server error"}, status_code=500)
