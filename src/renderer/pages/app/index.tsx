import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../home';
import ComfyUI from '../comfyui';

import styles from './styles.module.scss';

export default function App() {
  return (
    <div className={styles.app}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/comfyui" element={<ComfyUI />} />
        </Routes>
      </Router>
    </div>
  );
}
