import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { cloneDeep } from 'lodash';

type State = {
  info: any;
  status: string;
  installPath: string;
};

type Actions = {
  setInfo: (info) => void;
  setStatus: (flag) => void;
  setInstallPath: (flag) => void;
};

export const useComfyStore = create(
  immer<State & Actions>((set) => ({
    info: {
      pluginList: [],
      scriptList: [],
    },
    status: 'stopped',
    installPath: window.electron.store.get('COMFYUI_INSTALL_PATH'),

    setInfo: (info) => {
      const newInfo = cloneDeep(info);
      set((state) => {
        state.info = newInfo;
      });
    },

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
