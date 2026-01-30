import type { Meme } from '../types';
import VoteButtons from './VoteButtons';
import './DashboardSections.css';

interface MemeSectionProps {
  meme: Meme;
  onVote: (section: string, contentId: string, vote: 'up' | 'down') => void;
  userFeedback: Record<string, 'up' | 'down'>;
}

export default function MemeSection({ meme, onVote, userFeedback }: MemeSectionProps) {
  return (
    <div className="dashboard-card meme-section">
      <div className="card-header">
        <h2>
          
          Crypto Meme
        </h2>
        <VoteButtons
          section="meme"
          contentId={meme.id}
          currentVote={userFeedback[`meme-${meme.id}`]}
          onVote={onVote}
        />
      </div>
      <div className="meme-content">
        <h3 className="meme-title">{meme.title}</h3>
        <img
          src={meme.imageUrl}
          alt={meme.altText || meme.title}
          title={meme.altText || meme.title}
          className="meme-image"
        />
      </div>
    </div>
  );
}
