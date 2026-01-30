import type { CoinPrice } from '../types';
import VoteButtons from './VoteButtons';
import './DashboardSections.css';

interface PricesSectionProps {
  prices: CoinPrice[];
  onVote: (section: string, contentId: string, vote: 'up' | 'down') => void;
  userFeedback: Record<string, 'up' | 'down'>;
}

export default function PricesSection({ prices, onVote, userFeedback }: PricesSectionProps) {
  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    if (price >= 1) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(6)}`;
  };

  const formatChange = (change: number | null) => {
    if (change === null) return 'N/A';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <div className="dashboard-card prices-section">
      <div className="card-header">
        <h2>
          <span className="icon">📈</span>
          Coin Prices
        </h2>
      </div>
      <div className="prices-list">
        {prices.length === 0 ? (
          <p className="empty-state">No price data available</p>
        ) : (
          prices.map((coin) => (
            <div key={coin.id} className="price-item">
              <div className="coin-info">
                {coin.image ? (
                  <img src={coin.image} alt={coin.name} className="coin-image" />
                ) : (
                  <div className="coin-image coin-placeholder">{coin.symbol.slice(0, 2)}</div>
                )}
                <div className="coin-details">
                  <span className="coin-name">{coin.name}</span>
                  <span className="coin-symbol">{coin.symbol.toUpperCase()}</span>
                </div>
              </div>
              <div className="price-info">
                <span className="coin-price">{formatPrice(coin.currentPrice)}</span>
                <span className={`price-change ${(coin.priceChange24h ?? 0) >= 0 ? 'positive' : 'negative'}`}>
                  {formatChange(coin.priceChange24h)}
                </span>
              </div>
              <VoteButtons
                section="prices"
                contentId={coin.id}
                currentVote={userFeedback[`prices-${coin.id}`]}
                onVote={onVote}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
