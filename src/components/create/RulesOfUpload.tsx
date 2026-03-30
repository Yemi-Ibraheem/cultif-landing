import './RulesOfUpload.css';

interface RulesOfUploadProps {
  agreed: boolean;
  onAgreeChange: (agreed: boolean) => void;
  onUpload: () => void;
}

function RulesOfUpload({ agreed, onAgreeChange, onUpload }: RulesOfUploadProps) {
  return (
    <div className="rules-of-upload">
      <h2 className="step-title">Rules of upload</h2>
      <p className="rules-subtitle">Pick a time and date in the future to post your recipe</p>

      <ul className="rules-list">
        <li>No alcohol in dishes, this is a child friendly app</li>
        <li>Please post accurate information or your dish will be removed. Use the AI assistance to estimate the nutritional facts</li>
      </ul>

      <label className="rules-checkbox-label">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onAgreeChange(e.target.checked)}
          className="rules-checkbox"
        />
        <span className={`rules-checkbox-text ${agreed ? 'agreed' : ''}`}>
          I have read and agree to the rules of upload
        </span>
      </label>

      <button
        className={`rules-upload-btn ${agreed ? 'active' : ''}`}
        onClick={onUpload}
        disabled={!agreed}
      >
        Upload
      </button>
    </div>
  );
}

export default RulesOfUpload;
