import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    AnimatePresence
} from 'framer-motion';
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function DockItem({
    children,
    mouseX,
    spring,
    distance,
    magnification,
    baseItemSize,
    isActive,
    onClick
}) {
    const ref = useRef(null);
    const isHovered = useMotionValue(0);

    const mouseDistance = useTransform(mouseX, (val) => {
        const rect = ref.current?.getBoundingClientRect() ?? {
            y: 0,
            height: baseItemSize
        };
        return val - rect.y - rect.height / 2;
    });

    const targetSize = useTransform(
        mouseDistance,
        [-distance, 0, distance],
        [baseItemSize, magnification, baseItemSize]
    );

    const size = useSpring(targetSize, spring);

    return (
        <motion.div
            ref={ref}
            style={{
                width: size,
                height: size
            }}
            onHoverStart={() => isHovered.set(1)}
            onHoverEnd={() => isHovered.set(0)}
            onClick={onClick}
            className={`
        relative inline-flex items-center justify-center rounded-2xl
        transition-colors duration-200 cursor-pointer
        ${isActive
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30'
                    : 'bg-white/90 hover:bg-white shadow-md'
                }
      `}
        >
            {React.Children.map(children, child =>
                React.isValidElement(child)
                    ? React.cloneElement(child, { isHovered })
                    : child
            )}
        </motion.div>
    );
}

function DockLabel({ children, isHovered }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!isHovered) return;
        const unsubscribe = isHovered.on('change', (latest) => {
            setIsVisible(latest === 1);
        });
        return () => unsubscribe();
    }, [isHovered]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900/95 backdrop-blur-sm text-white text-sm rounded-lg whitespace-nowrap shadow-xl z-50"
                >
                    {children}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900/95" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function DockIcon({ children, isActive }) {
    return (
        <div className={`flex items-center justify-center ${isActive ? 'text-white' : 'text-gray-700'}`}>
            {children}
        </div>
    );
}

export default function AnimatedDock({ items }) {
    const mouseY = useMotionValue(Infinity);
    const navigate = useNavigate();
    const location = useLocation();

    // Smooth spring configuration (like macOS)
    const spring = {
        mass: 0.1,
        stiffness: 170,
        damping: 15
    };

    const distance = 120;
    const baseItemSize = 44;
    const magnification = 64;

    return (
        <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50">
            <motion.div
                onMouseMove={(e) => mouseY.set(e.pageY)}
                onMouseLeave={() => mouseY.set(Infinity)}
                className="flex flex-col items-center gap-2 p-3 rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-2xl"
            >
                {items.map((item, index) => {
                    const isActive = location.pathname === item.path;

                    return (
                        <DockItem
                            key={index}
                            mouseX={mouseY}
                            spring={spring}
                            distance={distance}
                            magnification={magnification}
                            baseItemSize={baseItemSize}
                            isActive={isActive}
                            onClick={() => navigate(item.path)}
                        >
                            <DockIcon isActive={isActive}>
                                <item.icon size={20} />
                            </DockIcon>
                            <DockLabel>{item.label}</DockLabel>
                        </DockItem>
                    );
                })}
            </motion.div>
        </div>
    );
}
