import { FileText, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface FeedCardProps {
  type: "Legislation" | "Candidates" | "Polls";
  title: string;
  subtitle?: string;
  description?: string;
  icon?: JSX.Element;
  tags?: string[];
  percentageData?: { left: string; right: string };
  biasAnalysis?: boolean;
  misinformationFlags?: number;
  actionLabel: string;
  onAction?: () => void;
}

const FeedCard = ({
  type,
  title,
  subtitle,
  description,
  icon,
  tags = [],
  percentageData,
  biasAnalysis = false,
  misinformationFlags,
  actionLabel,
  onAction
}: FeedCardProps) => {
  return (
    <Card className="border rounded-lg overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between mb-4">
          <div className="bg-blue-100 rounded-lg p-3 text-blue-600">
            {icon}
          </div>
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
            {type}
          </span>
        </div>

        <h3 className="text-xl font-bold mb-1">{title}</h3>
        {subtitle && <p className="text-gray-600 mb-4">{subtitle}</p>}
        {description && <p className="text-gray-700 mb-4">{description}</p>}

        {biasAnalysis && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Bias Analysis</p>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 via-gray-300 to-red-400"
                style={{ width: '100%' }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Left-leaning</span>
              <span>Neutral</span>
              <span>Right-leaning</span>
            </div>
          </div>
        )}

        {percentageData && (
          <div className="flex justify-between mb-4">
            <div className="text-center">
              <div className="inline-block w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                <span className="text-blue-600 font-bold">{percentageData.left}</span>
              </div>
              <p className="text-gray-700">Johnson</p>
            </div>
            <div className="text-center">
              <div className="inline-block w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                <span className="text-gray-600 font-bold">{percentageData.right}</span>
              </div>
              <p className="text-gray-700">Chen</p>
            </div>
          </div>
        )}

        {tags.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Key Policy Differences</p>
            <p className="text-gray-700">{tags.join(", ")}</p>
          </div>
        )}

        {misinformationFlags !== undefined && (
          <div className="flex items-center text-yellow-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <span>{misinformationFlags} misinformation flag{misinformationFlags > 1 ? 's' : ''}</span>
          </div>
        )}

        <Button variant="outline" className="w-full" onClick={onAction}>
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeedCard;