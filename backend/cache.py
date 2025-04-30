from backend.database import database, vertex_cover_cache
import json
from typing import List
from backend.models import GraphInput

def normalize_edges(edges):
    return json.dumps(sorted([sorted(e) for e in edges]))

async def check_cache(graph: GraphInput, algo: str):
    edge_str = normalize_edges(graph.edges)
    query = vertex_cover_cache.select().where(
        (vertex_cover_cache.c.vertex_count == graph.num_vertices) &
        (vertex_cover_cache.c.edges == edge_str) &
        (vertex_cover_cache.c.algorithm == algo)
    )
    row = await database.fetch_one(query)
    if row:
        result = [int(x) for x in row["result"].split(",") if x]
        return result, row["time_ms"]
    return None

async def insert_cache(graph: GraphInput, algo: str, result: List[int], time_ms: float):
    edge_str = normalize_edges(graph.edges)
    await database.execute(vertex_cover_cache.insert().values(
        vertex_count=graph.num_vertices,
        edges=edge_str,
        algorithm=algo,
        result=",".join(map(str, result)),
        time_ms=time_ms
    ))