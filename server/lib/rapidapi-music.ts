import axios from 'axios';

export interface RapidApiTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  thumbnail: string;
  duration: string;
  url: string;
  streamUrl?: string;
  downloadUrl?: string;
  publishedAt?: string;
  viewCount?: number;
  description?: string;
  platform: string;
}

// Example: Deezer API via RapidAPI (replace with your chosen API details)
export async function searchRapidApiMusic(query: string, maxResults: number = 20): Promise<RapidApiTrack[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error('RAPIDAPI_KEY not set');

  // Example endpoint for Deezer via RapidAPI
  const url = 'https://deezerdevs-deezer.p.rapidapi.com/search';
  const headers = {
    'X-RapidAPI-Key': apiKey,
    'X-RapidAPI-Host': 'deezerdevs-deezer.p.rapidapi.com',
  };

  const response = await axios.get(url, {
    params: { q: query },
    headers,
  });

  return (response.data.data || []).slice(0, maxResults).map((track: any) => ({
    id: track.id.toString(),
    title: track.title,
    artist: track.artist.name,
    album: track.album?.title,
    thumbnail: track.album?.cover_medium || '',
    duration: `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`,
    url: track.link,
    streamUrl: track.preview, // 30s preview
    downloadUrl: track.link, // Deezer does not provide direct download, but you can use the link
    publishedAt: undefined,
    viewCount: undefined,
    description: track.album?.title,
    platform: 'deezer',
  }));
}
