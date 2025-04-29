import matplotlib
matplotlib.use('Agg')

import re
import matplotlib.pyplot as plt
import numpy as np

with open('results.txt', 'r') as file:
    data = file.read()

vertex_pattern = re.compile(r'V (\d+)')
cnf_sat_vc_pattern = re.compile(r'CNF-SAT-VC: ([\d,]+)')
approx_vc_1_pattern = re.compile(r'APPROX-VC-1: ([\d,]+)')
approx_vc_2_pattern = re.compile(r'APPROX-VC-2: ([\d,]+)')

vertices = vertex_pattern.findall(data)
cnf_sat_vc_solutions = cnf_sat_vc_pattern.findall(data)
approx_vc_1_solutions = approx_vc_1_pattern.findall(data)
approx_vc_2_solutions = approx_vc_2_pattern.findall(data)

cnf_sat_vc_sizes = [len(solution.split(',')) for solution in cnf_sat_vc_solutions]
approx_vc_1_sizes = [len(solution.split(',')) for solution in approx_vc_1_solutions]
approx_vc_2_sizes = [len(solution.split(',')) for solution in approx_vc_2_solutions]

ratios_by_vertex = {int(v): {'cnf': [], 'vc1': [], 'vc2': []} for v in set(vertices)}
for v, cnf_size, vc1_size, vc2_size in zip(vertices, cnf_sat_vc_sizes, approx_vc_1_sizes, approx_vc_2_sizes):
    v = int(v)
    ratios_by_vertex[v]['cnf'].append(1)
    ratios_by_vertex[v]['vc1'].append(vc1_size / cnf_size)
    ratios_by_vertex[v]['vc2'].append(vc2_size / cnf_size)

mean_ratios = {v: {} for v in ratios_by_vertex}
std_ratios = {v: {} for v in ratios_by_vertex}
for v in ratios_by_vertex:
    mean_ratios[v]['cnf'] = np.mean(ratios_by_vertex[v]['cnf'])
    mean_ratios[v]['vc1'] = np.mean(ratios_by_vertex[v]['vc1'])
    mean_ratios[v]['vc2'] = np.mean(ratios_by_vertex[v]['vc2'])
    std_ratios[v]['cnf'] = np.std(ratios_by_vertex[v]['cnf'])
    std_ratios[v]['vc1'] = np.std(ratios_by_vertex[v]['vc1'])
    std_ratios[v]['vc2'] = np.std(ratios_by_vertex[v]['vc2'])

sorted_vertices = sorted(mean_ratios.keys())

sorted_means_cnf = [mean_ratios[v]['cnf'] for v in sorted_vertices]
sorted_means_vc1 = [mean_ratios[v]['vc1'] for v in sorted_vertices]
sorted_means_vc2 = [mean_ratios[v]['vc2'] for v in sorted_vertices]

sorted_std_dev_vc1 = [std_ratios[v]['vc1'] for v in sorted_vertices]
sorted_std_dev_vc2 = [std_ratios[v]['vc2'] for v in sorted_vertices]

plt.figure(figsize=(14, 7))

plt.plot(sorted_vertices, sorted_means_cnf, 'o-', color='orange', label='CNF')
plt.plot(sorted_vertices, sorted_means_vc1, 'o-', color='blue', label='VC1')
plt.plot(sorted_vertices, sorted_means_vc2, 'o-', color='green', label='VC2')

plt.errorbar(sorted_vertices, sorted_means_vc1, yerr=sorted_std_dev_vc1, fmt='o', color='blue', capsize=5)
plt.errorbar(sorted_vertices, sorted_means_vc2, yerr=sorted_std_dev_vc2, fmt='o', color='green', capsize=5)

plt.xlabel('Number of Vertices (|V|)')
plt.ylabel('Approximation Ratio to Optimal Vertex Cover')
plt.title('Approximation Ratio by |V|')
plt.legend()
plt.grid(True)

plt.savefig('approximation_ratio_plot.png', dpi=300, bbox_inches='tight')
print(f"Plot saved as approximation_ratio_plot.png")

plt.close()
