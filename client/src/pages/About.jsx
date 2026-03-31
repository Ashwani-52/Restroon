import React from 'react';
import { motion } from 'framer-motion';
import { ComicText } from '../components/ui/ComicText';

const About = () => {
  return (
    <div className="relative min-h-screen bg-cream retro-grid overflow-hidden pt-28 pb-20">
      {/* ── Stripe Banner Top ── */}
      <div className="absolute top-0 left-0 right-0 h-3 stripe-bg z-10" />

      {/* ── Floating Stars ── */}
      {['⭐', '✨', '💥', '🌟', '⚡'].map((star, i) => (
        <motion.div
            key={i}
            className="absolute text-3xl pointer-events-none z-0 hidden md:block"
            style={{
                top: `${15 + i * 15}%`,
                left: i % 2 === 0 ? `${5 + i * 5}%` : undefined,
                right: i % 2 !== 0 ? `${5 + i * 5}%` : undefined,
            }}
            animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
        >
            {star}
        </motion.div>
      ))}

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-24 text-center mt-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <ComicText fontSize={5}>WE ARE RESTROON</ComicText>
        </motion.div>
        
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="bg-white border-3 border-ink shadow-[8px_8px_0_#1A1A1A] rounded-2xl p-8 max-w-3xl mx-auto transform -rotate-1"
        >
          <p className="text-xl md:text-2xl font-grotesk text-ink font-bold leading-relaxed">
            A high-tech restaurant discovery and ordering platform designed to help local cafes thrive without giving away 30% of their revenue.
          </p>
        </motion.div>
      </section>

      {/* Why We Exist */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-yellow border-3 border-ink shadow-[8px_8px_0_#FF3B30] rounded-3xl p-8 md:p-10 transform rotate-1"
          >
            <h2 className="font-bangers text-4xl text-ink tracking-wide mb-6">Our Mission</h2>
            <p className="font-grotesk text-lg text-ink leading-relaxed font-bold mb-6">
              For too long, local independent cafes have been squeezed by massive delivery aggregators charging exorbitant commissions. Small businesses were forced to raise menu prices, hurting their customers, just to stay afloat.
            </p>
            <p className="font-grotesk text-lg text-ink leading-relaxed font-bold">
              Restroon was built to change this. We provide the same high-end technology—QR ordering, rapid pickup, direct delivery links—while focusing strictly on transparency and local empowerment.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: '💸', title: "Zero Commission", desc: "Restaurants keep 100% of their earnings." },
              { icon: '🏪', title: "Local First", desc: "Built specifically to uplift local cafes and stalls." },
              { icon: '🍕', title: "Transparent Menus", desc: "No artificially inflated online prices." },
              { icon: '🤝', title: "Direct Contact", desc: "Customers connect directly with cafes." },
            ].map((val, idx) => (
              <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-6 rounded-2xl border-3 border-ink shadow-[6px_6px_0_#1A1A1A] hover:-translate-y-2 hover:shadow-[10px_10px_0_#1A1A1A] transition-all flex flex-col items-center text-center group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{val.icon}</div>
                <h3 className="font-bangers text-xl text-ink tracking-wide mb-2">{val.title}</h3>
                <p className="font-grotesk text-sm font-semibold text-ink/70">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder & Tech Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-bangers text-5xl text-ink tracking-wide mb-8">The Story <span className="text-red drop-shadow-[2px_2px_0_#1A1A1A]">Behind</span> Restroon</h2>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-ink p-10 md:p-14 rounded-3xl border-3 border-ink shadow-[10px_10px_0_#FFD23F] text-cream relative"
        >
          <div className="absolute top-4 left-4 text-4xl opacity-50">✨</div>
          <div className="absolute bottom-4 right-4 text-4xl opacity-50">🚀</div>
          <p className="font-grotesk text-lg leading-relaxed font-medium mb-6 relative z-10">
            Restroon was founded in India by <strong className="text-yellow text-xl">Ashwani Kumar</strong>, who noticed a widening gap between what customers paid online and what restaurants actually earned. 
          </p>
          <p className="font-grotesk text-lg leading-relaxed font-medium mb-10 relative z-10">
            Powered by modern technologies like <strong className="text-orange text-xl">React, Node.js, and MongoDB</strong>, Restroon offers an incredibly fast and resilient platform capable of handling peak mealtime traffic securely. The future vision is to onboard millions of small-scale food vendors, digitizing their menus entirely free of cost.
          </p>
          <div className="inline-flex items-center gap-3 bg-red text-cream px-8 py-4 border-3 border-ink shadow-[4px_4px_0_#1A1A1A] rounded-full font-bangers tracking-wider text-2xl relative z-10 hover:-translate-y-1 hover:shadow-[6px_6px_0_#1A1A1A] transition-all">
            <span className="animate-pulse">❤️</span> BUILT IN INDIA
          </div>
        </motion.div>
      </section>

      {/* ── Stripe Banner Bottom ── */}
      <div className="absolute bottom-6 left-0 right-0 h-3 stripe-bg" />
    </div>
  );
};

export default About;
