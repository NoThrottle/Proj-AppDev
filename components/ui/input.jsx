import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        // Consistent height and roundness with Button, and border color matches date popover/button
        "block w-full h-9 px-4 py-2 rounded-md border border-input bg-background text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400",
        "dark:placeholder-gray-400",
        className
      )}
      ref={ref}
      {...props} />
  );
})
Input.displayName = "Input"

export { Input }
