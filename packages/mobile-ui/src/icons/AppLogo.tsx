import React from 'react'
import Svg, { Path } from 'react-native-svg'

/**
 * Matches Gluestack `--color-primary-300` (63 70 249).
 * Use `rgb()` so Android reliably applies fill (some builds mishandle `#hex` on Path).
 */
export const APP_LOGO_DEFAULT_COLOR = 'rgb(63, 70, 249)'

export type AppLogoProps = {
  size?: number
  color?: string
}

// Placeholder mark: a rounded tile with a circular cut-out. Replace the path
// with your own logo.
const LOGO_PATH =
  'M487 216H834A140 140 0 0 1 974 356V703A140 140 0 0 1 834 843H487A140 140 0 0 1 347 703V356A140 140 0 0 1 487 216ZM660.5 379.5A150 150 0 1 0 660.5 679.5A150 150 0 1 0 660.5 379.5Z'

export const AppLogo = ({
  size = 80,
  color = APP_LOGO_DEFAULT_COLOR,
}: AppLogoProps) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="347 216 627 627"
      preserveAspectRatio="xMidYMid meet"
      accessibilityLabel="App logo">
      <Path d={LOGO_PATH} fill={color} fillRule="evenodd" />
    </Svg>
  )
}
