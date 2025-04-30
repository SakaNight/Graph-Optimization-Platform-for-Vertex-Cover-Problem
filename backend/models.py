from pydantic import BaseModel
from typing import List, Tuple

class GraphInput(BaseModel):
    num_vertices: int
    edges: List[Tuple[int, int]]

class SolveResult(BaseModel):
    cnf_vc: List[int]
    approx_vc_1: List[int]
    approx_vc_2: List[int]
    times: dict