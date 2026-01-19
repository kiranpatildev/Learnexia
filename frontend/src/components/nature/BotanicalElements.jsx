// SVG Botanical Elements - Reusable Components

export const LeafTopRight = () => (
    <svg
        className="leaf-decoration leaf-top-right sway-animation"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Eucalyptus Branch */}
        <path
            d="M60 120 Q65 100, 70 80 Q72 70, 75 60 Q77 50, 80 40"
            stroke="#A8B89F"
            strokeWidth="2"
            fill="none"
            opacity="0.6"
        />

        {/* Leaves */}
        <ellipse cx="75" cy="45" rx="12" ry="20" fill="#A8B89F" opacity="0.5" transform="rotate(-20 75 45)" />
        <ellipse cx="72" cy="55" rx="10" ry="18" fill="#8FB569" opacity="0.6" transform="rotate(15 72 55)" />
        <ellipse cx="78" cy="65" rx="11" ry="19" fill="#A8B89F" opacity="0.5" transform="rotate(-25 78 65)" />
        <ellipse cx="74" cy="75" rx="9" ry="17" fill="#8FB569" opacity="0.6" transform="rotate(20 74 75)" />
        <ellipse cx="80" cy="85" rx="10" ry="18" fill="#A8B89F" opacity="0.5" transform="rotate(-15 80 85)" />

        {/* Olive Leaves */}
        <ellipse cx="85" cy="50" rx="8" ry="16" fill="#9CAA8F" opacity="0.6" transform="rotate(30 85 50)" />
        <ellipse cx="82" cy="60" rx="7" ry="15" fill="#A8B89F" opacity="0.5" transform="rotate(-35 82 60)" />
        <ellipse cx="88" cy="70" rx="8" ry="16" fill="#8FB569" opacity="0.6" transform="rotate(25 88 70)" />
    </svg>
);

export const LeafBottomLeft = () => (
    <svg
        className="leaf-decoration leaf-bottom-left sway-animation"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ animationDelay: '1s' }}
    >
        {/* Wheat Stalk */}
        <path
            d="M20 0 Q18 20, 16 40 Q15 50, 14 60 Q13 70, 12 80"
            stroke="#D4A574"
            strokeWidth="2"
            fill="none"
            opacity="0.5"
        />

        {/* Wheat Grains */}
        <ellipse cx="14" cy="15" rx="4" ry="8" fill="#D4A574" opacity="0.6" transform="rotate(45 14 15)" />
        <ellipse cx="12" cy="25" rx="4" ry="8" fill="#C9995E" opacity="0.6" transform="rotate(-45 12 25)" />
        <ellipse cx="16" cy="35" rx="4" ry="8" fill="#D4A574" opacity="0.6" transform="rotate(50 16 35)" />
        <ellipse cx="13" cy="45" rx="4" ry="8" fill="#C9995E" opacity="0.6" transform="rotate(-40 13 45)" />

        {/* Small Leaves */}
        <ellipse cx="10" cy="55" rx="6" ry="12" fill="#A8B89F" opacity="0.5" transform="rotate(-30 10 55)" />
        <ellipse cx="15" cy="65" rx="5" ry="11" fill="#8FB569" opacity="0.6" transform="rotate(35 15 65)" />
        <ellipse cx="12" cy="75" rx="6" ry="12" fill="#A8B89F" opacity="0.5" transform="rotate(-25 12 75)" />
    </svg>
);

export const FlowerAccent = () => (
    <svg
        className="leaf-decoration float-animation"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '60px', height: '60px' }}
    >
        {/* Flower Petals */}
        <ellipse cx="30" cy="20" rx="8" ry="12" fill="#E8B4A0" opacity="0.7" />
        <ellipse cx="42" cy="28" rx="8" ry="12" fill="#D4896B" opacity="0.7" transform="rotate(60 42 28)" />
        <ellipse cx="42" cy="42" rx="8" ry="12" fill="#E8B4A0" opacity="0.7" transform="rotate(120 42 42)" />
        <ellipse cx="30" cy="50" rx="8" ry="12" fill="#D4896B" opacity="0.7" transform="rotate(180 30 50)" />
        <ellipse cx="18" cy="42" rx="8" ry="12" fill="#E8B4A0" opacity="0.7" transform="rotate(240 18 42)" />
        <ellipse cx="18" cy="28" rx="8" ry="12" fill="#D4896B" opacity="0.7" transform="rotate(300 18 28)" />

        {/* Center */}
        <circle cx="30" cy="35" r="6" fill="#C9995E" opacity="0.8" />
        <circle cx="30" cy="35" r="3" fill="#D4A574" opacity="0.9" />

        {/* Stem */}
        <path d="M30 50 L30 60" stroke="#8FB569" strokeWidth="2" opacity="0.6" />

        {/* Small Leaf */}
        <ellipse cx="26" cy="55" rx="4" ry="6" fill="#A8B89F" opacity="0.6" transform="rotate(-30 26 55)" />
    </svg>
);

export const WatercolorBlob = ({ color = '#D4896B', size = 200, opacity = 0.15, className = '' }) => (
    <svg
        className={`watercolor-blob ${className}`}
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <filter id={`watercolor-${color.replace('#', '')}`}>
                <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" />
                <feGaussianBlur stdDeviation="8" />
            </filter>
        </defs>
        <circle
            cx="100"
            cy="100"
            r="80"
            fill={color}
            opacity={opacity}
            filter={`url(#watercolor-${color.replace('#', '')})`}
        />
    </svg>
);

export const BotanicalDivider = () => (
    <svg
        width="100%"
        height="2"
        viewBox="0 0 400 2"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ margin: '1rem 0' }}
    >
        <line x1="0" y1="1" x2="180" y2="1" stroke="#D4896B" strokeWidth="1" opacity="0.3" />
        <circle cx="200" cy="1" r="3" fill="#D4896B" opacity="0.5" />
        <line x1="220" y1="1" x2="400" y2="1" stroke="#D4896B" strokeWidth="1" opacity="0.3" />
    </svg>
);
