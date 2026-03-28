import { motion } from 'framer-motion';

const steps = [
    {
        step: '01',
        icon: '📝',
        title: 'Register Your Cafe',
        desc: 'Sign up as a cafe owner, add your restaurant details, logo, and location.',
        color: 'bg-yellow'
    },
    {
        step: '02',
        icon: '✅',
        title: 'Get Approved',
        desc: 'Our team reviews your registration and approves within 24 hours.',
        color: 'bg-orange'
    },
    {
        step: '03',
        icon: '🍽️',
        title: 'Build Your Menu',
        desc: 'Add your food items with photos, prices, and categories.',
        color: 'bg-red'
    },
    {
        step: '04',
        icon: '🛵',
        title: 'Start Receiving Orders',
        desc: 'Go live! Customers discover your cafe and start ordering directly.',
        color: 'bg-yellow'
    }
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-ink relative overflow-hidden">

            {/* Stripe Top */}
            <div className="absolute top-0 left-0 right-0 h-3 stripe-bg" />

            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="font-bangers text-5xl md:text-7xl text-cream leading-tight">
                        HOW IT <span className="text-yellow">WORKS</span> ⚡
                    </h2>
                    <p className="font-grotesk text-xl text-cream/70 mt-4">
                        Get your cafe online in 4 simple steps
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                    {/* Connecting Line */}
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
                            {/* Step Number Circle */}
                            <div className={`
                w-16 h-16 ${color} rounded-full border-3 border-cream
                flex items-center justify-center mx-auto mb-4
                shadow-[4px_4px_0_rgba(250,250,248,0.3)]
                font-bangers text-2xl text-ink
              `}>
                                {icon}
                            </div>

                            {/* Card */}
                            <div className={`${color} rounded-2xl border-3 border-cream p-6 shadow-[6px_6px_0_rgba(250,250,248,0.2)] text-center`}>
                                <div className="font-mono text-sm text-ink/60 mb-2">STEP {step}</div>
                                <h3 className="font-bangers text-2xl text-ink mb-3">{title}</h3>
                                <p className="font-grotesk text-sm text-ink/80 leading-relaxed">{desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Stripe Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-3 stripe-bg" />
        </section>
    );
}