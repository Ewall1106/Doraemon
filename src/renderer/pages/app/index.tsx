import { useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { requestConfigUrl } from '@/shared/config';
import { useComfyStore } from '@/store';

import Home from '../home';
import ComfyUI from '../comfyui';

import styles from './styles.module.scss';

const { ipcRenderer } = window.electron;

export default function App() {
  const setInfo = useComfyStore((state) => state.setInfo);

  const init = async () => {
    const res: any = await ipcRenderer.invoke('request.get', requestConfigUrl);
    console.log('init request:', res);
    setInfo(res?.comfyui);
  };

  useEffect(() => {
    init();
  }, []);

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
