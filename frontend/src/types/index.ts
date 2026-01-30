export interface User {
  _id: string;
  email: string;
  name: string;
  preferences: UserPreferences;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  assets: string[];
  investorType: 'hodler' | 'dayTrader' | 'nftCollector' | null;
  contentTypes: ('news' | 'charts' | 'social' | 'fun')[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface DashboardData {
  news: NewsItem[];
  prices: CoinPrice[];
  insight: AiInsight;
  meme: Meme;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  kind: string;
}

export interface CoinPrice {
  id: string;
  name: string;
  symbol: string;
  currentPrice: number | null;
  priceChange24h: number | null;
  image: string | null;
}

export interface AiInsight {
  id: string;
  content: string;
  generatedAt: string;
}

export interface Meme {
  id: string;
  title: string;
  imageUrl: string;
  altText?: string;
}

export interface Feedback {
  _id: string;
  userId: string;
  section: 'news' | 'prices' | 'aiInsight' | 'meme';
  contentId: string;
  vote: 'up' | 'down';
  createdAt: string;
}
