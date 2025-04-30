from fastapi import FastAPI
from backend.models import GraphInput, SolveResult
from backend.solver_runner import run_solver

app = FastAPI()

@app.post("/solve", response_model=SolveResult)
def solve_vc(graph: GraphInput):
    return run_solver(graph)