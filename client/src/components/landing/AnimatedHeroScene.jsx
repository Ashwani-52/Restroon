// src/components/landing/AnimatedHeroScene.jsx
// Canvas-based frame animation player using the 193 restroonFrames images.
import { useEffect, useRef, useState } from 'react';

const TOTAL_FRAMES = 193;
const FPS = 24;

// Eagerly build the frame URLs list
const frameUrls = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
    const num = String(i + 1).padStart(3, '0');
    return new URL(`../../restroonFrames/ezgif-frame-${num}.png`, import.meta.url).href;
});

export default function AnimatedHeroScene() {
    const canvasRef = useRef(null);
    const imagesRef = useRef([]);
    const frameRef = useRef(0);
    const timerRef = useRef(null);
    const [loadedCount, setLoadedCount] = useState(0);
    const [ready, setReady] = useState(false);

    // ── Preload all frames ──────────────────────────────────────────────────
    useEffect(() => {
        let loaded = 0;
        const images = new Array(TOTAL_FRAMES);
        imagesRef.current = images;

        frameUrls.forEach((src, i) => {
            const img = new Image();
            img.onload = () => {
                loaded++;
                setLoadedCount(loaded);
                if (loaded === TOTAL_FRAMES) setReady(true);
            };
            img.onerror = () => {
                loaded++;
                setLoadedCount(loaded);
                if (loaded === TOTAL_FRAMES) setReady(true);
            };
            img.src = src;
            images[i] = img;
        });

        return () => {
            clearInterval(timerRef.current);
        };
    }, []);

    // ── Start animation once all frames loaded ──────────────────────────────
    useEffect(() => {
        if (!ready) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const draw = () => {
            const img = imagesRef.current[frameRef.current];
            if (img && img.complete && img.naturalWidth > 0) {
                // Maintain aspect ratio — cover the canvas
                const cw = canvas.width;
                const ch = canvas.height;
                const iw = img.naturalWidth;
                const ih = img.naturalHeight;
                const scale = Math.max(cw / iw, ch / ih);
                const sw = iw * scale;
                const sh = ih * scale;
                const ox = (cw - sw) / 2;
                const oy = (ch - sh) / 2;
                ctx.clearRect(0, 0, cw, ch);
                ctx.drawImage(img, ox, oy, sw, sh);
            }
            frameRef.current = (frameRef.current + 1) % TOTAL_FRAMES;
        };

        timerRef.current = setInterval(draw, 1000 / FPS);
        return () => clearInterval(timerRef.current);
    }, [ready]);

    // ── Resize canvas to fill container ────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            canvas.width = width;
            canvas.height = height;
        });
        ro.observe(canvas.parentElement);
        return () => ro.disconnect();
    }, []);

    const progress = Math.round((loadedCount / TOTAL_FRAMES) * 100);

    return (
        <div className="relative w-full h-full bg-[#7dd87d] overflow-hidden">
            {/* Loading overlay */}
            {!ready && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#7dd87d]">
                    <div className="text-5xl mb-4 animate-bounce">🛵</div>
                    <p className="font-bangers text-2xl text-ink mb-3">Loading Animation...</p>
                    <div className="w-48 h-3 bg-ink/20 rounded-full overflow-hidden border-2 border-ink">
                        <div
                            className="h-full bg-ink rounded-full transition-all duration-200"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="font-mono text-xs text-ink/50 mt-2">{progress}%</p>
                </div>
            )}

            {/* Canvas fills entire container */}
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ display: 'block' }}
            />
        </div>
    );
}
