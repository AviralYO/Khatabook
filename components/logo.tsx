import { BookOpen } from "lucide-react"

interface LogoProps {
  className?: string
  showText?: boolean
}

export function Logo({ className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-blue-600 p-2 rounded-lg">
        <BookOpen className="h-6 w-6 text-white" />
      </div>
      {showText && <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">KhataBook</span>}
    </div>
  )
}
