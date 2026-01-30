import './VoteButtons.css';

interface VoteButtonsProps {
  section: string;
  contentId: string;
  currentVote?: 'up' | 'down';
  onVote: (section: string, contentId: string, vote: 'up' | 'down') => void;
}

export default function VoteButtons({ section, contentId, currentVote, onVote }: VoteButtonsProps) {
  return (
    <div className="vote-buttons">
      <button
        className={`vote-button up ${currentVote === 'up' ? 'active' : ''}`}
        onClick={() => onVote(section, contentId, 'up')}
        title="Helpful"
      >
        👍
      </button>
      <button
        className={`vote-button down ${currentVote === 'down' ? 'active' : ''}`}
        onClick={() => onVote(section, contentId, 'down')}
        title="Not helpful"
      >
        👎
      </button>
    </div>
  );
}
