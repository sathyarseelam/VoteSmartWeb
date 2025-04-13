import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TimelineCardProps {
  variant: "nextUp" | "urgent" | "upcoming";
  title: string;
  subtitle: string;
  date: string;
  daysAway: number;
  location?: string;
  actionRequired?: boolean;
}

const TimelineCard = ({
  variant,
  title,
  subtitle,
  date,
  daysAway,
  location,
  actionRequired,
}: TimelineCardProps) => {
  const getBadgeStyles = () => {
    switch (variant) {
      case "urgent":
        return "bg-red-100 text-red-600";
      default:
        return "bg-blue-100 text-blue-600";
    }
  };

  const getVariantLabel = () => {
    switch (variant) {
      case "nextUp":
        return "Next Up";
      case "urgent":
        return "Urgent";
      case "upcoming":
        return "Upcoming";
      default:
        return "";
    }
  };

  return (
    <Card className="border rounded-lg overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span
            className={`inline-block px-4 py-1 ${getBadgeStyles()} rounded-full text-sm font-medium`}
          >
            {getVariantLabel()}
          </span>
          <Calendar size={20} className="text-gray-500" />
        </div>
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className="text-gray-600 mb-4">{subtitle}</p>

        <div className="flex items-center text-gray-600 mb-2">
          <Clock size={16} className="mr-2" />
          <span>{`${date} (${daysAway} days away)`}</span>
        </div>
        {location && (
          <div className="flex items-center text-gray-600">
            <MapPin size={16} className="mr-2" />
            <span>{location}</span>
          </div>
        )}
        {actionRequired && (
          <div className="flex items-center text-red-600">
            <ArrowRight size={16} className="mr-2" />
            <span>Action Required</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimelineCard;