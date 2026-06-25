import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}{props.required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <input
        ref={ref}
        className={`w-full px-4 py-3 rounded-xl border text-sm bg-white text-gray-900 placeholder-gray-400 min-h-[48px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent ${error ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"} ${className}`}
        {...props}
      />
      {error  && <p className="text-xs text-red-600" role="alert">{error}</p>}
      {helper && !error && <p className="text-xs text-gray-500">{helper}</p>}
    </div>
  )
);
Input.displayName = "Input";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}{props.required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <select
        ref={ref}
        className={`w-full px-4 py-3 rounded-xl border text-sm bg-white text-gray-900 min-h-[48px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent ${error ? "border-red-300" : "border-gray-200 hover:border-gray-300"} ${className}`}
        {...props}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
    </div>
  )
);
Select.displayName = "Select";
