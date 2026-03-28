import { motion } from 'framer-motion';

export function ComicText({ children, fontSize = 5, className = '' }) {
    return (
        <motion.div
            className={`select-none text-center ${className}`}
            style={{
                fontSize: `${fontSize}rem`,
                fontFamily: "'Bangers', 'Impact', sans-serif",
                fontWeight: '900',
                WebkitTextStroke: `${fontSize * 0.3}px #1A1A1A`,
                transform: 'skewX(-8deg)',
                textTransform: 'uppercase',
                filter: 'drop-shadow(4px 4px 0px #1A1A1A) drop-shadow(2px 2px 0px #FF3B30)',
                backgroundColor: '#FFD23F',
                backgroundImage: 'radial-gradient(circle at 1px 1px, #FF3B30 1px, transparent 0)',
                backgroundSize: '8px 8px',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.05em'
            }}
            initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
        >
            {children}
        </motion.div>
    );
}