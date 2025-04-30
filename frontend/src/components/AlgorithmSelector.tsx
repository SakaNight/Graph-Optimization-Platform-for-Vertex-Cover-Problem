import { useState } from 'react';

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
    <div className="space-y-2">
      {algorithms.map(({ id, label }) => (
        <label key={id} className="block">
          <input
            type="checkbox"
            checked={selected.includes(id)}
            onChange={() => toggle(id)}
            className="mr-2"
          />
          {label}
        </label>
      ))}
    </div>
  );
} 