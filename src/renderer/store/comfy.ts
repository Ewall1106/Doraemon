import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type State = {
  info: any;
  status: string;
  downloading: boolean;
  installPath: string;
};

type Actions = {
  setInfo: (info) => void;
  setStatus: (flag) => void;
  setDownloading: (flag) => void;
  setInstallPath: (flag) => void;
};

export const useComfyStore = create(
  immer<State & Actions>((set) => ({
    info: {
      pluginList: [],
      scriptList: [],
    },
    status: 'stopped',
    downloading: false,
    installPath: window.electron.store.get('COMFYUI_INSTALL_PATH'),

    setInfo: (info) => {
      set((state) => {
        state.info = info;
      });
    },

    setStatus: (status) => {
      set((state) => {
        state.status = status;
      });
    },

    setDownloading: (flag) => {
      set((state) => {
        state.downloading = flag;
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
