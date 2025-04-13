import { BarChart3, Clock } from "lucide-react";
import FeedCard from "./FeedCard";

interface PollCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

const PollCard = ({ title, description, onClick }: PollCardProps) => {
  return (
    <FeedCard
      icon={<BarChart3 size={24} className="text-blue-600" />}
      type="Polls"
      title={title}
      description={description}
      mainContent={
        <>
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-3xl font-bold">42%</p>
              <p className="text-gray-600 text-sm">Current Turnout</p>
            </div>
            <div className="text-right">
              <p className="text-green-600 font-bold">+12%</p>
              <p className="text-gray-600 text-sm">vs. Last Election</p>
            </div>
          </div>
          
          <div className="mb-2">
            <p className="text-sm text-gray-600 mb-1">Wait Time</p>
            <p className="text-gray-700">Approximately 15 minutes</p>
          </div>
        </>
      }
      footerContent={
        <div className="flex items-center text-gray-700">
          <Clock size={16} className="mr-2" />
          <span>Busiest between 5-7pm</span>
        </div>
      }
      buttonText="View Live Map"
      onClick={onClick}
    />
  );
};

export default PollCard;