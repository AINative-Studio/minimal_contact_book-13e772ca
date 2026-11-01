"""
minimal_contact_book — Backend API
Built on AINative Platform. Uses ZeroDB for storage, AINative JWT for auth.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.routers.authentication import router as authentication_router
from app.routers.contact_management import router as contact_management_router

app = FastAPI(
    title="minimal_contact_book API",
    version="0.1.0",
    description="Backend API for minimal_contact_book, powered by AINative platform"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.ainative.studio"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(authentication_router, prefix='/api/v1')
app.include_router(contact_management_router, prefix='/api/v1')

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "minimal_contact_book"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
