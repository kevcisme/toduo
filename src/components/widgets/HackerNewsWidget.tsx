import React, { useState, useEffect } from "react";

interface Story {
  id: number;
  title: string;
  url: string;
}

const HackerNewsWidget: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopStories = async () => {
      try {
        const res = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
        const ids: number[] = await res.json();
        const top10 = ids.slice(0, 10);
        const storyPromises = top10.map(async (id) => {
          const storyRes = await fetch(
            `https://hacker-news.firebaseio.com/v0/item/${id}.json`
          );
          return await storyRes.json();
        });
        const fetchedStories = await Promise.all(storyPromises);
        setStories(fetchedStories);
      } catch (err) {
        console.error("Failed to fetch Hacker News stories", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopStories();
  }, []);

  if (loading) {
    return <div>Loading Hacker News...</div>;
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Top Hacker News Stories</h3>
      <ul className="space-y-2 list-disc list-inside">
        {stories.map((story) => (
          <li key={story.id}>
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {story.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HackerNewsWidget; 