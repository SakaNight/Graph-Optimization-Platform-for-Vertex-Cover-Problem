import subprocess
import tempfile
import re
from backend.models import GraphInput, SolveResult

def run_solver(graph: GraphInput) -> SolveResult:
    # transform graph input to string format
    v_line = f"V {graph.num_vertices}"
    e_line = "E {" + ",".join(f"<{u},{v}>" for u, v in graph.edges) + "}"
    input_data = f"{v_line}\n{e_line}\n"

    # call vertex_cover_main
    process = subprocess.run(
        ["./build/vertex_cover_main"],
        input=input_data.encode(),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=10
    )

    output = process.stdout.decode()

    # extract the results using regex
    cnf_match = re.search(r"CNF-SAT-VC: ([\d,]*)\nCPU Time: ([\d.]+) ms", output)
    vc1_match = re.search(r"APPROX-VC-1: ([\d,]*)\nCPU Time: ([\d.]+) ms", output)
    vc2_match = re.search(r"APPROX-VC-2: ([\d,]*)\nCPU Time: ([\d.]+) ms", output)

    def parse_solution(m):
        if m and m.group(1).strip():
            return list(map(int, m.group(1).split(","))), float(m.group(2))
        return [], 0.0

    cnf_vc, cnf_time = parse_solution(cnf_match)
    vc1, vc1_time = parse_solution(vc1_match)
    vc2, vc2_time = parse_solution(vc2_match)

    return SolveResult(
        cnf_vc=cnf_vc,
        approx_vc_1=vc1,
        approx_vc_2=vc2,
        times={
            "cnf_sat_vc": cnf_time,
            "approx_vc_1": vc1_time,
            "approx_vc_2": vc2_time
        }
    )