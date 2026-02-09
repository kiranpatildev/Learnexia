
import { cn } from "@/lib/utils";

export const Avatar = ({ src, alt, size = "md", className }) => {
    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
        xl: "w-24 h-24 text-xl",
        "2xl": "w-32 h-32 text-2xl"
    };

    return (
        <div className={cn(
            "relative rounded-full overflow-hidden bg-gray-100 flex items-center justify-center font-bold text-gray-500",
            sizeClasses[size] || sizeClasses.md,
            className
        )}>
            {src ? (
                <img
                    src={src}
                    alt={alt || "Avatar"}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
            ) : (
                <span>{alt ? alt.charAt(0).toUpperCase() : "?"}</span>
            )}
        </div>
    );
};
