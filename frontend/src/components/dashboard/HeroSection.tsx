import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  userName: string;
}

const HeroSection = ({ userName }: HeroSectionProps) => {
  return (
    <section className="bg-blue-600 text-white py-10 px-6 md:py-16">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome, {userName}!</h1>
        <p className="text-xl mb-6">Here's your personalized feed to help you prepare.</p>
      
      </div>
    </section>
  );
};

export default HeroSection;