import { useEffect, useRef, useState } from 'react';
import { useScroll, useTransform } from 'framer-motion';

// Load image URLs
const frameModules = import.meta.glob('../../restroonFrames/*.png', { eager: true });
const framePaths = Object.keys(frameModules)
    .sort()
    .map(key => frameModules[key].default);

export function ScrollFrameAnimation() {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [images, setImages] = useState([]);

    // Map scroll progress of the element itself
    const { scrollYProgress } = useScroll({
        target: containerRef,
        // start 80%: animation starts when top of container hits 80% down the viewport
        // end 20%: animation ends when bottom of container hits 20% down the viewport
        offset: ["start 80%", "end 20%"] 
    });

    // Map 0 -> 1 progress to frame index
    const frameIndex = useTransform(scrollYProgress, [0, 1], [0, Math.max(0, framePaths.length - 1)]);

    // Load images
    useEffect(() => {
        const preloads = framePaths.map(src => {
            const img = new window.Image();
            img.src = src;
            return img;
        });
        setImages(preloads);
    }, []);

    // Draw frame to canvas
    useEffect(() => {
        if (!canvasRef.current || images.length === 0) return;
        
        const renderFrame = (latestValue) => {
            const index = Math.min(Math.round(latestValue), images.length - 1);
            const targetImage = images[index];
            if (!targetImage || !targetImage.complete) return;
            
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            
            canvas.width = targetImage.naturalWidth || 800;
            canvas.height = targetImage.naturalHeight || 800;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(targetImage, 0, 0, canvas.width, canvas.height);
        };

        const unsubscribe = frameIndex.on("change", renderFrame);
        
        // Render initially
        renderFrame(0);

        return () => unsubscribe();
    }, [frameIndex, images]);

    return (
        <div ref={containerRef} className="w-full h-full relative flex items-center justify-center overflow-hidden">
            <canvas 
                ref={canvasRef} 
                className="w-full h-full object-cover"
            />
        </div>
    );
}
