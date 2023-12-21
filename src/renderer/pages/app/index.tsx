import { useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { requestConfigUrl } from '@/shared/config';
import { useAppStore } from '@/store';

import Home from '../home';
import Detail from '../detail';
import ComfyUI from '../comfyui';

import styles from './styles.module.scss';

const { ipcRenderer } = window.electron;

export default function App() {
  const setAppInfo = useAppStore((state) => state.setAppInfo);

  const init = async () => {
    const res = await ipcRenderer.invoke('request.get', requestConfigUrl);
    console.log('init request:', res);
    setAppInfo(res);
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
          <Route path="/detail" element={<Detail />} />
        </Routes>
      </Router>
    </div>
  );
}
