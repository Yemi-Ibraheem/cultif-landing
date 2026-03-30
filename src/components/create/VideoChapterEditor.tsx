import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import "./VideoChapterEditor.css";

interface RecipeVideoSection {
  title: string;
  description?: string;
  startTime: number;
  endTime?: number;
}

interface VideoChapterEditorProps {
  recipeId: Id<"recipes">;
  videoStorageId: Id<"_storage">;
}

function formatTimestamp(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function roundTime(value: number) {
  return Math.round(Math.max(0, value) * 10) / 10;
}

function normaliseSections(sections: RecipeVideoSection[], duration?: number | null) {
  return sections
    .map((section, index) => {
      const startTime = roundTime(section.startTime);
      const endTime =
        section.endTime === undefined || section.endTime === null
          ? undefined
          : roundTime(section.endTime);
      const boundedEndTime =
        duration && endTime !== undefined ? Math.min(endTime, roundTime(duration)) : endTime;

      return {
        title: section.title.trim() || `Section ${index + 1}`,
        description: section.description?.trim() || undefined,
        startTime,
        endTime:
          boundedEndTime !== undefined && boundedEndTime > startTime
            ? boundedEndTime
            : undefined,
      };
    })
    .sort((a, b) => a.startTime - b.startTime);
}

export function VideoChapterEditor({
  recipeId,
  videoStorageId,
}: VideoChapterEditorProps) {
  const recipe = useQuery(api.recipes.getRecipeById, { recipeId });
  const videoUrl = useQuery(api.recipes.getStorageUrl, { storageId: videoStorageId });
  const updateRecipe = useMutation(api.recipes.updateRecipe);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [sections, setSections] = useState<RecipeVideoSection[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const recipeSections = recipe?.recipeVideo?.sections ?? [];
    setSections(recipeSections);
    if (recipe?.recipeVideo?.duration) {
      setVideoDuration(recipe.recipeVideo.duration);
    }
  }, [recipe]);

  const sortedSections = useMemo(
    () => normaliseSections(sections, videoDuration),
    [sections, videoDuration]
  );

  const activeSectionIndex = useMemo(() => {
    if (sortedSections.length === 0) {
      return -1;
    }

    return sortedSections.findIndex((section, index) => {
      const nextStartTime = sortedSections[index + 1]?.startTime;
      const effectiveEnd =
        section.endTime ?? nextStartTime ?? videoDuration ?? Number.POSITIVE_INFINITY;
      return currentTime >= section.startTime && currentTime < effectiveEnd;
    });
  }, [currentTime, sortedSections, videoDuration]);

  const seekTo = (time: number) => {
    if (!videoRef.current) {
      return;
    }

    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const togglePlayPause = async () => {
    if (!videoRef.current) {
      return;
    }

    if (videoRef.current.paused) {
      await videoRef.current.play();
      setIsPlaying(true);
      return;
    }

    videoRef.current.pause();
    setIsPlaying(false);
  };

  const updateSection = (
    index: number,
    field: keyof RecipeVideoSection,
    value: string | number | undefined
  ) => {
    setSaveMessage(null);
    setSections((current) =>
      current.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, [field]: value } : section
      )
    );
  };

  const addSection = () => {
    setSaveMessage(null);
    setSections((current) => {
      const defaultStart =
        current.length === 0
          ? 0
          : roundTime(currentTime || current[current.length - 1]?.endTime || 0);

      return [
        ...current,
        {
          title: `Section ${current.length + 1}`,
          description: "",
          startTime: current.length === 0 ? 0 : defaultStart,
          endTime:
            current.length === 0 && videoDuration
              ? roundTime(videoDuration)
              : undefined,
        },
      ];
    });
  };

  const removeSection = (index: number) => {
    setSaveMessage(null);
    setSections((current) => current.filter((_, sectionIndex) => sectionIndex !== index));
  };

  const saveSections = async () => {
    if (!recipe?.recipeVideo) {
      setSaveError("This recipe does not have a Convex-hosted video yet.");
      return;
    }

    const cleanedSections = normaliseSections(sections, videoDuration);

    setIsSaving(true);
    setSaveError(null);
    setSaveMessage(null);

    try {
      await updateRecipe({
        recipeId,
        recipeVideo: {
          storageId: recipe.recipeVideo.storageId,
          duration: videoDuration ?? recipe.recipeVideo.duration,
          sections: cleanedSections,
        },
      });
      setSections(cleanedSections);
      setSaveMessage("Sections saved.");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save sections");
    } finally {
      setIsSaving(false);
    }
  };

  if (recipe === undefined || videoUrl === undefined) {
    return (
      <div className="video-chapter-editor video-chapter-editor--loading">
        <div className="spinner"></div>
        <p>Loading video editor...</p>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="video-chapter-editor video-chapter-editor--empty">
        <p>The uploaded video could not be loaded from Convex storage.</p>
      </div>
    );
  }

  return (
    <div className="video-chapter-editor">
      <div className="video-chapter-editor__header">
        <div>
          <h2 className="video-chapter-editor__title">Build recipe sections</h2>
          <p className="video-chapter-editor__subtitle">
            Add timestamp ranges, titles, and descriptions for each cooking moment in your video.
          </p>
        </div>
        <div className="video-chapter-editor__header-actions">
          <button
            type="button"
            className="video-chapter-editor__playback"
            onClick={() => void togglePlayPause()}
          >
            {isPlaying ? "Pause preview" : "Play preview"}
          </button>
          <button
            type="button"
            className="video-chapter-editor__save"
            disabled={isSaving}
            onClick={() => void saveSections()}
          >
            {isSaving ? "Saving..." : "Save sections"}
          </button>
        </div>
      </div>

      <div className="video-chapter-editor__layout">
        <div className="video-chapter-editor__player">
          <div className="video-chapter-editor__frame">
            <video
              ref={videoRef}
              src={videoUrl}
              className="video-chapter-editor__video"
              controls
              playsInline
              onLoadedMetadata={(event) => {
                setVideoDuration(event.currentTarget.duration);
              }}
              onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>

          <div className="video-chapter-editor__toolbar">
            <div className="video-chapter-editor__timestamp">
              Current time: <strong>{formatTimestamp(currentTime)}</strong>
              {videoDuration ? (
                <span className="video-chapter-editor__duration">
                  {" "}
                  / {formatTimestamp(videoDuration)}
                </span>
              ) : null}
            </div>
            <button
              type="button"
              className="video-chapter-editor__capture"
              onClick={addSection}
            >
              {sortedSections.length === 0 ? "Add first section" : "Add section at playhead"}
            </button>
          </div>

          {saveError && <p className="video-chapter-editor__error">{saveError}</p>}
          {saveMessage && <p className="video-chapter-editor__success">{saveMessage}</p>}
        </div>

        <aside className="video-chapter-editor__chapters">
          <div className="video-chapter-editor__chapters-header">
            <h3>Sections</h3>
            <span>{sortedSections.length}</span>
          </div>

          {sortedSections.length === 0 ? (
            <p className="video-chapter-editor__empty">
              Sections start empty after upload. Add your first section and then fine-tune the timestamps.
            </p>
          ) : (
            <div className="video-chapter-editor__chapter-list">
              {sortedSections.map((section, index) => (
                <div
                  key={`${section.startTime}-${index}`}
                  className={`video-chapter-editor__chapter-item${
                    activeSectionIndex === index ? " is-active" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="video-chapter-editor__chapter-preview"
                    onClick={() => seekTo(section.startTime)}
                  >
                    <span className="video-chapter-editor__chapter-time">
                      {formatTimestamp(section.startTime)}
                    </span>
                    <span className="video-chapter-editor__chapter-preview-title">
                      {section.title || `Section ${index + 1}`}
                    </span>
                    <span className="video-chapter-editor__chapter-preview-description">
                      {section.description || "No description yet."}
                    </span>
                  </button>

                  <div className="video-chapter-editor__field-group">
                    <label className="video-chapter-editor__label">
                      Title
                      <input
                        type="text"
                        value={section.title}
                        onChange={(event) =>
                          updateSection(index, "title", event.target.value)
                        }
                        className="video-chapter-editor__input"
                        placeholder="Prep the base"
                      />
                    </label>
                    <label className="video-chapter-editor__label">
                      Description
                      <textarea
                        value={section.description ?? ""}
                        onChange={(event) =>
                          updateSection(index, "description", event.target.value)
                        }
                        className="video-chapter-editor__textarea"
                        rows={3}
                        placeholder="Explain what happens in this section."
                      />
                    </label>
                  </div>

                  <div className="video-chapter-editor__time-grid">
                    <label className="video-chapter-editor__label">
                      Start time
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={section.startTime}
                        onChange={(event) =>
                          updateSection(
                            index,
                            "startTime",
                            Number(event.target.value || 0)
                          )
                        }
                        className="video-chapter-editor__input"
                      />
                    </label>
                    <label className="video-chapter-editor__label">
                      End time
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={section.endTime ?? ""}
                        onChange={(event) =>
                          updateSection(
                            index,
                            "endTime",
                            event.target.value === ""
                              ? undefined
                              : Number(event.target.value)
                          )
                        }
                        className="video-chapter-editor__input"
                        placeholder={videoDuration ? `${roundTime(videoDuration)}` : "Optional"}
                      />
                    </label>
                  </div>

                  <div className="video-chapter-editor__actions">
                    <button
                      type="button"
                      className="video-chapter-editor__link"
                      onClick={() => updateSection(index, "startTime", currentTime)}
                    >
                      Use playhead for start
                    </button>
                    <button
                      type="button"
                      className="video-chapter-editor__link"
                      onClick={() => updateSection(index, "endTime", currentTime)}
                    >
                      Use playhead for end
                    </button>
                    <button
                      type="button"
                      className="video-chapter-editor__remove"
                      onClick={() => removeSection(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
