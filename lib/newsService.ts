import { Linking } from 'react-native';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  time: string;
  url: string;
  source: string;
}

// RSS to JSON proxy services (free alternatives)
const RSS_FEEDS = [
  {
    name: 'Formula1.com',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.formula1.com/en/latest/all.xml',
    source: 'Formula1.com'
  },
  {
    name: 'Motorsport.com F1',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.motorsport.com/rss/f1/news/',
    source: 'Motorsport.com'
  }
];

class NewsService {
  private static instance: NewsService;
  private cache: NewsItem[] = [];
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  static getInstance(): NewsService {
    if (!NewsService.instance) {
      NewsService.instance = new NewsService();
    }
    return NewsService.instance;
  }

  private formatTimeAgo(dateString: string): string {
    const now = new Date();
    const publishDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  }

  private cleanHtml(text: string): string {
    // Remove HTML tags and decode entities
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  private async fetchFromRSS(feedConfig: typeof RSS_FEEDS[0]): Promise<NewsItem[]> {
    try {
      const response = await fetch(feedConfig.url);
      const data = await response.json();

      if (data.status !== 'ok' || !data.items) {
        throw new Error(`Failed to fetch from ${feedConfig.name}`);
      }

      return data.items.slice(0, 5).map((item: any, index: number) => ({
        id: `${feedConfig.source}-${index}-${Date.now()}`,
        title: this.cleanHtml(item.title || 'Untitled'),
        summary: this.cleanHtml(item.description || item.content || 'No summary available').substring(0, 120) + '...',
        time: this.formatTimeAgo(item.pubDate || item.isoDate || new Date().toISOString()),
        url: item.link || item.url || '#',
        source: feedConfig.source
      }));
    } catch (error) {
      console.warn(`Failed to fetch news from ${feedConfig.name}:`, error);
      return [];
    }
  }

  async fetchLatestNews(): Promise<NewsItem[]> {
    const now = Date.now();
    
    // Return cached data if still fresh
    if (this.cache.length > 0 && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cache;
    }

    try {
      // Fetch from multiple sources
      const newsPromises = RSS_FEEDS.map(feed => this.fetchFromRSS(feed));
      const newsResults = await Promise.allSettled(newsPromises);
      
      const allNews: NewsItem[] = [];
      newsResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          allNews.push(...result.value);
        }
      });

      // Sort by recency and take top 6
      const sortedNews = allNews
        .sort((a, b) => {
          // Simple sorting by time string (this is approximate)
          const aTime = a.time.includes('m') ? parseInt(a.time) : 
                       a.time.includes('h') ? parseInt(a.time) * 60 : 
                       parseInt(a.time) * 1440;
          const bTime = b.time.includes('m') ? parseInt(b.time) : 
                       b.time.includes('h') ? parseInt(b.time) * 60 : 
                       parseInt(b.time) * 1440;
          return aTime - bTime;
        })
        .slice(0, 6);

      // Fallback news if no RSS feeds work
      if (sortedNews.length === 0) {
        return this.getFallbackNews();
      }

      this.cache = sortedNews;
      this.lastFetch = now;
      return sortedNews;

    } catch (error) {
      console.error('Error fetching news:', error);
      return this.getFallbackNews();
    }
  }

  private getFallbackNews(): NewsItem[] {
    return [
      {
        id: 'fallback-1',
        title: 'F1 2025 Season Updates',
        summary: 'Stay tuned for the latest Formula 1 news and updates throughout the season.',
        time: '1h ago',
        url: 'https://www.formula1.com',
        source: 'F1 App'
      },
      {
        id: 'fallback-2',
        title: 'Championship Battle Continues',
        summary: 'The fight for the drivers and constructors championships intensifies.',
        time: '3h ago',
        url: 'https://www.formula1.com',
        source: 'F1 App'
      }
    ];
  }

  async openNewsArticle(url: string): Promise<void> {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported && url !== '#') {
        await Linking.openURL(url);
      } else {
        console.warn('Cannot open URL:', url);
      }
    } catch (error) {
      console.error('Error opening news article:', error);
    }
  }

  clearCache(): void {
    this.cache = [];
    this.lastFetch = 0;
  }
}

export default NewsService;
