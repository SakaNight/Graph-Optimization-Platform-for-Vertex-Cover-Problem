from backend.database import database, vertex_cover_cache
from backend.models import GraphInput
import json

def serialize_edges(edges: list[tuple[int, int]]) -> str:
    return json.dumps(sorted(edges))  # sorted to ensure consistent cache key

async def check_cache(graph: GraphInput, algorithm: str):
    edges_str = serialize_edges(graph.edges)

    query = vertex_cover_cache.select().where(
        (vertex_cover_cache.c.vertex_count == graph.num_vertices) &
        (vertex_cover_cache.c.edges == edges_str) &
        (vertex_cover_cache.c.algorithm == algorithm)
    )

    row = await database.fetch_one(query)
    if row:
        return json.loads(row["result"]), row["time_ms"]
    return None

async def insert_cache(graph: GraphInput, algorithm: str, result: list[int], time_ms: float):
    edges_str = serialize_edges(graph.edges)

    query = vertex_cover_cache.insert().values(
        vertex_count=graph.num_vertices,
        edges=edges_str,
        algorithm=algorithm,
        result=json.dumps(result),
        time_ms=time_ms
    )

    try:
        await database.execute(query)
    except Exception as e:
        print(f"[DB] Insert error: {e}")