interface Stream {
  id: string;
  name: string;
  category: string;
  url: string;
  logo?: string;
  country?: string;
}

export const parseM3U = (content: string): Stream[] => {
  const lines = content.split('\n').map(line => line.trim());
  const streams: Stream[] = [];
  let currentStream: Partial<Stream> = {};
  let streamIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('#EXTINF:')) {
      const nameMatch = line.match(/,(.+)$/);
      const tvgNameMatch = line.match(/tvg-name="([^"]+)"/);
      const groupMatch = line.match(/group-title="([^"]+)"/);
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      const countryMatch = line.match(/tvg-country="([^"]+)"/);

      currentStream = {
        id: `stream-${++streamIndex}`,
        name: tvgNameMatch?.[1] || nameMatch?.[1] || 'Без названия',
        category: groupMatch?.[1] || 'Разное',
        logo: logoMatch?.[1],
        country: countryMatch?.[1],
      };
    } else if (line && !line.startsWith('#') && currentStream.name) {
      currentStream.url = line;
      streams.push(currentStream as Stream);
      currentStream = {};
    }
  }

  return streams;
};

export const fetchM3UFromUrl = async (url: string): Promise<Stream[]> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Не удалось загрузить плейлист');
    }
    const content = await response.text();
    return parseM3U(content);
  } catch (error) {
    console.error('Error fetching M3U:', error);
    throw error;
  }
};
