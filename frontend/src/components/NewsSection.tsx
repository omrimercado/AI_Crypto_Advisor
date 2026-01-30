import { useState } from 'react';
import type { NewsItem } from '../types';
import VoteButtons from './VoteButtons';
import './DashboardSections.css';

interface NewsSectionProps {
  news: NewsItem[];
  onVote: (section: string, contentId: string, vote: 'up' | 'down') => void;
  userFeedback: Record<string, 'up' | 'down'>;
}

export default function NewsSection({ news, onVote, userFeedback }: NewsSectionProps) {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const openModal = (item: NewsItem) => {
    setSelectedNews(item);
  };

  const closeModal = () => {
    setSelectedNews(null);
  };

  return (
    <div className="dashboard-card news-section">
      <div className="card-header">
        <h2>
          <span className="icon">📰</span>
          Market News
        </h2>
      </div>
      <div className="news-list">
        {news.length === 0 ? (
          <p className="empty-state">No news available</p>
        ) : (
          news.map((item) => (
            <div key={item.id} className="news-item">
              <div className="news-content">
                <button
                  className="news-title-button"
                  onClick={() => openModal(item)}
                >
                  {item.title}
                </button>
                <div className="news-meta">
                  <span className="news-date">
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </span>
                  <span className="news-kind">{item.kind}</span>
                </div>
              </div>
              <VoteButtons
                section="news"
                contentId={item.id}
                currentVote={userFeedback[`news-${item.id}`]}
                onVote={onVote}
              />
            </div>
          ))
        )}
      </div>

      {/* News Description Modal */}
      {selectedNews && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>
            <h3 className="modal-title">{selectedNews.title}</h3>
            <p className="modal-date">
              {new Date(selectedNews.publishedAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="modal-description">{selectedNews.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
