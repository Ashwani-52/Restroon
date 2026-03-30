import { motion, AnimatePresence } from 'framer-motion';
import { useMobileCarousel } from '../../hooks/useMobileCarousel';

const features = [
  {
    icon : '🏪', title: 'Your Own Online Store',
    desc : 'Create your cafe page with menu, photos, and custom branding. No technical skills needed.',
    color: 'bg-yellow', delay: 0
  },
  {
    icon : '📦', title: 'Live Order Management',
    desc : 'Accept or reject orders in real-time. See status, customer details, and manage delivery.',
    color: 'bg-orange', delay: 0.1
  },
  {
    icon : '💰', title: 'Low Commission',
    desc : 'Keep 96% of your revenue. Just a 4% platform fee. Your money stays yours.',
    color: 'bg-red',    delay: 0.2
  },
  {
    icon : '📊', title: 'Revenue Analytics',
    desc : 'Track daily, weekly, monthly revenue. Know your best-selling items and peak hours.',
    color: 'bg-yellow', delay: 0.3
  },
  {
    icon : '🎨', title: 'Custom Menu Builder',
    desc : 'Add items, set prices, upload photos, toggle availability. Full control anytime.',
    color: 'bg-orange', delay: 0.4
  },
  {
    icon : '🔐', title: 'Bank-Level Security',
    desc : 'Your data is protected with JWT auth, encrypted passwords, and secure payments.',
    color: 'bg-red',    delay: 0.5
  }
];

export default function FeaturesSection() {
  const { activeIndex, next, goto, onTouchStart, onTouchEnd } = useMobileCarousel(features.length);

  return (
    <section id="features" className="py-16 md:py-24 retro-grid relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <motion.div
          className="text-center mb-10 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-block bg-ink px-6 py-2 rounded-full mb-4">
            <span className="font-bangers text-yellow text-base md:text-xl tracking-wider">WHY RESTROON?</span>
          </div>
          <h2 className="font-bangers text-4xl md:text-7xl text-ink leading-tight">
            EVERYTHING YOUR<br />
            <span className="text-orange">CAFE NEEDS</span> 🍕
          </h2>
          <p className="font-grotesk text-base md:text-xl text-ink/70 mt-4 max-w-2xl mx-auto">
            Stop paying 30-40% to others. Own your digital presence.
          </p>
        </motion.div>

        {/* ── DESKTOP — normal grid ── */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <motion.div
              key={f.title}
              className={`${f.color} rounded-2xl p-6 border-3 border-ink shadow-[6px_6px_0_#1A1A1A] hover:-translate-y-2 hover:shadow-[8px_8px_0_#1A1A1A] transition-all duration-200 cursor-pointer`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: f.delay }}
            >
              <div className="text-5xl mb-4">{f.icon}</div>
              <h3 className="font-bangers text-2xl tracking-wide text-ink mb-3">{f.title}</h3>
              <p className="font-grotesk text-ink/80 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* ── MOBILE — fade carousel ── */}
        <div
          className="md:hidden relative"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative h-64 overflow-hidden rounded-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                className={`${features[activeIndex].color} absolute inset-0 rounded-2xl p-6 border-3 border-ink shadow-[6px_6px_0_#1A1A1A] flex flex-col justify-between`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1   }}
                exit={{    opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <div className="text-5xl mb-3">{features[activeIndex].icon}</div>
                  <h3 className="font-bangers text-2xl text-ink mb-2">{features[activeIndex].title}</h3>
                  <p className="font-grotesk text-sm text-ink/80 leading-relaxed">{features[activeIndex].desc}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="font-mono text-xs text-ink/50">{activeIndex + 1} / {features.length}</span>
                  <span className="font-mono text-xs text-ink/50">swipe or tap →</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots + Next button */}
          <div className="flex items-center justify-center gap-3 mt-4">
            {features.map((_, i) => (
              <button
                key={i}
                onClick={() => goto(i)}
                className={`rounded-full border-2 border-ink transition-all ${i === activeIndex ? 'w-6 h-3 bg-ink' : 'w-3 h-3 bg-ink/30'}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="mt-4 w-full py-3 bg-ink text-yellow font-bangers text-lg rounded-2xl border-3 border-ink shadow-[4px_4px_0_#FF6B35]"
          >
            Next Feature →
          </button>
        </div>
      </div>
    </section>
  );
}