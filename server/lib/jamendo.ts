import axios from 'axios';

const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID || 'ecc95144';

export interface JamendoTrack {
  id: string;
  name: string;
  artist_name: string;
  album_name: string;
  duration: number;
  image: string;
  audio: string;
  audiodownload: string;
  shareurl: string;
  releasedate: string;
  popularity: number;
}

export interface SearchResult {
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
  platform: string;
  downloadUrl?: string;
  aiScore?: number;
}

export async function searchJamendo(query: string, maxResults: number = 20): Promise<SearchResult[]> {
  try {
    const response = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
      params: {
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
        namesearch: query,
        limit: maxResults * 2,
        include: 'musicinfo',
        audioformat: 'mp32',
        imagesize: 300,
      }
    });

    const tracks: JamendoTrack[] = response.data.results || [];
    
    const results = tracks.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      thumbnail: track.image || `https://api.jamendo.com/v3.0/albums/artwork/?id=${track.id}&size=300`,
      duration: formatDuration(track.duration),
      url: track.shareurl,
      embedUrl: track.audio,
      publishedAt: track.releasedate,
      viewCount: Math.floor(track.popularity * 1000),
      description: `${track.album_name || 'Single'} by ${track.artist_name}`,
      platform: 'jamendo',
      downloadUrl: track.audiodownload,
      aiScore: calculateAIScore(track, query),
    }));

    return results
      .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
      .slice(0, maxResults);
  } catch (error) {
    console.error('Jamendo search error:', error);
    throw new Error('Failed to search Jamendo');
  }
}

function calculateAIScore(track: JamendoTrack, query: string): number {
  let score = track.popularity || 0;
  
  const queryLower = query.toLowerCase();
  const titleLower = track.name.toLowerCase();
  const artistLower = track.artist_name.toLowerCase();
  
  if (titleLower.includes(queryLower)) score += 50;
  if (artistLower.includes(queryLower)) score += 30;
  
  if (titleLower === queryLower) score += 100;
  if (artistLower === queryLower) score += 80;
  
  const titleWords = titleLower.split(' ');
  const queryWords = queryLower.split(' ');
  const matchingWords = queryWords.filter(word => titleWords.includes(word)).length;
  score += matchingWords * 10;
  
  return score;
}

export async function getTrendingTracks(limit: number = 20): Promise<SearchResult[]> {
  try {
    const response = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
      params: {
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
        order: 'popularity_total',
        limit,
        include: 'musicinfo',
        audioformat: 'mp32',
        imagesize: 300,
      }
    });

    const tracks: JamendoTrack[] = response.data.results || [];
    
    return tracks.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artist_name,
      thumbnail: track.image,
      duration: formatDuration(track.duration),
      url: track.shareurl,
      embedUrl: track.audio,
      publishedAt: track.releasedate,
      viewCount: Math.floor(track.popularity * 1000),
      description: `${track.album_name || 'Single'} by ${track.artist_name}`,
      platform: 'jamendo',
      downloadUrl: track.audiodownload,
    }));
  } catch (error) {
    console.error('Jamendo trending error:', error);
    return [];
  }
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
