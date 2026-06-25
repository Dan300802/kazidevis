import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, icon, fullWidth, children, className = "", disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-[#16A34A] disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
      primary:   "bg-[#16A34A] text-white hover:bg-[#15803D] shadow-sm",
      secondary: "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50",
      ghost:     "bg-transparent text-gray-600 hover:bg-gray-100",
      danger:    "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-sm min-h-[36px]",
      md: "px-4 py-2.5 text-sm min-h-[44px]",
      lg: "px-5 py-3 text-base min-h-[52px]",
    };
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
