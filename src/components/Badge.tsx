import { CircleCheck, TriangleAlert, Lightbulb, Crown, Clock } from "lucide-react";
import { twMerge } from "tailwind-merge";

type BadgeVariant = "success" | "danger" | "pending" | "primary" | "admin";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: boolean;
  className?: string;
}

const variantConfig: Record<
  BadgeVariant,
  { textColor: string; bgColor: string; borderColor?: string; icon: React.ReactNode }
> = {
  success: {
    textColor: "text-teal-500",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-500",
    icon: <CircleCheck strokeWidth={2} size={18} />,
  },
  danger: {
    textColor: "text-rose-500",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-500",
    icon: <TriangleAlert strokeWidth={2} size={18} />,
  },
  pending: {
    textColor: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-500",
    icon: <Clock strokeWidth={2} size={18} />,
  },
  primary: {
    textColor: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-500",
    icon: <Lightbulb strokeWidth={2} size={18} />,
  },
  admin: {
    textColor: "text-yellow-700",
    bgColor: "bg-gradient-to-t from-orange-200 to-orange-100",
    icon: <Crown strokeWidth={2} size={18} />,
  },
};

function Badge({ variant = "primary", children, icon = true, className }: BadgeProps) {
  const config = variantConfig[variant];

  const defaultClasses = `flex items-center justify-center gap-1 px-2 py-2 rounded-lg font-semibold text-sm relative ${
    config.textColor
  } ${config.bgColor} ${config.borderColor ? `border ${config.borderColor}` : "shadow-md"}`;

  // Merge default classes with className, letting className override conflicts
  const finalClassName = twMerge(defaultClasses, className);

  return (
    <div className={finalClassName}>
      {icon && config.icon}
      {children}
    </div>
  );
}

export default Badge;
