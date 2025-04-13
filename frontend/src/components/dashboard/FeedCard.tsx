import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FeedCardProps {
  icon: ReactNode;
  type: string;
  title: string;
  description: string;
  mainContent: ReactNode;
  footerContent?: ReactNode;
  buttonText: string;
  onClick: () => void;
}

const FeedCard = ({
  icon,
  type,
  title,
  description,
  mainContent,
  footerContent,
  buttonText,
  onClick,
}: FeedCardProps) => {
  return (
    <Card 
      className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between mb-4">
          <div className="bg-blue-100 rounded-lg p-3">
            {icon}
          </div>
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
            {type}
          </span>
        </div>
        
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        
        {mainContent}
        
        {footerContent && (
          <div className="mb-4">
            {footerContent}
          </div>
        )}
        
        <Button variant="outline" className="w-full">
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeedCard;