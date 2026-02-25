import React from 'react';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    imageClassName?: string;
    src?: string;
    height?: string; // Enable custom height overrides
}

export const Logo: React.FC<LogoProps> = ({
    className,
    imageClassName,
    src = "/logo-transparent.png",
    height = "h-20 md:h-24 lg:h-28" // Default responsive heights
}) => {
    const [imgError, setImgError] = React.useState(false);

    return (
        <div className={cn("inline-flex items-center justify-center leading-none bg-transparent", className)}>
            {!imgError ? (
                <img
                    src={src}
                    alt="Logo"
                    className={cn(
                        height,
                        "w-auto object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]",
                        imageClassName
                    )}
                    onError={() => setImgError(true)}
                />
            ) : (
                // Fallback UI if logo-transparent.png is missing or broken
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                        <Zap className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold">Restroon</span>
                </div>
            )}
        </div>
    );
};

export default Logo;
