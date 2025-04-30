import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface Node {
  id: number;
}

interface Link {
  source: number;
  target: number;
}

interface GraphEditorProps {
  nodes: Node[];
  links: Link[];
  onGraphChange: (nodes: Node[], links: Link[]) => void;
  highlightMap?: Record<string, number[]>;
}

const colorMap: Record<string, string> = {
  cnf_vc: '#f87171',       // red-400
  approx_vc_1: '#34d399',  // green-400
  approx_vc_2: '#60a5fa',  // blue-400
};

export default function GraphEditor({ nodes, links, onGraphChange, highlightMap = {} }: GraphEditorProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 600;
    const height = 400;

    let currentNodeId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) : 0;

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links as any).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .attr('stroke', '#94a3b8') // slate-400
      .attr('stroke-opacity', 0.5)
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke-width', 2);

    const node = svg.append('g')
      .attr('stroke', '#f1f5f9')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', d => d.id === selectedNodeId ? 11 : 9)
      .attr('fill', (d) => {
        if (d.id === selectedNodeId) return '#facc15'; // yellow-400
        for (const key of Object.keys(highlightMap)) {
          if (highlightMap[key]?.includes(d.id)) {
            return colorMap[key] || '#9ca3af';
          }
        }
        return '#cbd5e1'; // slate-300
      })
      .on('mouseover', function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 13)
          .attr('fill', '#38bdf8'); // cyan-400
      })
      .on('mouseout', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', d.id === selectedNodeId ? 11 : 9)
          .attr('fill', () => {
            for (const key of Object.keys(highlightMap)) {
              if (highlightMap[key]?.includes(d.id)) {
                return colorMap[key] || '#9ca3af';
              }
            }
            return '#cbd5e1';
          });
      })
      .on('click', (event, targetNode) => {
        if (selectedNodeId === null) {
          setSelectedNodeId(targetNode.id);
        } else if (selectedNodeId === targetNode.id) {
          setSelectedNodeId(null);
        } else {
          onGraphChange(nodes, [...links, { source: selectedNodeId, target: targetNode.id }]);
          setSelectedNodeId(null);
        }
        event.stopPropagation();
      });

    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .text(d => d.id.toString())
      .attr('font-size', 12)
      .attr('fill', '#a5f3fc'); // cyan-200

    svg.on('click', (event: any) => {
      const coords = d3.pointer(event);
      const newNode = { id: currentNodeId + 1 };
      currentNodeId += 1;
      setSelectedNodeId(null);
      onGraphChange([...nodes, newNode], links);
    });

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      label
        .attr('x', (d: any) => d.x + 12)
        .attr('y', (d: any) => d.y + 4);
    });
  }, [nodes, links, highlightMap, selectedNodeId]);

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/20 shadow-xl rounded-xl p-2 transition-all duration-300 ease-in-out">
      <svg ref={svgRef} width="100%" height="500" viewBox="0 0 600 500" className="rounded-lg" />
    </div>
  );
}