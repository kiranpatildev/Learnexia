
import { motion } from "framer-motion";

export const CircularProgress = ({ value, size = 120, strokeWidth = 10, color = "#12F82D", trackColor = "#EBE9F1", showText = true, textSub = "" }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg
                className="transform -rotate-90 w-full h-full"
                width={size}
                height={size}
            >
                <circle
                    className="transition-colors duration-300 ease-linear"
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <motion.circle
                    className="transition-all duration-1000 ease-out"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference} // Initial state for animation
                    animate={{ strokeDashoffset: offset }}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            {showText && (
                <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-bold font-poppins text-brand-navy">
                        {Math.round(value)}%
                    </span>
                    {textSub && <span className="text-xs text-gray-400 font-instrument uppercase tracking-wider">{textSub}</span>}
                </div>
            )}
        </div>
    );
};
