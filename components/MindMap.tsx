import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { MindMapNode } from '../types';

interface MindMapProps {
  data: MindMapNode;
}

export const MindMap: React.FC<MindMapProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const width = 800;
    const height = 400;
    
    // Clear previous svg content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .style("font", "12px sans-serif")
      .style("user-select", "none");

    const root = d3.hierarchy(data);
    const treeLayout = d3.tree<MindMapNode>().size([height - 40, width - 160]);
    
    treeLayout(root);

    const g = svg.append("g")
      .attr("transform", "translate(80,20)");

    const link = g.selectAll(".link")
      .data(root.links())
      .join("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal<any, any>()
          .x(d => d.y)
          .y(d => d.x))
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5);

    const node = g.selectAll(".node")
      .data(root.descendants())
      .join("g")
      .attr("class", d => `node ${d.children ? "node--internal" : "node--leaf"}`)
      .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("circle")
      .attr("r", 6)
      .attr("fill", d => d.data.status === 'completed' ? "#10b981" : d.data.status === 'in-progress' ? "#f59e0b" : "#9ca3af")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.children ? -8 : 8)
      .attr("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name)
      .clone(true).lower()
      .attr("stroke", "white")
      .attr("stroke-width", 3);

  }, [data]);

  return (
    <div className="w-full overflow-x-auto bg-slate-50 rounded-lg border border-slate-200 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">Strategy Mind Map</h3>
      <svg ref={svgRef} className="w-full h-auto min-w-[600px]"></svg>
    </div>
  );
};
