interface AlgorithmSelectorProps {
  selected: string[];
  onChange: (algorithms: string[]) => void;
}

const algorithms = [
  { id: 'cnf_sat_vc', label: 'CNF-SAT-VC' },
  { id: 'approx_vc_1', label: 'APPROX-VC-1' },
  { id: 'approx_vc_2', label: 'APPROX-VC-2' }
];

export default function AlgorithmSelector({ selected, onChange }: AlgorithmSelectorProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl shadow-md border border-white/20 space-y-3 transition-all">
      <h2 className="text-cyan-300 font-bold mb-1 uppercase text-sm">Select Algorithms</h2>
      {algorithms.map(({ id, label }) => (
        <label
          key={id}
          className="flex items-center space-x-2 cursor-pointer text-white hover:text-cyan-200 transition"
        >
          <input
            type="checkbox"
            checked={selected.includes(id)}
            onChange={() => toggle(id)}
            className="accent-cyan-400 w-4 h-4"
          />
          <span>{label}</span>
        </label>
      ))}
    </div>
  );
}