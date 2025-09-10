import { ReactNode } from "react"

interface MainContainerProps {
  children: ReactNode
  className?: string
}

export function MainContainer({ children, className = "" }: MainContainerProps) {
  return (
    <main 
      id="main" 
      className={`min-h-screen ${className}`}
      role="main"
      tabIndex={-1}
    >
      {children}
    </main>
  )
}
