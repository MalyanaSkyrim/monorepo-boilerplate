import React from 'react'

// Placeholder mark: a rounded tile with a circular cut-out. Replace the path
// with your own logo. Single path so it follows `currentColor`.
export const AppLogo = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="347 216 627 627"
      {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M487 216H834A140 140 0 0 1 974 356V703A140 140 0 0 1 834 843H487A140 140 0 0 1 347 703V356A140 140 0 0 1 487 216ZM660.5 379.5A150 150 0 1 0 660.5 679.5A150 150 0 1 0 660.5 379.5Z"
      />
    </svg>
  )
}
