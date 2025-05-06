import React, { useEffect, useState } from "react";

interface Feed {
  url: string;
  title?: string;
}

interface FeedItem {
  title: string;
  link: string;
  pubDate?: string;
  feedTitle?: string;
}

const RSSFeedWidget: React.FC = () => {
  const feeds: Feed[] = [
    { url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml", title: "NYTimes Tech" },
    { url: "https://www.reddit.com/r/javascript/.rss", title: "r/javascript" },
  ];

  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const parser = new DOMParser();
    async function fetchFeeds() {
      try {
        const allItems: FeedItem[] = [];
        for (const feed of feeds) {
          const res = await fetch(feed.url);
          const text = await res.text();
          const doc = parser.parseFromString(text, "application/xml");
          const channelTitle = feed.title || doc.querySelector("channel > title")?.textContent;
          const feedItems = Array.from(doc.querySelectorAll("item")).slice(0, 5);
          feedItems.forEach((item) => {
            allItems.push({
              title: item.querySelector("title")?.textContent || "",
              link: item.querySelector("link")?.textContent || "",
              pubDate: item.querySelector("pubDate")?.textContent || undefined,
              feedTitle: channelTitle || undefined,
            });
          });
        }
        setItems(allItems);
      } catch (err) {
        console.error("Failed to fetch RSS feeds", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeeds();
  }, []);

  if (loading) {
    return <div>Loading RSS feeds...</div>;
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">RSS Feeds</h3>
      <ul className="space-y-2 list-disc list-inside">
        {items.map((item, idx) => (
          <li key={idx}>
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {item.title}
            </a>
            {item.feedTitle && (
              <span className="text-sm text-muted-foreground ml-2">
                ({item.feedTitle})
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RSSFeedWidget; 