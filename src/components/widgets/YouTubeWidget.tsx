import React, { useEffect, useState } from "react";

interface Channel {
  id: string;
  title?: string;
}

interface Video {
  id: string;
  title: string;
  url: string;
}

const YouTubeWidget: React.FC = () => {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  const channels: Channel[] = [
    { id: "UCXuqSBlHAE6Xw-yeJA0Tunw", title: "Linus Tech Tips" },
    { id: "UCR-DXc1voovS8nhAvccRZhg", title: "Jeff Geerling" },
  ];

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      if (!apiKey) {
        console.error("Missing YouTube API key");
        setLoading(false);
        return;
      }
      try {
        const allVideos: Video[] = [];
        for (const channel of channels) {
          const res = await fetch(
            `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channel.id}&part=snippet&order=date&maxResults=5`
          );
          const data = await res.json();
          data.items.forEach((item: any) => {
            allVideos.push({
              id: item.id.videoId,
              title: item.snippet.title,
              url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            });
          });
        }
        setVideos(allVideos);
      } catch (err) {
        console.error("Failed to fetch YouTube videos", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, [apiKey]);

  if (loading) {
    return <div>Loading YouTube videos...</div>;
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Latest YouTube Videos</h3>
      <ul className="space-y-2 list-disc list-inside">
        {videos.map((video) => (
          <li key={video.id}>
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {video.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default YouTubeWidget; 