import { Button } from "@/components/ui/button";

const FloatingChatButton = () => {
  return (
    <div className="fixed bottom-4 right-4">
      <Button className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </Button>
    </div>
  );
};

export default FloatingChatButton;