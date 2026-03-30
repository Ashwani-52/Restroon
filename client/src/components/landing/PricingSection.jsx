import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CartoonButton } from '../ui/CartoonButton';
import { useMobileCarousel } from '../../hooks/useMobileCarousel';

const plans = [
  {
    name: 'Starter', monthlyPrice: 0,    yearlyPrice: 0,
    features: ['1 Cafe', '50 Orders/month', 'Basic Menu', 'Email Support'],
    color: 'bg-yellow', cta: 'Start Free', isPopular: false
  },
  {
    name: 'Growth',  monthlyPrice: 999,  yearlyPrice: 799,
    features: ['1 Cafe', 'Unlimited Orders', 'Advanced Menu + Photos', 'Revenue Analytics', 'Priority Support'],
    color: 'bg-orange', cta: 'Get Growth', isPopular: true
  },
  {
    name: 'Pro',     monthlyPrice: 2499, yearlyPrice: 1999,
    features: ['3 Cafes', 'Unlimited Orders', 'Everything in Growth', 'Custom Domain', 'Dedicated Support'],
    color: 'bg-red', cta: 'Go Pro', isPopular: false
  }
];

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const { activeIndex, next, goto, onTouchStart, onTouchEnd } = useMobileCarousel(plans.length);

  const PlanCard = ({ plan, i, isMobile = false }) => (
    <div className={`
      ${plan.color} rounded-2xl border-3 p-6 relative
      ${isMobile ? 'border-cream' : 'border-cream shadow-[8px_8px_0_rgba(250,250,248,0.2)] hover:-translate-y-2 transition-all'}
      ${plan.isPopular && !isMobile ? 'scale-105' : ''}
    `}>
      {plan.isPopular && (
        <div className={`absolute ${isMobile ? '-top-4' : '-top-5'} left-1/2 -translate-x-1/2 bg-ink text-yellow border-3 border-ink rounded-full px-4 py-1`}>
          <span className="font-bangers text-base md:text-lg">⭐ POPULAR</span>
        </div>
      )}
      <h3 className="font-bangers text-2xl md:text-3xl text-ink mb-1">{plan.name}</h3>
      <div className="font-bangers text-4xl md:text-5xl text-ink mb-1">
        {isYearly ? plan.yearlyPrice : plan.monthlyPrice === 0 ? 'FREE' : `₹${plan.monthlyPrice}`}
      </div>
      {plan.monthlyPrice > 0 && (
        <p className="font-mono text-xs text-ink/60 mb-3">/{isYearly ? 'yr' : 'mo'}</p>
      )}
      <div className="border-t-2 border-ink/20 my-3" />
      <ul className="space-y-2 mb-4">
        {plan.features.map(f => (
          <li key={f} className="flex items-center gap-2 font-grotesk text-sm text-ink">
            <span className="w-4 h-4 bg-ink text-cream rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <Link to={`/register?role=owner&plan=${plan.name.toLowerCase()}`}>
        <CartoonButton label={plan.cta} color="bg-cream" size="md" />
      </Link>
    </div>
  );

  return (
    <section id="pricing" className="py-16 md:py-24 bg-ink relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-3 stripe-bg" />

      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <motion.div
          className="text-center mb-10 md:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-bangers text-4xl md:text-7xl text-cream">
            SIMPLE <span className="text-yellow">PRICING</span> 💰
          </h2>
          <p className="font-grotesk text-base md:text-xl text-cream/70 mt-4">
            No hidden fees. Cancel anytime.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className={`font-grotesk font-semibold text-sm md:text-base ${!isYearly ? 'text-cream' : 'text-cream/50'}`}>Monthly</span>
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
            <span className={`font-grotesk font-semibold text-sm md:text-base ${isYearly ? 'text-cream' : 'text-cream/50'}`}>
              Yearly <span className="text-yellow text-xs">(Save 20%)</span>
            </span>
          </div>
        </motion.div>

        {/* ── DESKTOP — grid ── */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {plans.map((plan, i) => <PlanCard key={plan.name} plan={plan} i={i} />)}
        </div>

        {/* ── MOBILE — fade carousel ── */}
        <div
          className="md:hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative overflow-hidden" style={{ minHeight: 380 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeIndex}-${isYearly}`}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1    }}
                exit={{    opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <PlanCard plan={plans[activeIndex]} i={activeIndex} isMobile />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-3 mt-6">
            {plans.map((_, i) => (
              <button
                key={i}
                onClick={() => goto(i)}
                className={`rounded-full border-2 border-cream transition-all ${i === activeIndex ? 'w-6 h-3 bg-cream' : 'w-3 h-3 bg-cream/30'}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="mt-4 w-full py-3 bg-yellow text-ink font-bangers text-lg rounded-2xl border-3 border-cream"
          >
            {plans[activeIndex].isPopular ? '⭐ Best Value!' : 'Next Plan →'}
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-3 stripe-bg" />
    </section>
  );
}