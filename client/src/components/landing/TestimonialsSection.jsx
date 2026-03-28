import { motion } from 'framer-motion';
import { Marquee } from '../ui/Marquee';

const testimonials = [
    { name: 'Rajesh Kumar', cafe: 'Chai Point', city: 'Delhi', rating: 5, text: 'Revenue doubled in first month! No more 30-40% cuts.', emoji: '☕' },
    { name: 'Priya Sharma', cafe: 'Spice Garden', city: 'Mumbai', rating: 5, text: 'Setup was so easy. My customers love ordering directly from us.', emoji: '🍛' },
    { name: 'Arjun Singh', cafe: 'Burger Bros', city: 'Bangalore', rating: 5, text: 'Finally own my digital menu! Great dashboard to track orders.', emoji: '🍔' },
    { name: 'Meena Patel', cafe: 'South Flavors', city: 'Chennai', rating: 5, text: 'Super secure and easy to use. Highly recommend to all cafe owners!', emoji: '🥘' },
    { name: 'Vikram Nair', cafe: 'The Grind', city: 'Pune', rating: 5, text: 'Low 4% commission means I keep most of my money. Game changer!', emoji: '☕' },
    { name: 'Sunita Joshi', cafe: 'Curry House', city: 'Jaipur', rating: 5, text: 'Dashboard is beautiful and tracking revenue is so satisfying.', emoji: '🍲' },
    { name: 'Amit Khanna', cafe: 'Pizza Palace', city: 'Chandigarh', rating: 5, text: 'My cafe went viral on local social media after using Restroon!', emoji: '🍕' },
    { name: 'Deepa Menon', cafe: 'Coconut Grove', city: 'Kochi', rating: 5, text: 'The live order management is incredible. So fast and reliable.', emoji: '🥥' }
];

function TestimonialCard({ name, cafe, city, rating, text, emoji }) {
    return (
        <div className="w-72 bg-cream border-3 border-ink rounded-2xl p-5 shadow-[5px_5px_0_#1A1A1A] flex-shrink-0 mx-2">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-yellow border-3 border-ink rounded-full flex items-center justify-center text-2xl shadow-[2px_2px_0_#1A1A1A]">
                    {emoji}
                </div>
                <div>
                    <div className="font-bangers text-lg text-ink">{name}</div>
                    <div className="font-mono text-xs text-ink/60">{cafe} • {city}</div>
                </div>
            </div>
            <div className="flex gap-1 mb-3">
                {Array(rating).fill('⭐').map((s, i) => <span key={i} className="text-sm">{s}</span>)}
            </div>
            <p className="font-grotesk text-sm text-ink/80 leading-relaxed">"{text}"</p>
        </div>
    );
}

export default function TestimonialsSection() {
    return (
        <section className="py-24 retro-grid overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 mb-12">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="font-bangers text-5xl md:text-7xl text-ink">
                        CAFE OWNERS <span className="text-red">LOVE US</span> 💪
                    </h2>
                    <p className="font-grotesk text-xl text-ink/70 mt-4">
                        Join 500+ cafes already growing with Restroon
                    </p>
                </motion.div>
            </div>

            {/* Row 1 — Normal */}
            <Marquee pauseOnHover repeat={3} className="mb-4">
                {testimonials.slice(0, 4).map(t => <TestimonialCard key={t.name} {...t} />)}
            </Marquee>

            {/* Row 2 — Reverse */}
            <Marquee pauseOnHover reverse repeat={3}>
                {testimonials.slice(4).map(t => <TestimonialCard key={t.name} {...t} />)}
            </Marquee>
        </section>
    );
}