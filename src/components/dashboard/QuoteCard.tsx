import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

interface QuoteCardProps {
  quote: string;
  author: string;
  className?: string;
}

const QuoteCard = ({ quote, author, className = "" }: QuoteCardProps) => {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-primary/10 rounded-full">
            <Quote className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Quote of the Day</h3>
            <p className="text-muted-foreground italic mb-2">"{quote}"</p>
            <p className="text-sm text-right">— {author}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteCard;
