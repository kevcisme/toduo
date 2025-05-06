import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
    { url: "https://hardcoresoftware.learningbyshipping.com/feed", title: "Hardcore Software" },
    { url: "https://cloudedjudgement.substack.com/feed", title: "Clouded Judgement" },
  ];

  const [activeTab, setActiveTab] = useState<string>(feeds[0].title!);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const proxy = "https://api.allorigins.win/raw?url=";
  const parser = new DOMParser();
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setItems([]);
    const fetchFeed = async () => {
      try {
        const feed = feeds.find((f) => f.title === activeTab)!;
        const res = await fetch(proxy + encodeURIComponent(feed.url));
        const text = await res.text();
        const doc = parser.parseFromString(text, "application/xml");
        const channelTitle = feed.title || doc.querySelector("channel > title")?.textContent;
        const rawItems = Array.from(doc.querySelectorAll("item")).slice(0, 5);
        const parsed = rawItems.map((item) => ({
          title: item.querySelector("title")?.textContent || "",
          link: item.querySelector("link")?.textContent || "",
          pubDate: item.querySelector("pubDate")?.textContent || undefined,
          feedTitle: channelTitle || undefined,
        }));
        if (isMounted) setItems(parsed);
      } catch (err) {
        console.error("Failed to fetch RSS feed", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchFeed();
    return () => { isMounted = false; };
  }, [activeTab]);

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">RSS Feeds</h3>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-2">
          {feeds.map((feed) => (
            <TabsTrigger key={feed.title} value={feed.title}>
              {feed.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {feeds.map((feed) => (
          <TabsContent key={feed.title} value={feed.title}>
            {loading ? (
              <div>Loading {feed.title}...</div>
            ) : (
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
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default RSSFeedWidget; 