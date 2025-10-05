// Reference: youtube blueprint integration
import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings?.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('YouTube connection not available - X_REPLIT_TOKEN not found');
  }

  if (!hostname) {
    throw new Error('YouTube connection not available - REPLIT_CONNECTORS_HOSTNAME not found');
  }

  try {
    const response = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=youtube',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch YouTube connection: ${response.status}`);
    }

    const data = await response.json();
    connectionSettings = data.items?.[0];

    if (!connectionSettings) {
      throw new Error('YouTube connection not configured. Please set up the YouTube connector in Replit.');
    }

    const accessToken = connectionSettings.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

    if (!accessToken) {
      throw new Error('YouTube access token not available. Please reconnect the YouTube connector.');
    }
    
    return accessToken;
  } catch (error) {
    console.error('YouTube connection error:', error);
    throw error;
  }
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableYouTubeClient() {
  const accessToken = await getAccessToken();
  
  // Create an OAuth2 client and set the credentials
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });
  
  return google.youtube({ 
    version: 'v3', 
    auth: oauth2Client 
  });
}

export interface YouTubeSearchResult {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  url: string;
  embedUrl: string;
  publishedAt: string;
  viewCount: number;
  description: string;
}

export async function searchYouTube(query: string, maxResults: number = 20): Promise<YouTubeSearchResult[]> {
  try {
    const youtube = await getUncachableYouTubeClient();
    
    // Search for music videos only
    const searchResponse = await youtube.search.list({
      part: ['snippet'],
      q: query,
      type: ['video'],
      videoCategoryId: '10', // Music category
      maxResults,
      order: 'relevance',
    });

    if (!searchResponse.data.items) {
      return [];
    }

    const videoIds = searchResponse.data.items
      .map(item => item.id?.videoId)
      .filter(Boolean) as string[];

    if (videoIds.length === 0) {
      return [];
    }

    // Get video details for duration and statistics
    const videosResponse = await youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: videoIds,
    });

    const results: YouTubeSearchResult[] = [];

    for (const video of videosResponse.data.items || []) {
      if (!video.id) continue;

      const duration = parseDuration(video.contentDetails?.duration || 'PT0S');
      const snippet = video.snippet;
      
      results.push({
        id: video.id,
        title: snippet?.title || 'Unknown',
        artist: snippet?.channelTitle || 'Unknown Artist',
        thumbnail: snippet?.thumbnails?.high?.url || snippet?.thumbnails?.default?.url || '',
        duration,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        embedUrl: `https://www.youtube.com/embed/${video.id}`,
        publishedAt: snippet?.publishedAt || new Date().toISOString(),
        viewCount: parseInt(video.statistics?.viewCount || '0'),
        description: snippet?.description || '',
      });
    }

    return results;
  } catch (error) {
    console.error('YouTube search error:', error);
    throw new Error('Failed to search YouTube');
  }
}

function parseDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
