import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { ACCFPage } from './pages/ACCFPage';

export function App() {
  return (
    <div>
      <nav className="nav">
        <Link to="/accf">ACCF</Link>
      </nav>
      <Routes>
        <Route path="/accf" element={<ACCFPage />} />
        <Route path="*" element={<Navigate to="/accf" replace />} />
      </Routes>
    </div>
  );
}
