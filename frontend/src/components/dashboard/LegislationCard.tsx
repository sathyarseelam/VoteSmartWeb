import { FileText } from "lucide-react";
import FeedCard from "./FeedCard";

interface LegislationCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

const LegislationCard = ({ title, description, onClick }: LegislationCardProps) => {
  return (
    <FeedCard
      icon={<FileText size={24} className="text-blue-600" />}
      type="Legislation"
      title={title}
      description={description}
      mainContent={
        <>
          <p className="text-gray-700 mb-4">
            This bill authorizes funds for highways, public transportation, and other infrastructure projects.
          </p>
          
          <div className="mb-4">
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
        </>
      }
      footerContent={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
      }
      buttonText="View AI Summary"
      onClick={onClick}
    />
  );
};

export default LegislationCard;