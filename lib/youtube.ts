const API_KEY = 'AIzaSyDA1n8683_NaCPq8ngS0JjaE_cDueijYqU';

export async function fetchTrendingMusic() {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&videoCategoryId=10&maxResults=20&key=${API_KEY}`
    );
    const data = await response.json();
    
    return data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
    }));
  } catch (error) {
    console.error('Error fetching trending music:', error);
    return [];
  }
}

export async function searchMusic(query: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&videoCategoryId=10&maxResults=20&key=${API_KEY}`
    );
    const data = await response.json();
    
    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
    }));
  } catch (error) {
    console.error('Error searching music:', error);
    return [];
  }
}