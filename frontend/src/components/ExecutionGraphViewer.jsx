export function ExecutionGraphViewer({ graph }) {
  return (
    <div className="card">
      <h3>Execution Graph Viewer (v1)</h3>
      <p>Component contract preserved for future 3D upgrade.</p>
      <ul>
        {graph.steps.map((s) => (
          <li key={s.id}>{s.id}: {s.command}</li>
        ))}
      </ul>
    </div>
  );
}
