import { useState } from 'react';
import { motion } from 'framer-motion';
import { CartoonButton } from '../ui/CartoonButton';
import { Link } from 'react-router-dom';

const plans = [
    {
        name: 'Starter',
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: ['1 Cafe', '50 Orders/month', 'Basic Menu', 'Email Support'],
        color: 'bg-yellow',
        cta: 'Start Free',
        isPopular: false
    },
    {
        name: 'Growth',
        monthlyPrice: 999,
        yearlyPrice: 799,
        features: ['1 Cafe', 'Unlimited Orders', 'Advanced Menu + Photos', 'Revenue Analytics', 'Priority Support'],
        color: 'bg-orange',
        cta: 'Get Growth',
        isPopular: true
    },
    {
        name: 'Pro',
        monthlyPrice: 2499,
        yearlyPrice: 1999,
        features: ['3 Cafes', 'Unlimited Orders', 'Everything in Growth', 'Custom Domain', 'Dedicated Support'],
        color: 'bg-red',
        cta: 'Go Pro',
        isPopular: false
    }
];

export default function PricingSection() {
    const [isYearly, setIsYearly] = useState(false);

    return (
        <section id="pricing" className="py-24 bg-ink relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-3 stripe-bg" />

            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="font-bangers text-5xl md:text-7xl text-cream">
                        SIMPLE <span className="text-yellow">PRICING</span> 💰
                    </h2>
                    <p className="font-grotesk text-xl text-cream/70 mt-4">
                        No hidden fees. Cancel anytime.
                    </p>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <span className={`font-grotesk font-semibold ${!isYearly ? 'text-cream' : 'text-cream/50'}`}>Monthly</span>
                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className="w-14 h-7 bg-yellow border-3 border-cream rounded-full relative transition-all"
                        >
                            <motion.div
                                className="absolute top-0.5 w-5 h-5 bg-ink rounded-full"
                                animate={{ left: isYearly ? 28 : 3 }}
                                transition={{ type: 'spring', stiffness: 500 }}
                            />
                        </button>
                        <span className={`font-grotesk font-semibold ${isYearly ? 'text-cream' : 'text-cream/50'}`}>
                            Yearly <span className="text-yellow text-sm">(Save 20%)</span>
                        </span>
                    </div>
                </motion.div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map(({ name, monthlyPrice, yearlyPrice, features, color, cta, isPopular }, i) => (
                        <motion.div
                            key={name}
                            className={`
                ${color} rounded-2xl border-3 border-cream p-8
                shadow-[8px_8px_0_rgba(250,250,248,0.2)]
                relative transition-all duration-200
                ${isPopular ? 'scale-105 shadow-[10px_10px_0_#FFD23F]' : ''}
                hover:-translate-y-2
              `}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            {isPopular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow border-3 border-ink px-4 py-1 rounded-full">
                                    <span className="font-bangers text-ink text-lg">⭐ POPULAR</span>
                                </div>
                            )}

                            <h3 className="font-bangers text-3xl text-ink mb-2">{name}</h3>
                            <div className="font-bangers text-5xl text-ink mb-1">
                                ₹{isYearly ? yearlyPrice : monthlyPrice}
                                <span className="text-xl text-ink/60">/{isYearly ? 'yr' : 'mo'}</span>
                            </div>
                            {monthlyPrice === 0 && <div className="font-grotesk text-sm text-ink/70 mb-4">Forever Free</div>}

                            <div className="my-6 border-t-2 border-ink/20" />

                            <ul className="space-y-3 mb-8">
                                {features.map(f => (
                                    <li key={f} className="flex items-center gap-2 font-grotesk text-ink">
                                        <span className="w-5 h-5 bg-ink text-cream rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <Link to={monthlyPrice === 0 ? '/register?role=owner' : '/register?role=owner&plan=' + name.toLowerCase()}>
                                <CartoonButton label={cta} color="bg-cream" size="md" />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-3 stripe-bg" />
        </section>
    );
}