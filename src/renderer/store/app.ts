import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type State = {
  appInfo: any;
};

type Actions = {
  setAppInfo: (info) => void;
};

export const useAppStore = create(
  immer<State & Actions>((set) => ({
    appInfo: {},

    setAppInfo: (info) => {
      set((state) => {
        state.appInfo = info;
      });
    },
  })),
);

export default useAppStore;
