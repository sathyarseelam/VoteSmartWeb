import { useState, useEffect } from "react";
import Header from "@/components/dashboard/Header";
import HeroSection from "@/components/dashboard/HeroSection";
import TimelineSection from "@/components/dashboard/TimelineSection";
// import FeedSection from "@/components/dashboard/FeedSection"; // We're replacing this with our custom filter component
import QuickActionsSection from "@/components/dashboard/QuickActionsSection";
import FloatingChatButton from "@/components/dashboard/FloatingChatButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/api/client"; // ← Axios helper
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

// DashboardFeedSection component handles filtering and conditional rendering of cards
const DashboardFeedSection = ({
  legislationData,
  candidateData,
  setIsLegislationPopupOpen,
  setIsCandidatePopupOpen,
}: {
  legislationData: any;
  candidateData: any;
  setIsLegislationPopupOpen: (open: boolean) => void;
  setIsCandidatePopupOpen: (open: boolean) => void;
}) => {
  // Create a state for the feed filter. Default is "Propositions"
  const [feedFilter, setFeedFilter] = useState("Propositions");

  return (
    <section className="py-8 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header Section for Filters */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-700">Your Personalized Feed</h2>
          <div className="flex space-x-2 bg-white rounded-full p-1 border">
            {["Propositions", "Candidates"].map((filter) => (
              <button
                key={filter}
                onClick={() => setFeedFilter(filter)}
                className={`px-4 py-1 rounded-full text-sm ${
                  feedFilter === filter
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Grid container for cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {feedFilter === "Propositions" && (
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
                    Propositions
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-1">
                  {legislationData.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {legislationData.description}
                </p>
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
          )}

          {feedFilter === "Candidates" && (
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
                <h3 className="text-xl font-bold mb-1">
                  {candidateData.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {candidateData.description}
                </p>
                <div className="flex justify-between mb-4">
                  <div className="text-center">
                    <div className="inline-block w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                      <span className="text-blue-600 font-bold">
                        {candidateData.candidate1.percentage}%
                      </span>
                    </div>
                    <p className="text-gray-700">
                      {candidateData.candidate1.name}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="inline-block w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                      <span className="text-gray-600 font-bold">
                        {candidateData.candidate2.percentage}%
                      </span>
                    </div>
                    <p className="text-gray-700">
                      {candidateData.candidate2.name}
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Key Policy Differences
                  </p>
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
                  <span>Donald Trump leading in recent polls</span>
                </div>
                <Button variant="outline" className="w-full">
                  Compare Candidates
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const Dashboard = () => {
  const [userName, setUserName] = useState<string | null>(null);


  useEffect(() => {
    // attach listener once
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserName(null);
        return;
      }

      try {
        const { data } = await api.get(`/users/${user.uid}`);
        setUserName(data.first_name ?? user.displayName ?? "Friend");
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUserName("");
      }
    });

    // detach on unmount / hot‑reload
    return () => unsubscribe();
  }, [auth]);   
  // State for popups
  const [isLegislationPopupOpen, setIsLegislationPopupOpen] = useState(false);
  const [isCandidatePopupOpen, setIsCandidatePopupOpen] = useState(false);
  const [isPollPopupOpen, setIsPollPopupOpen] = useState(false);
  
  // Data for popups
  const legislationData = {
    title: "Prop 35: Make permanent a tax on managed health care plans",
    description: "This proposition makes healthcare taxes go to Medi-Cal, helping low-income Californians.  Doctors want this money to boost their pay for treating Medi-Cal patients.",
    summary:
      "Proposition 35 would require California to use revenue from a tax on health care plans to fund Medi-Cal, the state’s public insurance program for low-income residents and people with disabilities. The money would support services like mental health care, emergency services, family planning, and prescription drugs, and prevent lawmakers from redirecting those funds for other purposes. Over the next four years, it’s expected to generate over $35 billion. Supporters—including doctors, hospitals, and clinics—argue it will increase payments to Medi-Cal providers and improve access to care for the more than 14 million Californians who rely on the program. Critics point out that it limits the governor’s flexibility to allocate funds elsewhere, potentially impacting other state priorities.",
    bias: "neutral" as "left" | "neutral" | "right",
  };

  const candidateData = {
    title: "Donald Trump vs. Kamala Harris",
    description: "2024 U.S. Presidential Election",
    summary: 
  "This high-stakes presidential race pits former President Donald Trump (R) against Vice President Kamala Harris (D). Harris is campaigning on protecting reproductive rights, climate action, and strengthening voting access. Trump’s platform centers around economic deregulation, tough immigration policies, and America-first trade priorities. Polls show a tight race, with each candidate holding strong support in key battleground states. The outcome is expected to have a significant impact on the future direction of national policy.",
    policies: [
  "Healthcare - Harris supports expanding the Affordable Care Act and lowering prescription drug costs, while Trump backs repealing ACA provisions and promoting private healthcare competition",
  "Climate Change - Harris advocates for major green energy investments and rejoining international climate agreements, while Trump focuses on deregulating the energy sector and supporting fossil fuel jobs",
  "Voting Access - Harris supports expanding mail-in voting and protecting voter rights, while Trump emphasizes stricter voter ID laws and reducing mail-in ballot usage"
    ],
    candidate1: {
      name: "Donald Trump",
      percentage: 55,
    },
    candidate2: {
      name: "Kamala Harris",
      percentage: 45,
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
      
      <DashboardFeedSection
        legislationData={legislationData}
        candidateData={candidateData}
        setIsLegislationPopupOpen={setIsLegislationPopupOpen}
        setIsCandidatePopupOpen={setIsCandidatePopupOpen}
      />
          
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
  );
};

export default Dashboard;