export function CartoonButton({
    label,
    color = 'bg-yellow',
    onClick,
    disabled = false,
    size = 'md',
    type = 'button'
}) {
    const sizes = {
        sm: 'px-4 py-2 text-base',
        md: 'px-6 py-3 text-lg',
        lg: 'px-10 py-4 text-xl'
    };

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`
        relative inline-flex items-center justify-center
        font-bangers tracking-wider rounded-full
        border-3 border-ink
        shadow-[4px_4px_0_#1A1A1A]
        transition-all duration-150
        overflow-hidden group
        ${color} ${sizes[size]}
        ${disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:-translate-y-1 hover:shadow-[6px_6px_0_#1A1A1A] active:translate-y-0 active:shadow-[2px_2px_0_#1A1A1A]'
                }
      `}
        >
            <span className="relative z-10 text-ink">{label}</span>
            {!disabled && (
                <div className="absolute top-1/2 left-[-100%] w-16 h-24 bg-white/40 -translate-y-1/2 rotate-12 transition-all duration-500 group-hover:left-[200%]" />
            )}
        </button>
    );
}