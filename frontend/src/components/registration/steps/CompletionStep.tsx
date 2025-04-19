import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRegistration } from "@/contexts/RegistrationContext"; // ← grab data
import { api } from "@/api/client";                            // ← call backend
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

const CompletionStep = () => {
  const { data } = useRegistration();   // all answers
  const navigate = useNavigate();

  const finish = async () => {
    const { confirmPassword,policyInterests, ...all } = data;
    const { password, ...profile } = all;
    // POSTs to backends `/auth/register` endpoint
    const userObj = await createUserWithEmailAndPassword(auth, profile.email, password);
    
    const res = await api.post("/auth/register", { profile, password, uid: userObj.user.uid });
    localStorage.setItem("uid", res.data.uid);   // remember me for later calls
    navigate("/dashboard");
  };
  return (
    <div className="text-center border border-blue-200 rounded-3xl p-10">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="text-blue-600" size={30} />
      </div>
      
      <h2 className="text-3xl font-bold mb-4 text-purple-600">You're all set!</h2>
      <p className="text-gray-600 mb-4">Your VoteSmart account is created</p>
      
      <div className="mb-8 max-w-md mx-auto">
        <p className="text-center text-gray-800">
          Your dashboard is now customized to match your interests. Explore personalized policy updates, candidate comparisons, and election updates.
        </p>
      </div>
      
      <Button
        onClick={finish}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-6 mx-auto flex items-center gap-2"
      >
        Create account & go to dashboard
        <ArrowRight size={18} />
      </Button>
    </div>
  );
};

export default CompletionStep;