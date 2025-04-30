import { useState } from 'react';
import GraphEditor from './components/GraphEditor';
import AlgorithmSelector from './components/AlgorithmSelector';
import ResultPanel from './components/ResultPanel';
import { solveGraph } from './api';
import { SolveResult } from './types';

export default function App() {
  const [nodes, setNodes] = useState([{ id: 1 }, { id: 2 }, { id: 3 }]);
  const [links, setLinks] = useState([{ source: 1, target: 2 }, { source: 2, target: 3 }]);
  const [selectedAlgos, setSelectedAlgos] = useState(['cnf_sat_vc', 'approx_vc_1', 'approx_vc_2']);
  const [result, setResult] = useState<SolveResult | null>(null);
  const [highlightKey, setHighlightKey] = useState<'cnf_vc' | 'approx_vc_1' | 'approx_vc_2'>('cnf_vc');

  const handleSolve = async () => {
    const edgePairs: [number, number][] = links.map(({ source, target }) => [
      typeof source === 'object' ? (source as any).id : source,
      typeof target === 'object' ? (target as any).id : target,
    ]);
  
    const input = {
      num_vertices: nodes.length,
      edges: edgePairs,
    };
  
    console.log('Sending graph:', input);
  
    try {
      const res = await solveGraph(input);
      setResult(res);
    } catch (err) {
      console.error('Solve error:', err);
    }
  };

  const handleGraphChange = (newNodes: typeof nodes, newLinks: typeof links) => {
    setNodes(newNodes);
    setLinks(newLinks);
    setResult(null);
  };

  const handleClearGraph = () => {
    setNodes([]);
    setLinks([]);
    setResult(null);
  };

  const highlightMap: Record<string, number[]> | undefined =
  result
    ? Object.fromEntries(
        Object.entries({
          cnf_vc: result.cnf_vc,
          approx_vc_1: result.approx_vc_1,
          approx_vc_2: result.approx_vc_2,
        }).filter(([_, v]) => Array.isArray(v))
      )
    : undefined;

  return (
    <div className="font-[Orbitron] text-white bg-[#0f0f1a] min-h-screen p-6">
    <h1 className="text-3xl font-bold text-cyan-400 mb-6">Graph Vertex Cover Solver</h1>

    <div className="flex gap-6">
      <div className="w-2/3">
        <GraphEditor
          nodes={nodes}
          links={links}
          onGraphChange={handleGraphChange}
          highlightMap={highlightMap}
        />
      </div>

      <div className="w-1/3 space-y-6 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-xl p-4">
        <AlgorithmSelector selected={selectedAlgos} onChange={setSelectedAlgos} />

        <div>
          <label className="block mb-2 text-cyan-300 font-medium">Highlight Result</label>
          <select
            className="w-full rounded px-3 py-2 bg-white/10 text-white border border-white/20 shadow-inner hover:scale-105 transition duration-300 ease-in-out"
            value={highlightKey}
            onChange={(e) => setHighlightKey(e.target.value as any)}
            disabled={!result}
          >
            <option value="cnf_vc">CNF-SAT-VC</option>
            <option value="approx_vc_1">APPROX-VC-1</option>
            <option value="approx_vc_2">APPROX-VC-2</option>
          </select>
        </div>

        <input
          type="file"
          accept=".json"
          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0 file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
              try {
                const json = JSON.parse(event.target?.result as string);
                if (!json.vertices || !json.edges) throw new Error('Invalid format');
                const newVertices = json.vertices.map((id: number) => ({ id }));
                const newEdges = json.edges.map(([source, target]: [number, number]) => ({ source, target }));
                handleGraphChange(newVertices, newEdges);
              } catch (err) {
                alert('Uploading failed: JSON should contain "vertices" and "edges"');
              }
            };
            reader.readAsText(file);
          }}
/>      
        <button
          onClick={handleSolve}
          className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:scale-105 transition duration-300 ease-in-out"
        >
          Solve
        </button>

        <button
          onClick={handleClearGraph}
          className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:scale-105 transition duration-300 ease-in-out"
        >
          Clear Graph
        </button>
      </div>
    </div>
    {result && (
      <button
        onClick={() => {
          const exportResult = {
            num_vertices: nodes.length,
            edges: links.map(({ source, target }) => [source, target]),
            results: {
              cnf_sat_vc: {
                cover: result.cnf_vc,
                size: result.cnf_vc.length,
                time_ms: result.times.cnf_sat_vc,
              },
              approx_vc_1: {
                cover: result.approx_vc_1,
                size: result.approx_vc_1.length,
                time_ms: result.times.approx_vc_1,
              },
              approx_vc_2: {
                cover: result.approx_vc_2,
                size: result.approx_vc_2.length,
                time_ms: result.times.approx_vc_2,
              },
            },
          };

          const blob = new Blob([JSON.stringify(exportResult, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'vertex-cover-result.json';
          a.click();
          URL.revokeObjectURL(url);
        }}
        className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:scale-105 transition duration-300 ease-in-out"
      >
        Export Result JSON
      </button>
    )}
    <div className="mt-6">
      <ResultPanel result={result} />
    </div>
  </div>
  );
}