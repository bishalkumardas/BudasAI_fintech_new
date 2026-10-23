from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path

app = FastAPI(title="BUDASAI Wealth Platform", description="Investment Research, Education & Wealth Management")

# Paths
BASE_DIR = Path(__file__).parent
PUBLIC_DIR = BASE_DIR / "public"

# Mount static files
if PUBLIC_DIR.exists():
    app.mount("/", StaticFiles(directory=str(PUBLIC_DIR), html=True), name="static")

# Health check endpoint
@app.get("/api/health")
async def health():
    return {"status": "ok", "message": "BUDASAI is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
