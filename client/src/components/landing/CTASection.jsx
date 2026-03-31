import { motion } from 'framer-motion';
import { CartoonButton } from '../ui/CartoonButton';
import { Link } from 'react-router-dom';

export default function CTASection() {
    return (
        <section className="py-24 retro-grid relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-ink rounded-3xl border-4 border-ink p-12 shadow-[12px_12px_0_#FF6B35] relative overflow-hidden"
                >
                    {/* Stripe Accent */}
                    <div className="absolute top-0 left-0 right-0 h-3 stripe-bg" />

                    <div className="text-7xl mb-6">🛵</div>
                    <h2 className="font-bangers text-5xl md:text-7xl text-cream mb-4">
                        READY TO GO <span className="text-yellow">ONLINE?</span>
                    </h2>
                    <p className="font-grotesk text-xl text-cream/70 mb-8 max-w-2xl mx-auto">
                        Join 500+ cafes. 4% commission. Your restaurant online in minutes.
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link to="/register?role=owner">
                            <CartoonButton label="🏪 Register Your Cafe Free" color="bg-yellow" size="lg" />
                        </Link>
                        <Link to="/register">
                            <CartoonButton label="🍽️ Order as Customer" color="bg-orange" size="lg" />
                        </Link>
                    </div>

                    {/* Bottom Stripe */}
                    <div className="absolute bottom-0 left-0 right-0 h-3 stripe-bg" />
                </motion.div>
            </div>
        </section>
    );
}