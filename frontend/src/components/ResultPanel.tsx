import { SolveResult } from '../types';

interface ResultPanelProps {
  result: SolveResult | null;
}

export default function ResultPanel({ result }: ResultPanelProps) {
  if (!result) return <p className="text-gray-500">No results yet.</p>;

  return (
    <div className="space-y-4">
      {['cnf_vc', 'approx_vc_1', 'approx_vc_2'].map((key) => (
        <div key={key} className="border p-2 rounded">
          <h3 className="font-bold uppercase">{key.replace(/_/g, '-')}</h3>
          <p>Cover: {(result as any)[key].join(', ')}</p>
          <p>Time: {(result as any).times[key]} ms</p>
          <p>Size: {(result as any)[key].length}</p>
        </div>
      ))}
    </div>
  );
} 