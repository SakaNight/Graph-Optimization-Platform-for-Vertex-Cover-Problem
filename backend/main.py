from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.models import GraphInput
from backend.solver_runner import run_solver
from backend.database import database

app = FastAPI()

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

@app.post("/solve")
async def solve(graph: GraphInput):
    result = await run_solver(graph)
    return result

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)