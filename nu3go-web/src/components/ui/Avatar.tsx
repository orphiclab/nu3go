import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
    name: string;
    size?: "sm" | "md" | "lg";
    imageUrl?: string;
    className?: string;
}

const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
};

export function Avatar({ name, size = "md", imageUrl, className }: AvatarProps) {
    if (imageUrl) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={imageUrl}
                alt={name}
                className={cn(
                    "rounded-full object-cover",
                    sizeClasses[size],
                    className
                )}
            />
        );
    }

    return (
        <div
            className={cn(
                "rounded-full bg-primary-100 text-primary-700 font-semibold flex items-center justify-center",
                sizeClasses[size],
                className
            )}
            aria-label={name}
        >
            {getInitials(name)}
        </div>
    );
}
