from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from backend.models import GraphInput
from backend.solver_runner import run_solver
from backend.database import database
import json

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

@app.websocket("/ws/solve")
async def websocket_solver(websocket: WebSocket):
    await websocket.accept()
    try:
        data = await websocket.receive_text()
        graph = json.loads(data)
        result = await run_solver(GraphInput(**graph))

        await websocket.send_text(json.dumps(result.dict()))
    except Exception as e:
        await websocket.send_text(json.dumps({"error": str(e)}))
    finally:
        await websocket.close()