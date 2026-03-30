import { useCallback, useMemo, useRef, useState } from "react";
import "./StepVideo.css";

export interface VideoChapter {
  title: string;
  description: string;
  startTime: number;
}

interface StepVideoProps {
  /** Convex storage URL — set after upload succeeds */
  videoStorageUrl: string | null;
  /** 0-100 while uploading, null when idle */
  uploadProgress: number | null;
  /** Error message if upload failed */
  uploadError: string | null;
  /** Chapters created by the chef */
  chapters: VideoChapter[];
  /** True when editing an existing recipe that already has a video */
  hasExistingVideo: boolean;
  /** Called when a file is selected — parent handles the actual upload */
  onVideoSelect: (file: File) => void;
  /** Called when chapters change */
  onChaptersChange: (chapters: VideoChapter[]) => void;
  /** Proceed to next wizard step */
  onNext: () => void;
}

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function StepVideo({
  videoStorageUrl,
  uploadProgress,
  uploadError,
  chapters,
  hasExistingVideo,
  onVideoSelect,
  onChaptersChange,
  onNext,
}: StepVideoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);

  const isUploading = uploadProgress !== null && uploadProgress < 100;
  const uploadDone = !!videoStorageUrl;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onVideoSelect(file);
    // Reset the input so the same file can be re-selected
    event.target.value = "";
  };

  // ── Chapter helpers ──

  const sortedChapters = useMemo(
    () => [...chapters].sort((a, b) => a.startTime - b.startTime),
    [chapters]
  );

  const addChapter = useCallback(() => {
    const time = videoRef.current ? videoRef.current.currentTime : 0;
    onChaptersChange([
      ...chapters,
      { title: "", description: "", startTime: Math.round(time * 10) / 10 },
    ]);
  }, [chapters, onChaptersChange]);

  const updateChapter = useCallback(
    (index: number, field: keyof VideoChapter, value: string | number) => {
      onChaptersChange(
        chapters.map((ch, i) => (i === index ? { ...ch, [field]: value } : ch))
      );
    },
    [chapters, onChaptersChange]
  );

  const removeChapter = useCallback(
    (index: number) => {
      onChaptersChange(chapters.filter((_, i) => i !== index));
    },
    [chapters, onChaptersChange]
  );

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setChapterToPlayhead = useCallback(
    (index: number) => {
      const time = videoRef.current ? videoRef.current.currentTime : 0;
      updateChapter(index, "startTime", Math.round(time * 10) / 10);
    },
    [updateChapter]
  );

  const canProceed = uploadDone || hasExistingVideo;

  return (
    <div className="step-video">
      <h2 className="step-title">Upload Video</h2>
      <p className="step-video-subtitle">
        Upload your recipe video. Once it's uploaded you can split it into
        chapters so viewers follow along step by step.
      </p>

      {/* ── State 1: No video yet — show upload area ── */}
      {!uploadDone && !isUploading && (
        <div className="video-upload-area" onClick={handleUploadClick}>
          <div className="video-placeholder">
            <div className="video-placeholder-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <span className="video-placeholder-text">
              Tap to upload your video
            </span>
            <span className="video-placeholder-hint">
              MP4, MOV, or WebM recommended
            </span>
          </div>
        </div>
      )}

      {/* ── State 2: Uploading — show progress ── */}
      {isUploading && (
        <div className="video-uploading-panel">
          <div className="video-uploading-icon">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#20b2aa"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
          </div>
          <p className="video-uploading-label">Uploading video...</p>
          <div className="video-progress-track">
            <div
              className="video-progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="video-progress-pct">{uploadProgress}%</span>
        </div>
      )}

      {/* ── Upload error ── */}
      {uploadError && (
        <div className="video-error-panel">
          <p className="video-error-text">{uploadError}</p>
          <button
            type="button"
            className="video-error-retry"
            onClick={handleUploadClick}
          >
            Try again
          </button>
        </div>
      )}

      {/* ── State 3: Uploaded — show preview + chapter editor ── */}
      {uploadDone && (
        <>
          <div className="video-upload-area has-preview">
            <div className="video-preview-container">
              <video
                key={videoStorageUrl ?? "no-video"}
                ref={videoRef}
                src={videoStorageUrl ?? undefined}
                className="video-preview"
                controls
                playsInline
                preload="auto"
                onLoadedMetadata={(e) => {
                  const dur = e.currentTarget.duration;
                  if (Number.isFinite(dur)) setVideoDuration(dur);
                }}
                onTimeUpdate={(e) =>
                  setCurrentTime(e.currentTarget.currentTime)
                }
                onError={(e) => {
                  const video = e.currentTarget;
                  const err = video.error;
                  console.error("[StepVideo] playback error:", err?.code, err?.message);
                  console.error("[StepVideo] video src:", video.src);
                }}
              />
              <button
                type="button"
                className="video-reupload-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Replace video
              </button>
            </div>
          </div>

          {/* ── Chapter editor ── */}
          <div className="chapter-editor">
            <div className="chapter-editor-header">
              <div>
                <h3 className="chapter-editor-title">Chapters</h3>
                <p className="chapter-editor-hint">
                  Play the video, pause where a new step begins, and tap
                  "Add chapter".
                </p>
              </div>
              <span className="chapter-count">{sortedChapters.length}</span>
            </div>

            {/* Playhead bar */}
            <div className="chapter-playhead-bar">
              <span className="chapter-playhead-time">
                {formatTime(currentTime)}
                {videoDuration ? (
                  <span className="chapter-playhead-duration">
                    {" / "}
                    {formatTime(videoDuration)}
                  </span>
                ) : null}
              </span>
              <button
                type="button"
                className="chapter-add-btn"
                onClick={addChapter}
              >
                + Add chapter here
              </button>
            </div>

            {/* Timeline strip */}
            {videoDuration && videoDuration > 0 && sortedChapters.length > 0 && (
              <div className="chapter-timeline">
                {sortedChapters.map((ch, i) => {
                  const nextStart =
                    i < sortedChapters.length - 1
                      ? sortedChapters[i + 1].startTime
                      : videoDuration;
                  const left = (ch.startTime / videoDuration) * 100;
                  const width =
                    ((nextStart - ch.startTime) / videoDuration) * 100;
                  return (
                    <div
                      key={i}
                      className="chapter-timeline-segment"
                      style={{ left: `${left}%`, width: `${width}%` }}
                      onClick={() => seekTo(ch.startTime)}
                      title={ch.title || `Chapter ${i + 1}`}
                    >
                      <span className="chapter-timeline-label">
                        {ch.title || `Ch ${i + 1}`}
                      </span>
                    </div>
                  );
                })}
                <div
                  className="chapter-timeline-playhead"
                  style={{
                    left: `${(currentTime / videoDuration) * 100}%`,
                  }}
                />
              </div>
            )}

            {/* Chapter cards */}
            {sortedChapters.length === 0 ? (
              <div className="chapter-empty-state">
                <p>
                  No chapters yet. Play the video, pause at a step, and tap
                  "Add chapter here".
                </p>
              </div>
            ) : (
              <div className="chapter-list">
                {sortedChapters.map((chapter) => {
                  const originalIndex = chapters.indexOf(chapter);
                  return (
                    <div key={originalIndex} className="chapter-card">
                      <div className="chapter-card-header">
                        <button
                          type="button"
                          className="chapter-card-time"
                          onClick={() => seekTo(chapter.startTime)}
                        >
                          {formatTime(chapter.startTime)}
                        </button>
                        <button
                          type="button"
                          className="chapter-card-remove"
                          onClick={() => removeChapter(originalIndex)}
                          aria-label="Remove chapter"
                        >
                          &times;
                        </button>
                      </div>

                      <input
                        type="text"
                        className="chapter-card-input"
                        placeholder="Chapter heading"
                        value={chapter.title}
                        onChange={(e) =>
                          updateChapter(originalIndex, "title", e.target.value)
                        }
                      />
                      <textarea
                        className="chapter-card-textarea"
                        placeholder="Describe what happens in this step..."
                        rows={2}
                        value={chapter.description}
                        onChange={(e) =>
                          updateChapter(
                            originalIndex,
                            "description",
                            e.target.value
                          )
                        }
                      />

                      <button
                        type="button"
                        className="chapter-card-set-time"
                        onClick={() => setChapterToPlayhead(originalIndex)}
                      >
                        Set to current time ({formatTime(currentTime)})
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Hidden file input — always in DOM */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/x-matroska,video/*"
        onChange={handleFileChange}
        className="image-input-hidden"
      />

      {/* Bottom */}
      <div className="video-bottom-row">
        <button
          className="video-next-btn"
          onClick={onNext}
          disabled={!canProceed}
        >
          {canProceed ? "Next" : isUploading ? "Uploading..." : "Upload a video to continue"}
        </button>
      </div>
    </div>
  );
}

export default StepVideo;
