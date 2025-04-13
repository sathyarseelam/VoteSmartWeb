import React from "react";
import { FileText, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LegislationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  summary: string;
  bias: "left" | "neutral" | "right";
}

const LegislationPopup = ({
  isOpen,
  onClose,
  title,
  description,
  summary,
  bias,
}: LegislationPopupProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 rounded-lg p-3">
                <FileText size={24} className="text-blue-600" />
              </div>
              <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`${
                  bias === "left" ? "bg-blue-100 text-blue-600" : "bg-white"
                } px-3 py-1 rounded-full text-sm`}
              >
                Left
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${
                  bias === "neutral" ? "bg-blue-100 text-blue-600" : "bg-white"
                } px-3 py-1 rounded-full text-sm`}
              >
                Neutral
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`${
                  bias === "right" ? "bg-blue-100 text-blue-600" : "bg-white"
                } px-3 py-1 rounded-full text-sm`}
              >
                Right
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          <h3 className="text-gray-600 font-medium mb-2">{description}</h3>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Bias Analysis</p>
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
          
          <div className="mt-4">
            <h3 className="font-semibold text-lg mb-2">Summary</h3>
            <p className="text-gray-700">{summary}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LegislationPopup;