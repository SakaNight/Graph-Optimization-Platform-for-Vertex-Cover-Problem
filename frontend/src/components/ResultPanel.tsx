import { SolveResult } from '../types';

interface ResultPanelProps {
  result: SolveResult | null;
}

export default function ResultPanel({ result }: ResultPanelProps) {
  if (!result) {
    return <p className="text-gray-400 italic">No results yet.</p>;
  }

  const keyMap: Record<string, keyof SolveResult['times']> = {
    cnf_vc: 'cnf_sat_vc',
    approx_vc_1: 'approx_vc_1',
    approx_vc_2: 'approx_vc_2',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {['cnf_vc', 'approx_vc_1', 'approx_vc_2'].map((key) => (
        <div
          key={key}
          className="bg-white/5 backdrop-blur-md border border-white/20 shadow-md rounded-lg p-4 hover:scale-105 transition duration-300 ease-in-out"
        >
          <h3 className="text-lg font-bold text-cyan-300 uppercase mb-2">
            {key.replace(/_/g, '-')}
          </h3>

          <p className="text-sm text-white mb-1">
            <span className="text-cyan-100">Cover:</span>{' '}
            {(result as any)[key].join(', ') || '—'}
          </p>

          <p className="text-sm text-white mb-1">
            <span className="text-cyan-100">Time:</span>{' '}
            {typeof result.times[keyMap[key]] === 'number'
              ? `${result.times[keyMap[key]].toFixed(3)} ms`
              : 'N/A'}
          </p>

          <p className="text-sm text-white">
            <span className="text-cyan-100">Size:</span>{' '}
            {(result as any)[key].length}
          </p>
        </div>
      ))}
    </div>
  );
}