import matplotlib
matplotlib.use('Agg')

import matplotlib.pyplot as plt
import numpy as np
import re

vertex_pattern = re.compile(r'V (\d+)')
cnf_sat_pattern = re.compile(r'CNF-SAT-VC: [\d,]+\nCPU Time: ([\d.]+) ms')
approx_vc_1_pattern = re.compile(r'APPROX-VC-1: [\d,]+\nCPU Time: ([\d.]+) ms')
approx_vc_2_pattern = re.compile(r'APPROX-VC-2: [\d,]+\nCPU Time: ([\d.]+) ms')

with open('results.txt', 'r') as file:
    data = file.read()

vertices = vertex_pattern.findall(data)
cnf_sat_times = cnf_sat_pattern.findall(data)
approx_vc_1_times = approx_vc_1_pattern.findall(data)
approx_vc_2_times = approx_vc_2_pattern.findall(data)

vertices = [int(v) for v in vertices]
cnf_sat_times = [float(t) for t in cnf_sat_times]
approx_vc_1_times = [float(t) for t in approx_vc_1_times]
approx_vc_2_times = [float(t) for t in approx_vc_2_times]

times_by_vertex = {}
for v, cnf, vc1, vc2 in zip(vertices, cnf_sat_times, approx_vc_1_times, approx_vc_2_times):
    if v not in times_by_vertex:
        times_by_vertex[v] = {'cnf': [], 'vc1': [], 'vc2': []}
    times_by_vertex[v]['cnf'].append(cnf)
    times_by_vertex[v]['vc1'].append(vc1)
    times_by_vertex[v]['vc2'].append(vc2)

vertex_counts = sorted(times_by_vertex.keys())
avg_cnf = [np.mean(times_by_vertex[v]['cnf']) for v in vertex_counts]
avg_vc1 = [np.mean(times_by_vertex[v]['vc1']) for v in vertex_counts]
avg_vc2 = [np.mean(times_by_vertex[v]['vc2']) for v in vertex_counts]
std_cnf = [np.std(times_by_vertex[v]['cnf']) for v in vertex_counts]
std_vc1 = [np.std(times_by_vertex[v]['vc1']) for v in vertex_counts]
std_vc2 = [np.std(times_by_vertex[v]['vc2']) for v in vertex_counts]

plt.figure(figsize=(10, 5))
plt.errorbar(vertex_counts, avg_cnf, yerr=std_cnf, label='CNF-SAT-VC', fmt='-s', capsize=5)
plt.errorbar(vertex_counts, avg_vc1, yerr=std_vc1, label='APPROX-VC-1', fmt='-o', capsize=5)
plt.errorbar(vertex_counts, avg_vc2, yerr=std_vc2, label='APPROX-VC-2', fmt='-^', capsize=5)

plt.xlabel('Number of Vertices (V)')
plt.ylabel('Average Time (ms)')
plt.title('Average Running Time by V with Standard Deviation')
plt.legend()
plt.grid(True)
plt.yscale('log')

plt.tight_layout()

output_file = 'running_time_plot.png'
plt.savefig(output_file, dpi=300)
print(f"Plot saved as '{output_file}'")
plt.close()