import React from "react";
import { Users, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CandidatePopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  summary: string;
  policies: string[];
  candidate1: {
    name: string;
    percentage: number;
  };
  candidate2: {
    name: string;
    percentage: number;
  };
}

const CandidatePopup = ({
  isOpen,
  onClose,
  title,
  description,
  summary,
  policies,
  candidate1,
  candidate2,
}: CandidatePopupProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 rounded-lg p-3">
                <Users size={24} className="text-blue-600" />
              </div>
              <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          <h3 className="text-gray-600 font-medium mb-4">{description}</h3>
          
          <div className="flex justify-between mb-6">
            <div className="text-center">
              <div className="inline-block w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                <span className="text-blue-600 font-bold">{candidate1.percentage}%</span>
              </div>
              <p className="text-gray-700">{candidate1.name}</p>
            </div>
            <div className="text-center">
              <div className="inline-block w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                <span className="text-gray-600 font-bold">{candidate2.percentage}%</span>
              </div>
              <p className="text-gray-700">{candidate2.name}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-2">Key Policy Differences</h3>
            <ul className="list-disc pl-5">
              {policies.map((policy, index) => (
                <li key={index} className="text-gray-700 mb-1">{policy}</li>
              ))}
            </ul>
          </div>
          
          <div className="mt-4">
            <h3 className="font-semibold text-lg mb-2">Summary</h3>
            <p className="text-gray-700">{summary}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CandidatePopup;