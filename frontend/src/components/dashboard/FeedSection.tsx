import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import LegislationCard from "./LegislationCard";
import CandidateCard from "./CandidateCard";
import PollCard from "./PollCard";
import LegislationPopup from "@/components/LegislationPopup";
import CandidatePopup from "@/components/CandidatePopup";

// Mock data for popups
const legislationData = {
  title: "Infrastructure Bill H.R. 3684",
  description: "Recently passed in the House",
  summary: "This bill authorizes funds for federal aid for highways, highway safety programs, and transit programs. It includes provisions related to climate change, addressing resiliency and environmental impacts on highway systems and ensuring infrastructure is built to withstand future challenges. The bill received bipartisan support but has faced criticism from fiscal conservatives concerned about its impact on the federal deficit. Support for this bill generally aligns with broader policy goals related to infrastructure investment and climate action. The Congressional Budget Office estimates this will add approximately $256 billion to projected deficits over the next ten years.",
  bias: "neutral" as const,
};

const candidateData = {
  title: "Sarah Johnson vs. Michael Chen",
  description: "Senate Race Comparison",
  summary: "This closely watched Senate race features Sarah Johnson (D), the current state Attorney General, against Michael Chen (R), a successful business owner and former state representative. Johnson is campaigning on healthcare reform, climate policy, and expanding educational opportunities. Chen's platform focuses on economic growth, tax reduction, and border security. Recent polling shows Johnson maintaining a lead, though the gap has narrowed in recent weeks. The race is considered pivotal for determining Senate control.",
  policies: [
    "Healthcare - Johnson supports expanding public options while Chen advocates for market-based solutions",
    "Climate Change - Johnson backs aggressive carbon reduction targets while Chen focuses on balanced approach with economic considerations",
    "Education - Johnson wants increased federal funding for public schools while Chen emphasizes school choice and local control"
  ],
  candidate1: {
    name: "Johnson",
    percentage: 65
  },
  candidate2: {
    name: "Chen",
    percentage: 35
  }
};

const pollData = {
  title: "Downtown Polling Station",
  description: "Live Turnout Data",
  summary: "Current voter turnout is tracking 12% higher than the last comparable election cycle. Wait times are averaging approximately 15 minutes, with the busiest period expected between 5-7pm. The polling station is fully staffed with no reported issues. Accessibility accommodations are available for all voters. Real-time updates will continue throughout the day."
};

const FeedSection = () => {
  const [feedFilter, setFeedFilter] = useState("All");
  
  // State for popups
  const [isLegislationPopupOpen, setIsLegislationPopupOpen] = useState(false);
  const [isCandidatePopupOpen, setIsCandidatePopupOpen] = useState(false);
  const [isPollPopupOpen, setIsPollPopupOpen] = useState(false);
  
  return (
    <section className="py-8 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-700">Your Personalized Feed</h2>
          
          <div className="flex space-x-2 bg-white rounded-full p-1 border">
            {["All", "Legislation", "Candidates", "Polls"].map((filter) => (
              <button
                key={filter}
                className={`px-4 py-1 rounded-full text-sm ${
                  feedFilter === filter
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setFeedFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LegislationCard 
            title={legislationData.title} 
            description={legislationData.description} 
            onClick={() => setIsLegislationPopupOpen(true)}
          />
          
          <CandidateCard
            title={candidateData.title}
            description={candidateData.description}
            candidate1={candidateData.candidate1}
            candidate2={candidateData.candidate2}
            onClick={() => setIsCandidatePopupOpen(true)}
          />
          
          <PollCard
            title={pollData.title}
            description={pollData.description}
            onClick={() => setIsPollPopupOpen(true)}
          />
        </div>
        
        <div className="flex justify-center mt-8">
          <Button variant="outline" className="flex items-center">
            Load More <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
      </div>

      {/* Popups */}
      <LegislationPopup
        isOpen={isLegislationPopupOpen}
        onClose={() => setIsLegislationPopupOpen(false)}
        title={legislationData.title}
        description={legislationData.description}
        summary={legislationData.summary}
        bias={legislationData.bias}
      />

      <CandidatePopup
        isOpen={isCandidatePopupOpen}
        onClose={() => setIsCandidatePopupOpen(false)}
        title={candidateData.title}
        description={candidateData.description}
        summary={candidateData.summary}
        policies={candidateData.policies}
        candidate1={candidateData.candidate1}
        candidate2={candidateData.candidate2}
      />

      {/* Using LegislationPopup as a base for the PollPopup since they're similar */}
      <LegislationPopup
        isOpen={isPollPopupOpen}
        onClose={() => setIsPollPopupOpen(false)}
        title={pollData.title}
        description={pollData.description}
        summary={pollData.summary}
        bias="neutral"
      />
    </section>
  );
};

export default FeedSection;