import { useEffect, useRef } from 'react';
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
}

export default function GraphEditor({ nodes, links, onGraphChange }: GraphEditorProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 600;
    const height = 400;

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
      .attr('fill', '#69b3a2')
      .call(d3.drag() as any)
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);

    node.append('title').text((d) => `Node ${d.id}`);

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

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }, [nodes, links]);

  return <svg ref={svgRef} width={600} height={400} className="border rounded" />;
}