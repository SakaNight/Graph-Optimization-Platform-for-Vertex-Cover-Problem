from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.models import GraphInput, SolveResult
from backend.solver_runner import run_solver

app = FastAPI()

@app.post("/solve", response_model=SolveResult)
# def solve_vc(graph: GraphInput):
#     return run_solver(graph)
def solve_vc(graph: GraphInput, request: Request):
    import asyncio
    print("RECEIVED DATA:", asyncio.run(request.body()))
    return run_solver(graph)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)