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
  highlightMap?: Record<string, number[]>; // e.g. { cnf_vc: [1,2], approx_vc_1: [3] }
}

const colorMap: Record<string, string> = {
  cnf_vc: '#f87171',       // red
  approx_vc_1: '#34d399',  // green
  approx_vc_2: '#60a5fa',  // blue
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
      .force('link', d3.forceLink(links as any).id((d: any) => d.id))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .attr('stroke', '#999')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke-width', 1.5);

    const node = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', 8)
      .attr('fill', (d) => {
        if (d.id === selectedNodeId) return '#facc15'; // yellow highlight for selected node
        for (const key of Object.keys(highlightMap)) {
          if (highlightMap[key]?.includes(d.id)) {
            return colorMap[key] || '#9ca3af';
          }
        }
        return '#d1d5db';
      })
      .on('click', (event, targetNode) => {
        if (selectedNodeId === null) {
          setSelectedNodeId(targetNode.id);
        } else if (selectedNodeId === targetNode.id) {
          setSelectedNodeId(null); // deselect if same node clicked again
        } else {
          onGraphChange(nodes, [...links, { source: selectedNodeId, target: targetNode.id }]);
          setSelectedNodeId(null);
        }
        event.stopPropagation();
      });

    node.append('title').text((d) => `Node ${d.id}`);

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
    });
  }, [nodes, links, highlightMap, selectedNodeId]);

  return <svg ref={svgRef} width={600} height={400} className="border rounded bg-gray-50 cursor-pointer" />;
}