import React, { useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import "./RecipeVideoPlayer.css";

interface RecipeVideoPlayerProps {
  recipeId: Id<"recipes">;
}

interface VideoSection {
  title: string;
  description?: string;
  startTime: number;
  endTime?: number;
}

function formatTimestamp(seconds: number) {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function getActiveSectionIndex(
  sections: VideoSection[],
  currentTime: number,
  duration?: number
) {
  return sections.findIndex((section, index) => {
    const nextStart = sections[index + 1]?.startTime;
    const effectiveEnd =
      section.endTime ?? nextStart ?? duration ?? Number.POSITIVE_INFINITY;
    return currentTime >= section.startTime && currentTime < effectiveEnd;
  });
}

export const RecipeVideoPlayer: React.FC<RecipeVideoPlayerProps> = ({ recipeId }) => {
  const recipe = useQuery(api.recipes.getRecipeById, { recipeId });
  const legacyChapters =
    useQuery(api.videoChapters.getVideoChaptersByRecipe, { recipeId }) ?? [];
  const storageUrl = useQuery(
    api.recipes.getStorageUrl,
    recipe?.recipeVideo?.storageId
      ? { storageId: recipe.recipeVideo.storageId }
      : "skip"
  );
  const nativeVideoRef = useRef<HTMLVideoElement>(null);
  const [nativeCurrentTime, setNativeCurrentTime] = useState(0);
  const [nativeDuration, setNativeDuration] = useState<number | undefined>(undefined);

  const usesStorageUrl = Boolean(recipe?.recipeVideo?.storageId);
  const loading = recipe === undefined || (usesStorageUrl && storageUrl === undefined);

  if (loading) {
    return (
      <div className="video-player-placeholder loading">
        <div className="spinner"></div>
        <p>Initializing player...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="video-player-placeholder no-video">
        <p>No video available for this recipe.</p>
      </div>
    );
  }

  const convexSections = recipe.recipeVideo?.sections ?? [];
  const fallbackSections: VideoSection[] =
    legacyChapters.length > 0
      ? legacyChapters.map((chapter) => ({
          title: chapter.title,
          description: chapter.description || undefined,
          startTime: chapter.startTime,
        }))
      : (recipe.videoParts ?? []).map((part) => ({
          title: part.name,
          description: part.notes || undefined,
          startTime: part.startTime,
          endTime: part.endTime,
        }));

  const hasConvexVideo = Boolean(recipe.recipeVideo?.storageId && storageUrl);

  // Legacy direct URL fallback (for old recipes with external HTTP video URLs)
  const legacyVideoUrl =
    !hasConvexVideo && recipe.videoUrl && recipe.videoUrl !== "uploading"
      ? recipe.videoUrl
      : null;
  const legacyDirectUrl =
    legacyVideoUrl &&
    (legacyVideoUrl.startsWith("http://") ||
      legacyVideoUrl.startsWith("https://") ||
      legacyVideoUrl.startsWith("/"))
      ? legacyVideoUrl
      : null;

  const videoSrc = hasConvexVideo ? storageUrl : legacyDirectUrl;
  const sections = hasConvexVideo ? convexSections : fallbackSections;
  const activeSectionIndex = getActiveSectionIndex(
    sections,
    nativeCurrentTime,
    nativeDuration ?? recipe.recipeVideo?.duration
  );

  const activeSection =
    activeSectionIndex >= 0 ? sections[activeSectionIndex] : sections[0];

  const handleSelectSection = async (section: VideoSection) => {
    if (nativeVideoRef.current) {
      nativeVideoRef.current.currentTime = section.startTime;
      setNativeCurrentTime(section.startTime);
      await nativeVideoRef.current.play().catch(() => undefined);
    }
  };

  if (!videoSrc) {
    return (
      <div className="video-player-placeholder no-video">
        <p>No video available for this recipe.</p>
      </div>
    );
  }

  return (
    <div className="recipe-video-layout">
      <div className="recipe-video-stage">
        <div className="recipe-video-container">
          <video
            ref={nativeVideoRef}
            src={videoSrc}
            className="recipe-video-native"
            controls
            playsInline
            onLoadedMetadata={(event) => {
              setNativeDuration(event.currentTarget.duration);
            }}
            onTimeUpdate={(event) => {
              setNativeCurrentTime(event.currentTarget.currentTime);
            }}
          />
        </div>

        {sections.length > 0 && (
          <div className="recipe-video-active">
            <span className="recipe-video-active__label">Now in this section</span>
            <h3>{activeSection?.title || "Recipe video"}</h3>
            {activeSection?.description ? <p>{activeSection.description}</p> : null}
          </div>
        )}
      </div>

      {sections.length > 0 && (
        <aside className="recipe-video-chapters">
          <div className="recipe-video-chapters__header">
            <h3>Video Sections</h3>
            <span>{sections.length}</span>
          </div>
          <div className="recipe-video-chapters__list">
            {sections.map((section, index) => (
              <button
                key={`${section.startTime}-${index}`}
                type="button"
                className={`recipe-video-chapters__item${
                  activeSectionIndex === index ? " is-active" : ""
                }`}
                onClick={() => void handleSelectSection(section)}
              >
                <span className="recipe-video-chapters__time">
                  {formatTimestamp(section.startTime)}
                  {section.endTime !== undefined
                    ? ` - ${formatTimestamp(section.endTime)}`
                    : ""}
                </span>
                <span className="recipe-video-chapters__title">{section.title}</span>
                <span className="recipe-video-chapters__description">
                  {section.description || "No description added yet."}
                </span>
              </button>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
};
