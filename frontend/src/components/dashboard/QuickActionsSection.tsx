import { MapPin, Users, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const QuickActionsSection = () => {
  const actions = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      title: "Verify Registration",
      color: "text-blue-600",
    },
    {
      icon: <MapPin size={24} />,
      title: "Find Polling Place",
      color: "text-red-500",
    },
    {
      icon: <Users size={24} />,
      title: "Compare Candidates",
      color: "text-blue-600",
    },
    {
      icon: <FileText size={24} />,
      title: "View Sample Ballot",
      color: "text-blue-400",
    }
  ];

  return (
    <section className="py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-red-500 mb-6">Quick Actions</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Card key={index} className="border rounded-lg hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className={`mb-4 ${action.color}`}>
                  {action.icon}
                </div>
                <h3 className="font-medium">{action.title}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickActionsSection;