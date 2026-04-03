// src/components/landing/AnimatedHeroScene.jsx
import heroVideo from '../../assets/hero-animation.mp4';

export default function AnimatedHeroScene() {
    return (
        <div className="relative w-full h-full bg-[#7dd87d] overflow-hidden flex items-center justify-center">
            <video
                autoPlay
                loop
                muted
                playsInline
                preload="none"
                loading="lazy"
                className="w-full h-auto rounded-xl"
                style={{ maxWidth: '100%' }}
            >
                <source src={heroVideo} type="video/mp4" />
            </video>
        </div>
    );
}
