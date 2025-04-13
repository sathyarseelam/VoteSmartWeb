import { useState } from "react";
import Header from "@/components/dashboard/Header";
import HeroSection from "@/components/dashboard/HeroSection";
import TimelineSection from "@/components/dashboard/TimelineSection";
import FeedSection from "@/components/dashboard/FeedSection";
import QuickActionsSection from "@/components/dashboard/QuickActionsSection";
import FloatingChatButton from "@/components/dashboard/FloatingChatButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const userName = "Alex";
  
  // State for popups
  const [isLegislationPopupOpen, setIsLegislationPopupOpen] = useState(false);
  const [isCandidatePopupOpen, setIsCandidatePopupOpen] = useState(false);
  const [isPollPopupOpen, setIsPollPopupOpen] = useState(false);
  
  // Data for popups
  const legislationData = {
    title: "Infrastructure Bill H.R. 3684",
    description: "Recently passed in the House",
    summary:
      "This bill authorizes funds for federal aid for highways, highway safety programs, and transit programs. It includes provisions related to climate change, addressing resiliency and environmental impacts on highway systems and ensuring infrastructure is built to withstand future challenges. The bill received bipartisan support but has faced criticism from fiscal conservatives concerned about its impact on the federal deficit. Support for this bill generally aligns with broader policy goals related to infrastructure investment and climate action. The Congressional Budget Office estimates this will add approximately $256 billion to projected deficits over the next ten years.",
    bias: "neutral" as "left" | "neutral" | "right",
  };

  const candidateData = {
    title: "Sarah Johnson vs. Michael Chen",
    description: "Senate Race Comparison",
    summary:
      "This closely watched Senate race features Sarah Johnson (D), the current state Attorney General, against Michael Chen (R), a successful business owner and former state representative. Johnson is campaigning on healthcare reform, climate policy, and expanding educational opportunities. Chen's platform focuses on economic growth, tax reduction, and border security. Recent polling shows Johnson maintaining a lead, though the gap has narrowed in recent weeks. The race is considered pivotal for determining Senate control.",
    policies: [
      "Healthcare - Johnson supports expanding public options while Chen advocates for market-based solutions",
      "Climate Change - Johnson backs aggressive carbon reduction targets while Chen focuses on balanced approach with economic considerations",
      "Education - Johnson wants increased federal funding for public schools while Chen emphasizes school choice and local control",
    ],
    candidate1: {
      name: "Johnson",
      percentage: 65,
    },
    candidate2: {
      name: "Chen",
      percentage: 35,
    },
  };

  const pollData = {
    title: "Downtown Polling Station",
    description: "Live Turnout Data",
    summary:
      "Current voter turnout is tracking 12% higher than the last comparable election cycle. Wait times are averaging approximately 15 minutes, with the busiest period expected between 5-7pm. The polling station is fully staffed with no reported issues. Accessibility accommodations are available for all voters. Real-time updates will continue throughout the day.",
  };
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection userName={userName} />
      <TimelineSection />
      
      {/* Feed Section with clickable cards */}
      <section className="py-8 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-700">Your Personalized Feed</h2>
            <div className="flex space-x-2 bg-white rounded-full p-1 border">
              {["All", "Legislation", "Candidates"].map((filter) => (
                <button
                  key={filter}
                  className={`px-4 py-1 rounded-full text-sm ${
                    filter === "All"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Legislation Card */}
            <div 
              className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow bg-white"
              onClick={() => setIsLegislationPopupOpen(true)}
            >
              <div className="p-6">
                <div className="flex justify-between mb-4">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <FileText size={24} className="text-blue-600" />
                  </div>
                  <span className="inline-flex justify-center items-center px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                    Legislation
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-1">{legislationData.title}</h3>
                <p className="text-gray-600 mb-4">{legislationData.description}</p>
                <p className="text-gray-700 mb-4">
                  This bill authorizes funds for highways, public transportation, and other infrastructure projects.
                </p>
                <div className="mb-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 via-gray-300 to-red-400"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Left-leaning</span>
                    <span>Neutral</span>
                    <span>Right-leaning</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-6">
                  View Summary
                </Button>
              </div>
            </div>
            
            {/* Candidate Card */}
            <div 
              className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow bg-white"
              onClick={() => setIsCandidatePopupOpen(true)}
            >
              <div className="p-6">
                <div className="flex justify-between mb-4">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <Users size={24} className="text-blue-600" />
                  </div>
                  <span className="inline-flex justify-center items-center px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                    Candidates
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-1">{candidateData.title}</h3>
                <p className="text-gray-600 mb-4">{candidateData.description}</p>
                <div className="flex justify-between mb-4">
                  <div className="text-center">
                    <div className="inline-block w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                      <span className="text-blue-600 font-bold">{candidateData.candidate1.percentage}%</span>
                    </div>
                    <p className="text-gray-700">{candidateData.candidate1.name}</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-block w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                      <span className="text-gray-600 font-bold">{candidateData.candidate2.percentage}%</span>
                    </div>
                    <p className="text-gray-700">{candidateData.candidate2.name}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Key Policy Differences</p>
                  <p className="text-gray-700">
                    Healthcare, Climate Change, Education
                  </p>
                </div>
                <div className="flex items-center text-gray-700 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 text-blue-600"
                  >
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                    <polyline points="16 7 22 7 22 13"></polyline>
                  </svg>
                  <span>Johnson leading in recent polls</span>
                </div>
                <Button variant="outline" className="w-full">
                  Compare Candidates
                </Button>
              </div>
            </div>
          </div>{" "}
          {/* End of grid container */}
          
          <QuickActionsSection />
          <FloatingChatButton />
          
          {/* Legislation Popup */}
          <Dialog
            open={isLegislationPopupOpen}
            onOpenChange={(open) => !open && setIsLegislationPopupOpen(false)}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <FileText size={24} className="text-blue-600" />
                    </div>
                    <DialogTitle className="text-xl font-bold">
                      {legislationData.title}
                    </DialogTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`${
                        legislationData.bias === "left"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-white"
                      } px-3 py-1 rounded-full text-sm`}
                    >
                      Left
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`${
                        legislationData.bias === "neutral"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-white"
                      } px-3 py-1 rounded-full text-sm`}
                    >
                      Neutral
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`${
                        legislationData.bias === "right"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-white"
                      } px-3 py-1 rounded-full text-sm`}
                    >
                      Right
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              <div className="mt-4">
                <h3 className="text-gray-600 font-medium mb-2">
                  {legislationData.description}
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Bias Analysis</p>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 via-gray-300 to-red-400"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Left-leaning</span>
                    <span>Neutral</span>
                    <span>Right-leaning</span>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-lg mb-2">Summary</h3>
                  <p className="text-gray-700">{legislationData.summary}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Candidate Popup */}
          <Dialog
            open={isCandidatePopupOpen}
            onOpenChange={(open) => !open && setIsCandidatePopupOpen(false)}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <Users size={24} className="text-blue-600" />
                    </div>
                    <DialogTitle className="text-xl font-bold">
                      {candidateData.title}
                    </DialogTitle>
                  </div>
                </div>
              </DialogHeader>
              <div className="mt-4">
                <h3 className="text-gray-600 font-medium mb-4">
                  {candidateData.description}
                </h3>
                <div className="flex justify-between mb-6">
                  <div className="text-center">
                    <div className="inline-block w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                      <span className="text-blue-600 font-bold">
                        {candidateData.candidate1.percentage}%
                      </span>
                    </div>
                    <p className="text-gray-700">{candidateData.candidate1.name}</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-block w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                      <span className="text-gray-600 font-bold">
                        {candidateData.candidate2.percentage}%
                      </span>
                    </div>
                    <p className="text-gray-700">{candidateData.candidate2.name}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">
                    Key Policy Differences
                  </h3>
                  <ul className="list-disc pl-5">
                    {candidateData.policies.map((policy, index) => (
                      <li key={index} className="text-gray-700 mb-1">
                        {policy}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-lg mb-2">Summary</h3>
                  <p className="text-gray-700">{candidateData.summary}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Poll Popup */}
          <Dialog
            open={isPollPopupOpen}
            onOpenChange={(open) => !open && setIsPollPopupOpen(false)}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <BarChart3 size={24} className="text-blue-600" />
                    </div>
                    <DialogTitle className="text-xl font-bold">
                      {pollData.title}
                    </DialogTitle>
                  </div>
                </div>
              </DialogHeader>
              <div className="mt-4">
                <h3 className="text-gray-600 font-medium mb-2">
                  {pollData.description}
                </h3>
                <div className="mt-4">
                  <h3 className="font-semibold text-lg mb-2">Summary</h3>
                  <p className="text-gray-700">{pollData.summary}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
