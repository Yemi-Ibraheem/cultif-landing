import './UploadProgress.css';

type UploadState = 'uploading' | 'failed' | 'complete';

interface UploadProgressProps {
  state: UploadState;
  progress: number; // 0–100
  error?: string;
  onRetry: () => void;
  onGoBack: () => void;
  onUploadAnother: () => void;
  onViewDish: () => void;
}

function UploadProgress({
  state,
  progress,
  error,
  onRetry,
  onGoBack,
  onUploadAnother,
  onViewDish,
}: UploadProgressProps) {
  if (state === 'uploading') {
    return (
      <div className="upload-progress">
        <div className="upload-progress-circle">
          <svg viewBox="0 0 100 100" className="progress-svg">
            <circle cx="50" cy="50" r="45" className="progress-bg" />
            <circle
              cx="50"
              cy="50"
              r="45"
              className="progress-fill"
              strokeDasharray={`${progress * 2.83} ${283 - progress * 2.83}`}
              strokeDashoffset="0"
            />
          </svg>
          <span className="progress-text">{progress}%</span>
        </div>
        <h2 className="upload-status-text">Uploading dish...</h2>
        <p className="upload-tip">
          Tip: Keep promoting your page to get more followers, typically 1% of your audience will convert to follow.
        </p>
      </div>
    );
  }

  if (state === 'failed') {
    return (
      <div className="upload-progress">
        <div className="upload-failed-icon">⚠️</div>
        <h2 className="upload-failed-text">Upload failed</h2>
        <p className="upload-error">{error || 'Err 101: Check internet connection'}</p>
        <button className="upload-retry-btn" onClick={onRetry}>
          Retry
        </button>
        <button className="upload-goback-btn" onClick={onGoBack}>
          Go back to steps
        </button>
      </div>
    );
  }

  // complete
  return (
    <div className="upload-progress">
      <div className="upload-complete-icon">🎉</div>
      <h2 className="upload-complete-text">Congratulations on finishing the dish!</h2>
      <button className="upload-another-btn" onClick={onUploadAnother}>
        Upload another dish
      </button>
      <button className="upload-view-btn" onClick={onViewDish}>
        View dish
      </button>
    </div>
  );
}

export default UploadProgress;
