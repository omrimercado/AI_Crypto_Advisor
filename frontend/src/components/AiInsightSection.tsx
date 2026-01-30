import type { AiInsight } from '../types';
import VoteButtons from './VoteButtons';
import './DashboardSections.css';

interface AiInsightSectionProps {
  insight: AiInsight;
  onVote: (section: string, contentId: string, vote: 'up' | 'down') => void;
  userFeedback: Record<string, 'up' | 'down'>;
}

export default function AiInsightSection({ insight, onVote, userFeedback }: AiInsightSectionProps) {
  return (
    <div className="dashboard-card ai-insight-section">
      <div className="card-header">
        <h2>
         
          AI Insight of the Day
        </h2>
        <VoteButtons
          section="aiInsight"
          contentId={insight.id}
          currentVote={userFeedback[`aiInsight-${insight.id}`]}
          onVote={onVote}
        />
      </div>
      <div className="insight-content">
        <p>{insight.content}</p>
        <span className="insight-date">
          Generated: {new Date(insight.generatedAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
