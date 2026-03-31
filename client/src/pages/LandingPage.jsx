import Navbar from '../components/common/Navbar';
import { Link } from 'react-router-dom';
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

            {/* AdSense Compliant Footer */}
            <footer className="bg-ink border-t-3 border-yellow py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        {/* Brand */}
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl">🛵</span>
                                <span className="font-bangers text-3xl text-yellow tracking-wider">RESTROON</span>
                            </div>
                            <p className="font-grotesk text-cream/70 text-sm leading-relaxed mb-4">
                                Empowering local cafes with modern order management, zero commissions, and direct customer relationships.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="font-bangers text-xl text-cream mb-4 tracking-wide">Company</h4>
                            <ul className="space-y-2">
                                <li><Link to="/about" className="font-grotesk text-sm text-cream/60 hover:text-yellow transition-colors">About Us</Link></li>
                                <li><Link to="/contact" className="font-grotesk text-sm text-cream/60 hover:text-yellow transition-colors">Contact Us</Link></li>
                                <li><Link to="/blog" className="font-grotesk text-sm text-cream/60 hover:text-yellow transition-colors">Our Blog</Link></li>
                                <li><Link to="/faq" className="font-grotesk text-sm text-cream/60 hover:text-yellow transition-colors">FAQ</Link></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="font-bangers text-xl text-cream mb-4 tracking-wide">Legal</h4>
                            <ul className="space-y-2">
                                <li><Link to="/privacy" className="font-grotesk text-sm text-cream/60 hover:text-yellow transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="font-grotesk text-sm text-cream/60 hover:text-yellow transition-colors">Terms & Conditions</Link></li>
                                <li><Link to="/refund-policy" className="font-grotesk text-sm text-cream/60 hover:text-yellow transition-colors">Refund Policy</Link></li>
                                <li><Link to="/cookie-policy" className="font-grotesk text-sm text-cream/60 hover:text-yellow transition-colors">Cookie Policy</Link></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="font-bangers text-xl text-cream mb-4 tracking-wide">Get in Touch</h4>
                            <ul className="space-y-2 font-grotesk text-sm text-cream/60">
                                <li>Email: ashwanikumar6064@gmail.com</li>
                                <li>Location: Punjab, India</li>
                                <li className="mt-4 italic">Response within 24 hours</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-cream/10 text-center flex flex-col items-center">
                        <p className="font-mono text-sm text-cream/50">
                            © 2026 Restroon. All rights reserved. Built with ❤️ for local cafes.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}