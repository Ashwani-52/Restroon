export function Marquee({
    children,
    reverse = false,
    pauseOnHover = false,
    vertical = false,
    repeat = 4,
    className = ''
}) {
    return (
        <div className={`group flex overflow-hidden [--gap:1rem] gap-4 ${vertical ? 'flex-col' : 'flex-row'} ${className}`}>
            {Array.from({ length: repeat }, (_, i) => (
                <div
                    key={i}
                    className={`
            flex shrink-0 justify-around
            ${vertical
                            ? `flex-col animate-marquee-vertical ${reverse ? '[animation-direction:reverse]' : ''}`
                            : `flex-row animate-marquee ${reverse ? '[animation-direction:reverse]' : ''}`
                        }
            ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''}
          `}
                >
                    {children}
                </div>
            ))}
        </div>
    );
}