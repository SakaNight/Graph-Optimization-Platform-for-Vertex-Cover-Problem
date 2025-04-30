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

  const handleSolve = async () => {
    const edgePairs: [number, number][] = links.map(({ source, target }) => [source, target]);
    const input = {
      num_vertices: nodes.length,
      edges: edgePairs,
      algorithms: selectedAlgos,
    };
    const res = await solveGraph(input);
    setResult(res);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Graph Vertex Cover Solver</h1>

      <div className="flex gap-4">
        <div className="w-2/3">
          <GraphEditor nodes={nodes} links={links} onGraphChange={() => {}} />
        </div>

        <div className="w-1/3 space-y-4">
          <AlgorithmSelector selected={selectedAlgos} onChange={setSelectedAlgos} />
          <button onClick={handleSolve} className="px-4 py-2 bg-blue-600 text-white rounded">
            Solve
          </button>
        </div>
      </div>

      <ResultPanel result={result} />
    </div>
  );
}