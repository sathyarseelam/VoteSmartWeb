import { Users, TrendingUp } from "lucide-react";
import FeedCard from "./FeedCard";

interface CandidateCardProps {
  title: string;
  description: string;
  candidate1: {
    name: string;
    percentage: number;
  };
  candidate2: {
    name: string;
    percentage: number;
  };
  onClick: () => void;
}

const CandidateCard = ({ title, description, candidate1, candidate2, onClick }: CandidateCardProps) => {
  return (
    <FeedCard
      icon={<Users size={24} className="text-blue-600" />}
      type="Candidates"
      title={title}
      description={description}
      mainContent={
        <>
          <div className="flex justify-between mb-4">
            <div className="text-center">
              <div className="inline-block w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                <span className="text-blue-600 font-bold">{candidate1.percentage}%</span>
              </div>
              <p className="text-gray-700">{candidate1.name}</p>
            </div>
            <div className="text-center">
              <div className="inline-block w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                <span className="text-gray-600 font-bold">{candidate2.percentage}%</span>
              </div>
              <p className="text-gray-700">{candidate2.name}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Key Policy Differences</p>
            <p className="text-gray-700">Healthcare, Climate Change, Education</p>
          </div>
        </>
      }
      footerContent={
        <div className="flex items-center text-gray-700">
          <TrendingUp size={16} className="mr-2 text-blue-600" />
          <span>Johnson leading in recent polls</span>
        </div>
      }
      buttonText="Compare Candidates"
      onClick={onClick}
    />
  );
};

export default CandidateCard;