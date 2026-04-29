import { useState, useEffect } from "react";

const CONCEPT_DIAGRAMS = {
  default: {
    nodes: [
      { id: "root", x: 200, y: 130, label: "Transformer", color: "var(--gold)", textColor: "var(--bg)", w: 110, h: 38 },
      { id: "enc",  x: 80,  y: 240, label: "Encoder",     color: "var(--accent)", textColor: "var(--bg)", w: 90, h: 34 },
      { id: "dec",  x: 320, y: 240, label: "Decoder",     color: "var(--accent)", textColor: "var(--bg)", w: 90, h: 34 },
      { id: "mha",  x: 40,  y: 340, label: "Multi-Head\nAttention", color: "var(--card)", textColor: "var(--ink)", w: 108, h: 44 },
      { id: "ff",   x: 150, y: 340, label: "Feed-Forward", color: "var(--card)", textColor: "var(--ink)", w: 108, h: 34 },
      { id: "pe",   x: 80,  y: 430, label: "Positional\nEncoding", color: "var(--surface)", textColor: "var(--muted)", w: 100, h: 44 },
      { id: "dmha", x: 270, y: 340, label: "Masked\nAttention", color: "var(--card)", textColor: "var(--ink)", w: 100, h: 44 },
      { id: "dff",  x: 380, y: 340, label: "Feed-Forward", color: "var(--card)", textColor: "var(--ink)", w: 108, h: 34 },
    ],
    edges: [
      { from: "root", to: "enc" },
      { from: "root", to: "dec" },
      { from: "enc",  to: "mha" },
      { from: "enc",  to: "ff" },
      { from: "enc",  to: "pe" },
      { from: "dec",  to: "dmha" },
      { from: "dec",  to: "dff" },
      { from: "enc",  to: "dec", dashed: true },
    ],
  },
  attention: {
    nodes: [
      { id: "root", x: 190, y: 80,  label: "Attention\nMechanism", color: "var(--gold)", textColor: "var(--bg)", w: 120, h: 46 },
      { id: "q",    x: 60,  y: 200, label: "Query (Q)",   color: "var(--accent)", textColor: "var(--bg)", w: 90, h: 34 },
      { id: "k",    x: 190, y: 200, label: "Key (K)",     color: "var(--accent)", textColor: "var(--bg)", w: 90, h: 34 },
      { id: "v",    x: 320, y: 200, label: "Value (V)",   color: "var(--accent)", textColor: "var(--bg)", w: 90, h: 34 },
      { id: "dot",  x: 125, y: 310, label: "Dot Product", color: "var(--card)", textColor: "var(--ink)", w: 100, h: 34 },
      { id: "scale",x: 125, y: 390, label: "Scale by √dₖ",color: "var(--card)", textColor: "var(--ink)", w: 110, h: 34 },
      { id: "softmax",x:125,y: 460, label: "Softmax",     color: "var(--card)", textColor: "var(--ink)", w: 90, h: 34 },
      { id: "out",  x: 190, y: 540, label: "Output",      color: "var(--emerald)", textColor: "var(--bg)", w: 80, h: 34 },
    ],
    edges: [
      { from: "root", to: "q" },
      { from: "root", to: "k" },
      { from: "root", to: "v" },
      { from: "q",    to: "dot" },
      { from: "k",    to: "dot" },
      { from: "dot",  to: "scale" },
      { from: "scale",to: "softmax" },
      { from: "softmax",to:"out" },
      { from: "v",    to: "out", dashed: true },
    ],
  },
};

function getNodeCenter(node) {
  return { x: node.x + node.w / 2, y: node.y + node.h / 2 };
}

function ConceptDiagram({ diagramKey }) {
  const diagram = CONCEPT_DIAGRAMS[diagramKey] || CONCEPT_DIAGRAMS.default;
  const nodeMap = Object.fromEntries(diagram.nodes.map(n => [n.id, n]));

  const allX = diagram.nodes.map(n => n.x);
  const allY = diagram.nodes.map(n => n.y);
  const allW = diagram.nodes.map(n => n.x + n.w);
  const allH = diagram.nodes.map(n => n.y + n.h);
  const minX = Math.min(...allX) - 20;
  const minY = Math.min(...allY) - 20;
  const maxX = Math.max(...allW) + 20;
  const maxY = Math.max(...allH) + 20;
  const vw = maxX - minX;
  const vh = maxY - minY;

  return (
    <svg
      viewBox={`${minX} ${minY} ${vw} ${vh}`}
      className="w-full h-auto"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="var(--muted)" fillOpacity="0.5" />
        </marker>
        <marker id="arrow-dashed" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="var(--gold)" fillOpacity="0.4" />
        </marker>
      </defs>

      {/* Edges */}
      {diagram.edges.map((edge, i) => {
        const from = nodeMap[edge.from];
        const to   = nodeMap[edge.to];
        if (!from || !to) return null;
        const fc = getNodeCenter(from);
        const tc = getNodeCenter(to);
        const dx = tc.x - fc.x;
        const dy = tc.y - fc.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / len;
        const uy = dy / len;
        const pad = 22;
        const x1 = fc.x + ux * pad;
        const y1 = fc.y + uy * pad;
        const x2 = tc.x - ux * (pad + 2);
        const y2 = tc.y - uy * (pad + 2);
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={edge.dashed ? "var(--gold)" : "var(--muted)"}
            strokeOpacity={edge.dashed ? 0.4 : 0.35}
            strokeWidth="1.5"
            strokeDasharray={edge.dashed ? "5 3" : undefined}
            markerEnd={edge.dashed ? "url(#arrow-dashed)" : "url(#arrow)"}
          />
        );
      })}

      {/* Nodes */}
      {diagram.nodes.map(node => {
        const lines = node.label.split("\n");
        const lineH = 14;
        const totalTextH = lines.length * lineH;
        const textY = node.y + node.h / 2 - totalTextH / 2 + lineH * 0.75;
        return (
          <g key={node.id}>
            <rect
              x={node.x} y={node.y}
              width={node.w} height={node.h}
              rx="8"
              fill={node.color}
              stroke="var(--line)"
              strokeWidth="1"
              opacity="0.95"
            />
            {lines.map((line, li) => (
              <text
                key={li}
                x={node.x + node.w / 2}
                y={textY + li * lineH}
                textAnchor="middle"
                fill={node.textColor}
                fontSize="11"
                fontWeight={node.id === "root" ? "700" : "500"}
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-3 p-5 animate-pulse">
      <div className="h-3 bg-line rounded-full w-2/3" />
      <div className="h-[260px] bg-line rounded-xl" />
      <div className="h-2.5 bg-line rounded-full w-full" />
      <div className="h-2.5 bg-line rounded-full w-5/6" />
      <div className="h-2.5 bg-line rounded-full w-4/6" />
    </div>
  );
}

export default function VisualizationPanel({ concept, diagramKey, onClose }) {
  const [loading, setLoading]   = useState(true);
  const [genCount, setGenCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(t);
  }, [genCount]);

  const handleRegenerate = () => setGenCount(c => c + 1);

  const handleDownload = () => {
    const svg = document.getElementById("rl-viz-svg");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `${concept.replace(/\s+/g, "-").toLowerCase()}-diagram.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-bg/60 backdrop-blur-sm animate-fade-in lg:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-[57px] bottom-0 z-50 w-full max-w-[380px] bg-surface border-l border-line shadow-2xl flex flex-col animate-slide-in-right">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-base leading-none">🎨</span>
            <div>
              <div className="text-xs font-semibold text-ink">Visualization</div>
              <div className="text-[10px] text-muted leading-none mt-0.5 truncate max-w-[220px]">{concept}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted hover:text-ink hover:bg-line transition-colors cursor-pointer text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <>
              <Skeleton />
              <div className="px-5 pb-2">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="inline-block w-3 h-3 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                  Generating concept diagram…
                </div>
              </div>
            </>
          ) : (
            <div className="p-5 animate-fade-in">
              {/* Diagram label */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-muted uppercase tracking-widest font-semibold">Concept Map</span>
                <span className="text-[10px] text-gold font-mono bg-gold/10 border border-gold/20 rounded-full px-2 py-0.5">AI Generated</span>
              </div>

              {/* Diagram */}
              <div id="rl-viz-svg" className="bg-card border border-line rounded-xl p-3 mb-4">
                <ConceptDiagram diagramKey={diagramKey} />
              </div>

              {/* Caption */}
              <p className="text-xs text-muted leading-[1.7] mb-4">
                This diagram maps the key components and relationships in <strong className="text-ink">{concept}</strong>.
                Each node represents a concept; arrows show how they connect and depend on each other.
              </p>

              {/* Legend */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-5">
                {[
                  { color: "bg-gold",    label: "Core concept" },
                  { color: "bg-accent",  label: "Sub-component" },
                  { color: "bg-line",    label: "Detail" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-sm ${item.color} opacity-80`} />
                    <span className="text-[10px] text-muted">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-line mb-4" />

              {/* Quick insights */}
              <div className="text-[10px] text-muted uppercase tracking-widest font-semibold mb-2">Key Insight</div>
              <div className="text-xs text-muted leading-[1.7] border-l-2 border-gold-dim pl-3">
                The Transformer's power comes from replacing sequential processing with parallel attention — every token can directly interact with every other token in a single step.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-line px-5 py-3 flex items-center gap-2">
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M10 2A5 5 0 1 0 11 6" />
              <path d="M8 0l2 2-2 2" />
            </svg>
            Regenerate
          </button>
          <button
            onClick={handleDownload}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-surface text-muted border border-line hover:text-ink hover:border-muted transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 1v7M3 5l3 3 3-3M1 10h10" />
            </svg>
            Download
          </button>
        </div>
      </div>
    </>
  );
}
