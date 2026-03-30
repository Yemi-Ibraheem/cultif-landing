import { useRef } from 'react';
import './StepBasics.css';

interface StepBasicsProps {
  title: string;
  description: string;
  coverImagePreview: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onImageSelect: (file: File) => void;
}

function StepBasics({
  title,
  description,
  coverImagePreview,
  onTitleChange,
  onDescriptionChange,
  onImageSelect,
}: StepBasicsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const hasImage = !!coverImagePreview;
  const hasTitle = title.trim() !== '';
  const hasDescription = description.trim() !== '';
  const filledCount = [hasImage, hasTitle, hasDescription].filter(Boolean).length;

  return (
    <div className="step-basics">
      <h2 className="step-title">Upload Dish</h2>
      <span className="step-required-counter">{filledCount}/3 required</span>

      <div
        className={`image-upload-area${!hasImage ? ' image-upload-area--required' : ''}`}
        onClick={handleImageClick}
      >
        {coverImagePreview ? (
          <img src={coverImagePreview} alt="Cover preview" className="image-preview" />
        ) : (
          <div className="image-placeholder">
            <span className="image-placeholder-icon">📷</span>
            <span className="image-placeholder-text">Upload Cover Image *</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="image-input-hidden"
        />
      </div>

      <p className="image-hint">16:9 aspect ratio recommended</p>

      <div className="form-group">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Name of dish *"
          className={`step-input${!hasTitle ? ' step-input--required' : ''}`}
        />
      </div>

      <div className="form-group">
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Description *"
          className={`step-textarea${!hasDescription ? ' step-textarea--required' : ''}`}
          rows={3}
        />
      </div>
    </div>
  );
}

export default StepBasics;
