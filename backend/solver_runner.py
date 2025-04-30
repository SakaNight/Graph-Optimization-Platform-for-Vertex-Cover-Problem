import subprocess
from typing import List
from backend.models import GraphInput, SolveResult
import re

def format_graph_input(graph: GraphInput) -> str:
    vertex_line = f"V {graph.num_vertices}"
    edge_pairs = [f"<{u},{v}>" for u, v in graph.edges]
    edge_line = f"E {{{','.join(edge_pairs)}}}"
    return f"{vertex_line}\n{edge_line}\n"

def run_solver(graph: GraphInput) -> SolveResult:
    input_str = format_graph_input(graph)
    process = subprocess.Popen(
        ['./build/vertex_cover_main'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    stdout, stderr = process.communicate(input=input_str)
    if stderr:
        print("Solver stderr:", stderr)

    cnf_match = re.search(r"CNF-SAT-VC:\s*([\d,]*)", stdout)
    vc1_match = re.search(r"APPROX-VC-1:\s*([\d,]*)", stdout)
    vc2_match = re.search(r"APPROX-VC-2:\s*([\d,]*)", stdout)
    print("----- Solver Output -----")
    print(stdout)

    cnf_vc = [int(x) for x in cnf_match.group(1).split(',')] if cnf_match and cnf_match.group(1) else []
    approx_vc_1 = [int(x) for x in vc1_match.group(1).split(',')] if vc1_match and vc1_match.group(1) else []
    approx_vc_2 = [int(x) for x in vc2_match.group(1).split(',')] if vc2_match and vc2_match.group(1) else []

    time_matches = re.findall(r"CPU Time:\s*([\d.]+)", stdout)
    time_values = [float(t) for t in time_matches]

    return SolveResult(
        cnf_vc=cnf_vc,
        approx_vc_1=approx_vc_1,
        approx_vc_2=approx_vc_2,
        times={
            'cnf_sat_vc': time_values[0] if len(time_values) > 0 else 0.0,
            'approx_vc_1': time_values[1] if len(time_values) > 1 else 0.0,
            'approx_vc_2': time_values[2] if len(time_values) > 2 else 0.0,
        }
    )