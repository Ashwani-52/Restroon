// src/components/ui/GlobeStickers.jsx
import { useEffect, useRef, useCallback } from "react";
import createGlobe from "cobe";

const defaultMarkers = [
  { id: "paris",     location: [48.86,  2.35],   sticker: "🥐" },
  { id: "tokyo",     location: [35.68,  139.65],  sticker: "🍜" },
  { id: "nyc",       location: [40.71, -74.01],   sticker: "🍎" },
  { id: "rio",       location: [-22.91,-43.17],   sticker: "🎭" },
  { id: "sydney",    location: [-33.87, 151.21],  sticker: "🦘" },
  { id: "cairo",     location: [30.04,  31.24],   sticker: "🐪" },
  { id: "rome",      location: [41.9,   12.5],    sticker: "🍕" },
  { id: "mexico",    location: [19.43, -99.13],   sticker: "🌮" },
  { id: "india",     location: [28.61,  77.21],   sticker: "🍛" },
  { id: "london",    location: [51.51,  -0.13],   sticker: "☕" },
  { id: "hawaii",    location: [21.31,-157.86],   sticker: "🏄" },
  { id: "seoul",     location: [37.57,  126.98],  sticker: "🍱" },
  { id: "beijing",   location: [39.9,   116.4],   sticker: "🥢" },
  { id: "amsterdam", location: [52.37,   4.9],    sticker: "🚲" },
  { id: "moscow",    location: [55.75,  37.62],   sticker: "🥘" },
  { id: "iceland",   location: [64.15, -21.94],   sticker: "🧊" },
];

export function GlobeStickers({ markers = defaultMarkers, className = "", speed = 0.003 }) {
  const canvasRef = useRef(null);
  const pointerInteracting = useRef(null);
  const dragOffset = useRef({ phi: 0, theta: 0 });
  const phiOffsetRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const isPausedRef = useRef(false);

  const handlePointerDown = useCallback((e) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
    isPausedRef.current = true;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi;
      thetaOffsetRef.current += dragOffset.current.theta;
      dragOffset.current = { phi: 0, theta: 0 };
    }
    pointerInteracting.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        };
      }
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerUp]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    let globe = null;
    let animationId;
    let phi = 0;

    function init() {
      const width = canvas.offsetWidth;
      if (width === 0 || globe) return;

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width,
        height: width,
        phi: 0,
        theta: 0.2,
        dark: 0,
        diffuse: 1.5,
        mapSamples: 16000,
        mapBrightness: 8,
        baseColor: [1, 1, 1],
        markerColor: [1, 0.5, 0.1],
        glowColor: [0.95, 0.90, 0.85],
        markerElevation: 0,
        markers: markers.map((m) => ({ location: m.location, size: 0.04 })),
        opacity: 0.85,
      });

      function animate() {
        if (!isPausedRef.current) phi += speed;
        globe.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
        });
        animationId = requestAnimationFrame(animate);
      }

      animate();
      // Fade in after init
      setTimeout(() => {
        if (canvas) canvas.style.opacity = "1";
      }, 100);
    }

    if (canvas.offsetWidth > 0) {
      init();
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect();
          init();
        }
      });
      ro.observe(canvas);
      return () => ro.disconnect();
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (globe) globe.destroy();
    };
  }, [markers, speed]);

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1s ease",
          borderRadius: "50%",
          touchAction: "none",
        }}
      />
      {/* Emoji stickers floating around the globe */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {markers.slice(0, 8).map((m, i) => {
          const angle = (i / 8) * 360;
          const radius = 47; // % from center
          const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
          const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
          return (
            <span
              key={m.id}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                fontSize: "1.5rem",
                transform: `translate(-50%, -50%) rotate(${[-8, 6, -4, 10, -6, 8, -2, 5][i]}deg)`,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
                animation: `float ${3 + i * 0.5}s ease-in-out infinite alternate`,
              }}
            >
              {m.sticker}
            </span>
          );
        })}
      </div>
      <style>{`
        @keyframes float {
          from { transform: translate(-50%, -50%) translateY(0px) rotate(-4deg); }
          to   { transform: translate(-50%, -50%) translateY(-8px) rotate(4deg); }
        }
      `}</style>
    </div>
  );
}

export default GlobeStickers;
