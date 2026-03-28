import { motion } from 'framer-motion';

const features = [
    {
        icon: '🏪',
        title: 'Your Own Online Store',
        desc: 'Create your cafe page with menu, photos, and custom branding. No technical skills needed.',
        color: 'bg-yellow',
        shadow: '#FF6B35',
        delay: 0
    },
    {
        icon: '📦',
        title: 'Live Order Management',
        desc: 'Accept or reject orders in real-time. See status, customer details, and manage delivery.',
        color: 'bg-orange',
        shadow: '#FF3B30',
        delay: 0.1
    },
    {
        icon: '💰',
        title: 'Low Commission',
        desc: 'Keep 96% of your revenue. Just a 4% platform fee. Your money stays yours.',
        color: 'bg-red',
        shadow: '#1A1A1A',
        delay: 0.2
    },
    {
        icon: '📊',
        title: 'Revenue Analytics',
        desc: 'Track daily, weekly, monthly revenue. Know your best-selling items and peak hours.',
        color: 'bg-yellow',
        shadow: '#FF3B30',
        delay: 0.3
    },
    {
        icon: '🎨',
        title: 'Custom Menu Builder',
        desc: 'Add items, set prices, upload photos, toggle availability. Full control anytime.',
        color: 'bg-orange',
        shadow: '#1A1A1A',
        delay: 0.4
    },
    {
        icon: '🔐',
        title: 'Bank-Level Security',
        desc: 'Your data is protected with JWT auth, encrypted passwords, and secure payments.',
        color: 'bg-red',
        shadow: '#FF6B35',
        delay: 0.5
    }
];

function FeatureCard({ icon, title, desc, color, shadow, delay }) {
    return (
        <motion.div
            className={`
        relative ${color} rounded-2xl p-6 border-3 border-ink
        shadow-[6px_6px_0_#1A1A1A] overflow-hidden group cursor-pointer
        transition-all duration-200
        hover:-translate-y-2 hover:shadow-[8px_8px_0_#1A1A1A]
      `}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
        >
            {/* Icon */}
            <div className="text-5xl mb-4">{icon}</div>

            {/* Title */}
            <h3 className="font-bangers text-2xl tracking-wide text-ink mb-3">{title}</h3>

            {/* Desc */}
            <p className="font-grotesk text-ink/80 leading-relaxed">{desc}</p>

            {/* Hover card lift effect */}
            <div
                className="absolute bottom-0 left-4 right-4 h-1 rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: shadow }}
            />
        </motion.div>
    );
}

export default function FeaturesSection() {
    return (
        <section id="features" className="py-24 retro-grid relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">

                {/* Section Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="inline-block bg-ink px-6 py-2 rounded-full mb-4">
                        <span className="font-bangers text-yellow text-xl tracking-wider">WHY RESTROON?</span>
                    </div>
                    <h2 className="font-bangers text-5xl md:text-7xl text-ink leading-tight">
                        EVERYTHING YOUR<br />
                        <span className="text-orange">CAFE NEEDS</span> 🍕
                    </h2>
                    <p className="font-grotesk text-xl text-ink/70 mt-4 max-w-2xl mx-auto">
                        Stop paying 30-40% to others. Own your digital presence.
                    </p>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f) => (
                        <FeatureCard key={f.title} {...f} />
                    ))}
                </div>
            </div>

            {/* Decorative Elements */}
            <motion.div
                className="absolute -right-10 top-20 text-8xl opacity-20 pointer-events-none"
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
            >
                ⭐
            </motion.div>
        </section>
    );
}