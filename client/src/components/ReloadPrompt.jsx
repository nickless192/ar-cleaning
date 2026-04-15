import { useEffect, useState } from 'react';
import {
  applyServiceWorkerUpdate,
  dismissRefreshPrompt,
  subscribeNeedRefresh,
} from '/src/pwa';

const ReloadPrompt = () => {
  const [needRefresh, setNeedRefresh] = useState(false);

  useEffect(() => {
    return subscribeNeedRefresh(setNeedRefresh);
  }, []);

  if (!needRefresh) {
    return null;
  }

  return (
    <div
      className="position-fixed p-3"
      style={{ bottom: '1rem', right: '1rem', zIndex: 1080 }}
      role="status"
      aria-live="polite"
    >
      <div className="alert alert-info shadow mb-0 d-flex align-items-center gap-2">
        <span>New content is available.</span>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={applyServiceWorkerUpdate}
        >
          Refresh
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={dismissRefreshPrompt}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default ReloadPrompt;
