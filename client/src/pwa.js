import { registerSW } from 'virtual:pwa-register';

let needRefresh = false;
let swUpdater;
const listeners = new Set();
const DISMISSED_WAITING_SW_KEY = 'dismissedWaitingServiceWorker';

const notifyListeners = () => {
  listeners.forEach((listener) => listener(needRefresh));
};

const setNeedRefresh = (value) => {
  needRefresh = value;
  notifyListeners();
};

const getWaitingServiceWorkerUrl = async () => {
  if (!('serviceWorker' in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return registration?.waiting?.scriptURL ?? null;
  } catch (error) {
    console.warn('Unable to inspect waiting service worker', error);
    return null;
  }
};

export const subscribeNeedRefresh = (listener) => {
  listeners.add(listener);
  listener(needRefresh);

  return () => {
    listeners.delete(listener);
  };
};

export const dismissRefreshPrompt = async () => {
  const waitingScriptUrl = await getWaitingServiceWorkerUrl();

  if (waitingScriptUrl) {
    localStorage.setItem(DISMISSED_WAITING_SW_KEY, waitingScriptUrl);
  }

  setNeedRefresh(false);
};

export const applyServiceWorkerUpdate = () => {
  if (!swUpdater) return;

  localStorage.removeItem(DISMISSED_WAITING_SW_KEY);
  setNeedRefresh(false);
  swUpdater(true);
};

swUpdater = registerSW({
  async onNeedRefresh() {
    const waitingScriptUrl = await getWaitingServiceWorkerUrl();
    const dismissedWaitingScriptUrl = localStorage.getItem(DISMISSED_WAITING_SW_KEY);

    if (waitingScriptUrl && waitingScriptUrl === dismissedWaitingScriptUrl) {
      setNeedRefresh(false);
      return;
    }

    setNeedRefresh(true);
  },
  onOfflineReady() {
    console.log('App is ready to work offline');
  },
});
