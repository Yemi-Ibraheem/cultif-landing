import './SectionHeader.css';

interface SectionHeaderProps {
  title: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

function SectionHeader({ title, showViewAll, onViewAll }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <h2 className="section-title">{title}</h2>
      {showViewAll && (
        <button className="view-all-button" onClick={onViewAll}>
          View all →
        </button>
      )}
    </div>
  );
}

export default SectionHeader;
