import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva("relative w-full rounded-md border px-4 py-3 text-sm", {
  variants: {
    variant: {
      default: "bg-muted text-muted-foreground",
      destructive: "border-destructive/30 bg-destructive/10 text-foreground",
      success: "border-success/30 bg-success/10 text-foreground",
      warning: "border-warning/30 bg-warning/10 text-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type AlertProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>;

function Alert({ className, variant, ...props }: AlertProps) {
  return <div className={cn(alertVariants({ variant }), className)} {...props} />;
}

export { Alert };
