import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../home';
import ComfyUI from '../comfyui';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/comfyui" element={<ComfyUI />} />
      </Routes>
    </Router>
  );
}
