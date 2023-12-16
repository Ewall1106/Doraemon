import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type State = {
  installPath: string;
};

type Actions = {
  setInstallPath: (flag) => void;
};

export const useComfyStore = create(
  immer<State & Actions>((set) => ({
    installPath: window.electron.store.get('COMFYUI_INSTALL_PATH'),

    setInstallPath: (installPath) => {
      set((state) => {
        state.installPath = installPath;
        window.electron.store.set('COMFYUI_INSTALL_PATH', installPath);
      });
    },
  })),
);

export default useComfyStore;
