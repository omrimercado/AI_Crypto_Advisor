import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDashboard, submitFeedback, getUserFeedback } from '../api/dashboard';
import type { DashboardData, Feedback } from '../types';
import NewsSection from '../components/NewsSection';
import PricesSection from '../components/PricesSection';
import AiInsightSection from '../components/AiInsightSection';
import MemeSection from '../components/MemeSection';
import './Dashboard.css';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [userFeedback, setUserFeedback] = useState<Record<string, 'up' | 'down'>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const [dashboardResponse, feedbackResponse] = await Promise.all([
        getDashboard(),
        getUserFeedback(),
      ]);

      setDashboardData(dashboardResponse.data);

      const feedbackMap: Record<string, 'up' | 'down'> = {};
      feedbackResponse.data.forEach((fb: Feedback) => {
        feedbackMap[`${fb.section}-${fb.contentId}`] = fb.vote;
      });
      setUserFeedback(feedbackMap);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.onboardingCompleted) {
      navigate('/onboarding');
      return;
    }
    loadDashboard();
  }, [user, navigate, loadDashboard]);

  const handleVote = async (section: string, contentId: string, vote: 'up' | 'down') => {
    const key = `${section}-${contentId}`;
    const currentVote = userFeedback[key];

    if (currentVote === vote) {
      return;
    }

    try {
      await submitFeedback({ section, contentId, vote });
      setUserFeedback((prev) => ({
        ...prev,
        [key]: vote,
      }));
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your personalized dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={loadDashboard}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>AI Crypto Advisor</h1>
          <span className="welcome-text">Welcome, {user?.name}</span>
        </div>
        <div className="header-right">
          <button className="refresh-button" onClick={loadDashboard}>
            Refresh
          </button>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-grid">
          <NewsSection
            news={dashboardData?.news || []}
            onVote={handleVote}
            userFeedback={userFeedback}
          />

          <PricesSection
            prices={dashboardData?.prices || []}
            onVote={handleVote}
            userFeedback={userFeedback}
          />

          {dashboardData?.insight && (
            <AiInsightSection
              insight={dashboardData.insight}
              onVote={handleVote}
              userFeedback={userFeedback}
            />
          )}

          {dashboardData?.meme && (
            <MemeSection
              meme={dashboardData.meme}
              onVote={handleVote}
              userFeedback={userFeedback}
            />
          )}
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>Your preferences: {user?.preferences.assets.join(', ')}</p>
        <p>Investor type: {user?.preferences.investorType}</p>
      </footer>
    </div>
  );
}
