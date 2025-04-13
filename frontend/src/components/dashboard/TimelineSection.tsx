
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import TimelineCard from "./TimelineCard";

const TimelineSection = () => {
  return (
    <section className="py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-600">Your Election Timeline</h2>
          <Link to="/timeline" className="text-gray-700 flex items-center">
            View All <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TimelineCard
            variant="nextUp"
            title="Primary Election"
            subtitle="State and Local Offices"
            date="June 02, 2026"
            daysAway={32}
          />
          
          <TimelineCard
            variant="urgent"
            title="Voter Registration Deadline"
            subtitle="For Primary Election"
            date="May 18, 2026"
            daysAway={6}
            actionRequired={true}
          />
          
          <TimelineCard
            variant="upcoming"
            title="General Election"
            subtitle="Federal, State and Local"
            date="November 4, 2028"
            daysAway={173}
            location="Central High School, 123 Main St"
          />
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;