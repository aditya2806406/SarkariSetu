import Background3D from "../components/landing/Background3D";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";

export default function LandingPage() {
  return (
    <div className="relative">
      <Background3D />
      <Hero />
      <Features />
    </div>
  );
}