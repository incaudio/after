import axios from 'axios';
import { SearchResult } from '@shared/schema';

export async function searchItunes(query: string, maxResults: number = 20): Promise<SearchResult[]> {
  const url = 'https://itunes.apple.com/search';
  const response = await axios.get(url, {
    params: {
      term: query,
      media: 'music',
      limit: maxResults,
    },
  });
  return (response.data.results || []).map((item: any) => ({
    id: item.trackId ? String(item.trackId) : item.collectionId ? String(item.collectionId) : item.artistId ? String(item.artistId) : item.trackName,
    title: item.trackName || item.collectionName || item.artistName,
    artist: item.artistName,
    thumbnail: item.artworkUrl100 || '',
    duration: item.trackTimeMillis ? `${Math.floor(item.trackTimeMillis / 60000)}:${((item.trackTimeMillis % 60000) / 1000).toFixed(0).padStart(2, '0')}` : '',
    url: item.trackViewUrl || item.collectionViewUrl || item.artistViewUrl || '',
    platform: 'itunes',
    description: item.collectionName || '',
    publishedAt: item.releaseDate || '',
    viewCount: undefined,
    embedUrl: undefined,
    streamUrl: undefined,
    downloadUrl: undefined,
    aiScore: undefined,
  }));
}
