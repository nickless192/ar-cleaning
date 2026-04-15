import { registerSW } from 'virtual:pwa-register';

let needRefresh = false;
let swUpdater;
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => listener(needRefresh));
};

const setNeedRefresh = (value) => {
  needRefresh = value;
  notifyListeners();
};

export const subscribeNeedRefresh = (listener) => {
  listeners.add(listener);
  listener(needRefresh);

  return () => {
    listeners.delete(listener);
  };
};

export const dismissRefreshPrompt = () => {
  setNeedRefresh(false);
};

export const applyServiceWorkerUpdate = () => {
  if (!swUpdater) return;

  setNeedRefresh(false);
  swUpdater(true);
};

swUpdater = registerSW({
  onNeedRefresh() {
    setNeedRefresh(true);
  },
  onOfflineReady() {
    console.log('App is ready to work offline');
  },
});
