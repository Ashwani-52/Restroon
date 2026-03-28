import Navbar from '../components/common/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorks from '../components/landing/HowItWorks';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import PricingSection from '../components/landing/PricingSection';
import CTASection from '../components/landing/CTASection';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-cream overflow-x-hidden">
            <Navbar />
            <HeroSection />
            <FeaturesSection />
            <HowItWorks />
            <TestimonialsSection />
            <PricingSection />
            <CTASection />

            {/* Footer */}
            <footer className="bg-ink border-t-3 border-yellow py-8">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🛵</span>
                        <span className="font-bangers text-2xl text-yellow tracking-wider">RESTROON</span>
                    </div>
                    <p className="font-mono text-sm text-cream/50">
                        © 2026 Restroon. Built with ❤️ for local cafes.
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="font-grotesk text-sm text-cream/60 hover:text-yellow transition-colors">Privacy</a>
                        <a href="#" className="font-grotesk text-sm text-cream/60 hover:text-yellow transition-colors">Terms</a>
                        <a href="#" className="font-grotesk text-sm text-cream/60 hover:text-yellow transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}