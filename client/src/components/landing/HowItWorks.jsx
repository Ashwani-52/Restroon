import { motion, AnimatePresence } from 'framer-motion';
import { useMobileCarousel } from '../../hooks/useMobileCarousel';

const steps = [
  { step: '01', icon: '📝', title: 'Register Your Cafe', desc: 'Sign up as a cafe owner, add your restaurant details, logo, and location.', color: 'bg-yellow' },
  { step: '02', icon: '✅', title: 'Get Approved',       desc: 'Our team reviews your registration and approves within 24 hours.',          color: 'bg-orange' },
  { step: '03', icon: '🍽️', title: 'Build Your Menu',   desc: 'Add your food items with photos, prices, and categories.',                  color: 'bg-red'    },
  { step: '04', icon: '🛵', title: 'Start Receiving Orders', desc: 'Go live! Customers discover your cafe and start ordering directly.',    color: 'bg-yellow' }
];

export default function HowItWorks() {
  const { activeIndex, next, goto, onTouchStart, onTouchEnd } = useMobileCarousel(steps.length);

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-ink relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-3 stripe-bg" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-10 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-bangers text-4xl md:text-7xl text-cream leading-tight">
            HOW IT <span className="text-yellow">WORKS</span> ⚡
          </h2>
          <p className="font-grotesk text-base md:text-xl text-cream/70 mt-4">
            Get your cafe online in 4 simple steps
          </p>
        </motion.div>

        {/* ── DESKTOP — grid ── */}
        <div className="hidden md:grid grid-cols-4 gap-6 relative">
          <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-1 border-t-3 border-dashed border-yellow/40 z-0" />
          {steps.map(({ step, icon, title, desc, color }, i) => (
            <motion.div
              key={step}
              className="relative z-10"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <div className={`w-16 h-16 ${color} rounded-full border-3 border-cream flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0_rgba(250,250,248,0.3)] font-bangers text-2xl text-ink`}>
                {icon}
              </div>
              <div className={`${color} rounded-2xl border-3 border-cream p-6 shadow-[6px_6px_0_rgba(250,250,248,0.2)] text-center`}>
                <div className="font-mono text-sm text-ink/60 mb-2">STEP {step}</div>
                <h3 className="font-bangers text-2xl text-ink mb-3">{title}</h3>
                <p className="font-grotesk text-sm text-ink/80 leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── MOBILE — fade carousel ── */}
        <div
          className="md:hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative h-56 overflow-hidden rounded-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                className={`${steps[activeIndex].color} absolute inset-0 rounded-2xl border-3 border-cream p-6 flex flex-col items-center text-center`}
                initial={{ opacity: 0, x: 40  }}
                animate={{ opacity: 1, x: 0   }}
                exit={{    opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-5xl mb-3">{steps[activeIndex].icon}</div>
                <div className="font-mono text-xs text-ink/60 mb-1">STEP {steps[activeIndex].step}</div>
                <h3 className="font-bangers text-2xl text-ink mb-2">{steps[activeIndex].title}</h3>
                <p className="font-grotesk text-sm text-ink/80">{steps[activeIndex].desc}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-3 mt-4">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => goto(i)}
                className={`rounded-full border-2 border-cream transition-all ${i === activeIndex ? 'w-6 h-3 bg-cream' : 'w-3 h-3 bg-cream/30'}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="mt-4 w-full py-3 bg-yellow text-ink font-bangers text-lg rounded-2xl border-3 border-cream shadow-[4px_4px_0_rgba(250,250,248,0.3)]"
          >
            {activeIndex === steps.length - 1 ? '🚀 Get Started!' : 'Next Step →'}
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-3 stripe-bg" />
    </section>
  );
}