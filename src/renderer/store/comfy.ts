import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type State = {
  status: string;
  installPath: string;
};

type Actions = {
  setInstallPath: (flag) => void;
  setStatus: (flag) => void;
};

export const useComfyStore = create(
  immer<State & Actions>((set) => ({
    status: 'stopped',
    installPath: window.electron.store.get('COMFYUI_INSTALL_PATH'),

    setStatus: (status) => {
      set((state) => {
        state.status = status;
      });
    },

    setInstallPath: (installPath) => {
      set((state) => {
        state.installPath = installPath;
        window.electron.store.set('COMFYUI_INSTALL_PATH', installPath);
      });
    },
  })),
);

export default useComfyStore;
