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
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Graph Vertex Cover Solver</h1>

      <div className="flex gap-4">
        <div className="w-2/3">
          <GraphEditor
            nodes={nodes}
            links={links}
            onGraphChange={handleGraphChange}
            highlightMap={highlightMap}
          />
        </div>

        <div className="w-1/3 space-y-4">
          <AlgorithmSelector selected={selectedAlgos} onChange={setSelectedAlgos} />

          <div>
            <label className="block mb-1 font-medium">Highlight Result</label>
            <select
              className="w-full border rounded p-1"
              value={highlightKey}
              onChange={(e) => setHighlightKey(e.target.value as any)}
              disabled={!result}
            >
              <option value="cnf_vc">CNF-SAT-VC</option>
              <option value="approx_vc_1">APPROX-VC-1</option>
              <option value="approx_vc_2">APPROX-VC-2</option>
            </select>
          </div>
          <button onClick={handleSolve} className="px-4 py-2 bg-blue-600 text-white rounded w-full">
            Solve
          </button>

          <button onClick={handleClearGraph} className="px-4 py-2 bg-gray-400 text-white rounded w-full">
            Clear Graph
          </button>
        </div>
      </div>

      <ResultPanel result={result} />
    </div>
  );
}