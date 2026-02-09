
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const Button = ({ children, className, variant = "primary", size = "md", icon: Icon, ...props }) => {
    const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-brand-navy text-white hover:bg-brand-purple shadow-lg shadow-brand-navy/20 active:scale-95",
        secondary: "bg-white text-brand-navy border-2 border-brand-light-gray/20 hover:border-brand-navy/20 hover:bg-gray-50 active:scale-95",
        ghost: "bg-transparent text-brand-navy hover:bg-black/5 active:scale-95",
        outline: "bg-transparent border-2 border-gray-200 hover:border-brand-navy text-gray-500 hover:text-brand-navy active:scale-95",
        cta: "bg-brand-blue text-white hover:bg-brand-blue/90 shadow-xl shadow-brand-blue/30 active:scale-95 hover:-translate-y-1",
        assignment: "bg-brand-navy text-white hover:bg-brand-purple shadow-md active:scale-95 rounded-full px-6 py-2 text-sm"
    };

    const sizes = {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-base",
        lg: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            {children}
        </motion.button>
    );
};
