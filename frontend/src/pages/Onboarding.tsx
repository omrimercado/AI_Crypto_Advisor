import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { saveOnboarding } from '../api/user';
import type { UserPreferences } from '../types';
import './Onboarding.css';

const CRYPTO_ASSETS = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH'},
  { id: 'solana', name: 'Solana', symbol: 'SOL'},
  { id: 'cardano', name: 'Cardano', symbol: 'ADA'},
  { id: 'ripple', name: 'XRP', symbol: 'XRP'},
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE'},
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT'},
  { id: 'avalanche-2', name: 'Avalanche', symbol: 'AVAX'},
];

const INVESTOR_TYPES = [
  { id: 'hodler', name: 'HODLer', description: 'Long-term investor, buy and hold strategy'},
  { id: 'dayTrader', name: 'Day Trader', description: 'Active trading, short-term gains'},
  { id: 'nftCollector', name: 'NFT Collector', description: 'Focus on digital collectibles and art'},
];

const CONTENT_TYPES = [
  { id: 'news', name: 'Market News'},
  { id: 'charts', name: 'Price Charts'},
  { id: 'social', name: 'Social Trends'},
  { id: 'fun', name: 'Fun & Memes'},
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [investorType, setInvestorType] = useState<string>('');
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const toggleAsset = (assetId: string) => {
    setSelectedAssets((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
  };

  const toggleContentType = (typeId: string) => {
    setContentTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleNext = () => {
    setError('');

    if (step === 1 && selectedAssets.length === 0) {
      setError('Please select at least one crypto asset');
      return;
    }

    if (step === 2 && !investorType) {
      setError('Please select your investor type');
      return;
    }

    if (step === 3 && contentTypes.length === 0) {
      setError('Please select at least one content type');
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      const preferences: UserPreferences = {
        assets: selectedAssets,
        investorType: investorType as UserPreferences['investorType'],
        contentTypes: contentTypes as UserPreferences['contentTypes'],
      };

      const response = await saveOnboarding(preferences);
      updateUser(response.data);
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
          <span className="progress-text">Step {step} of 3</span>
        </div>

        {error && <div className="onboarding-error">{error}</div>}

        {step === 1 && (
          <div className="onboarding-step">
            <h2>What crypto assets are you interested in?</h2>
            <p>Select the cryptocurrencies you want to track</p>
            <div className="assets-grid">
              {CRYPTO_ASSETS.map((asset) => (
                <button
                  key={asset.id}
                  className={`asset-button ${selectedAssets.includes(asset.id) ? 'selected' : ''}`}
                  onClick={() => toggleAsset(asset.id)}
                >
                  
                  <span className="asset-symbol">{asset.symbol}</span>
                  <span className="asset-name">{asset.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step">
            <h2>What type of investor are you?</h2>
            <p>This helps us personalize your experience</p>
            <div className="investor-types">
              {INVESTOR_TYPES.map((type) => (
                <button
                  key={type.id}
                  className={`investor-button ${investorType === type.id ? 'selected' : ''}`}
                  onClick={() => setInvestorType(type.id)}
                >
                  
                  <div className="investor-content">
                    <span className="investor-name">{type.name}</span>
                    <span className="investor-description">{type.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-step">
            <h2>What content would you like to see?</h2>
            <p>Choose the types of content for your dashboard</p>
            <div className="content-types">
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  className={`content-button ${contentTypes.includes(type.id) ? 'selected' : ''}`}
                  onClick={() => toggleContentType(type.id)}
                >
                 
                  <span className="content-name">{type.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="onboarding-actions">
          {step > 1 && (
            <button className="back-button" onClick={handleBack}>
              Back
            </button>
          )}
          <button
            className="next-button"
            onClick={handleNext}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : step === 3 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
