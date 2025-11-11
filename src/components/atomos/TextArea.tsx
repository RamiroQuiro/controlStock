import * as React from "react"
import { cn } from "../../lib/cn"



const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, name, label, ...props }, ref) => {
  return (
    <div className="flex flex-col w-full">
      <label
      htmlFor={name}
      className="mb-1 text-sm font-semibold text-primary-texto disabled:text-gray-400"
    >
      {label}
    </label>
    <textarea
       className={`p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-primary-100 focus:border-primary-100 placeholder:text-gray-400 transition ${className}`}
      ref={ref}
      {...props}
    />
    </div>
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
