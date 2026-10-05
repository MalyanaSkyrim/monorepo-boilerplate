import { Moon, Sun } from 'lucide-react-native'
import { cssInterop } from 'nativewind'
import React, { useMemo, useState } from 'react'
import { PanResponder, Text, View } from 'react-native'
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg'
import { tv } from 'tailwind-variants'

cssInterop(Svg, {
  className: {
    target: 'style',
  },
})

const container = tv({
  base: 'items-center justify-center',
})

interface CircularTimePickerProps {
  value: { start: number; end: number }
  onChange: (value: { start: number; end: number }) => void
  unavailableRanges?: { start: number; end: number }[]
  disabled?: boolean
  className?: string
  radius?: number
  strokeWidth?: number
}

const HOURS = 24
const DEGREES_PER_HOUR = 360 / HOURS

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

const describeArc = (
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) => {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
  const d = [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(' ')
  return d
}

// Adjust angle so 0 is at top
const normalizeAngle = (angle: number) => {
  let a = angle % 360
  if (a < 0) a += 360
  return a
}
const normalizeRange = (
  start: number,
  end: number,
): { start: number; end: number }[] => {
  if (start <= end) return [{ start, end }]
  return [
    { start, end: 24 },
    { start: 0, end },
  ]
}

export const CircularTimePicker: React.FC<CircularTimePickerProps> = ({
  value,
  onChange,
  unavailableRanges = [],
  disabled = false,
  className,
  radius = 120,
  strokeWidth = 40,
}) => {
  const size = radius * 2 + 120 // Padding for outer elements
  const center = size / 2

  // Convert hour to angle (0h = 0 deg at top)
  const hourToAngle = (hour: number) => hour * DEGREES_PER_HOUR

  // Helper to determine touch angle
  const getAngle = (x: number, y: number) => {
    const dx = x - center
    const dy = y - center
    // atan2 returns angle from -PI to PI, where 0 is right (3 o'clock)
    // We want 0 at top (12 o'clock), so we rotate by 90 deg
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90
    return normalizeAngle(angle)
  }

  // Interaction State
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null)

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (evt) => {
          const { locationX, locationY } = evt.nativeEvent
          const angle = getAngle(locationX, locationY)
          const startAngle = hourToAngle(value.start)
          const endAngle = hourToAngle(value.end)

          // Simple hit testing based on angle difference
          const diffStart = Math.min(
            Math.abs(angle - startAngle),
            360 - Math.abs(angle - startAngle),
          )
          const diffEnd = Math.min(
            Math.abs(angle - endAngle),
            360 - Math.abs(angle - endAngle),
          )

          if (diffStart < 20) {
            setIsDragging('start')
          } else if (diffEnd < 20) {
            setIsDragging('end')
          } else {
            // If clicked elsewhere, move closer handle?
            // For now, simple tap to jump logic or drag closest
            if (diffStart < diffEnd) setIsDragging('start')
            else setIsDragging('end')
          }
        },
        onPanResponderMove: (evt) => {
          const { locationX, locationY } = evt.nativeEvent
          const angle = getAngle(locationX, locationY)
          const snappedHour = Math.round(angle / DEGREES_PER_HOUR) % 24

          if (isDragging === 'start') {
            if (snappedHour === value.end) {
              onChange({ start: value.end, end: snappedHour })
              setIsDragging('end')
            } else if (snappedHour !== value.start) {
              onChange({ ...value, start: snappedHour })
            }
          } else if (isDragging === 'end') {
            if (snappedHour === value.start) {
              onChange({ start: snappedHour, end: value.start })
              setIsDragging('start')
            } else if (snappedHour !== value.end) {
              onChange({ ...value, end: snappedHour })
            }
          }
        },
        onPanResponderRelease: () => {
          setIsDragging(null)
        },
        onPanResponderTerminate: () => {
          setIsDragging(null)
        },
      }),
    [disabled, value, center, isDragging, unavailableRanges],
  )

  // Generate unavailable paths
  const unavailablePaths = unavailableRanges.map((range, index) => {
    const start = hourToAngle(range.start)
    let end = hourToAngle(range.end)
    if (end < start) end += 360 // Handle midnight crossing
    // Visual tweak: subtract a bit from end to show gap? Or keep solid?
    return (
      <Path
        key={`unavailable-${index}`}
        d={describeArc(center, center, radius, start, end)}
        stroke="#c6c9cfff"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
    )
  })

  // Selected Path
  const startAngle = hourToAngle(value.start)
  let endAngle = hourToAngle(value.end)
  if (endAngle <= startAngle) endAngle += 360

  const selectedPath = describeArc(center, center, radius, startAngle, endAngle)

  // Check for conflict
  const hasConflict = useMemo(() => {
    const selectedRanges = normalizeRange(value.start, value.end)
    const unavailable = unavailableRanges.flatMap((r) =>
      normalizeRange(r.start, r.end),
    )
    return selectedRanges.some((sel) =>
      unavailable.some(
        (u) => Math.max(sel.start, u.start) < Math.min(sel.end, u.end),
      ),
    )
  }, [value, unavailableRanges])

  // Start and End Handle positions
  const startPos = polarToCartesian(center, center, radius, startAngle)
  const endPos = polarToCartesian(center, center, radius, endAngle)

  // Duration
  let duration = value.end - value.start
  if (duration < 0) duration += 24

  // Icon Positions - Move inside the circle

  return (
    <View className={container({ className })} {...panResponder.panHandlers}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Base Track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#E5E7EB" // gray-200
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Unavailable Segments */}
        {unavailablePaths}

        {/* Selected Arc */}
        <Path
          d={selectedPath}
          stroke="#656bfa"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeOpacity={hasConflict ? 0.5 : 1}
        />

        {/* Hour Ticks */}
        {Array.from({ length: HOURS }).map((_, i) => {
          const angle = i * DEGREES_PER_HOUR
          // Only small ticks
          const rInner = radius - strokeWidth / 2 + 2
          const rOuter = radius - strokeWidth / 2 + 6
          const pos1 = polarToCartesian(center, center, rInner, angle)
          const pos2 = polarToCartesian(center, center, rOuter, angle)
          return (
            <Path
              key={`tick-${i}`}
              d={`M${pos1.x},${pos1.y} L${pos2.x},${pos2.y}`}
              stroke="#9CA3AF"
              strokeWidth={1}
            />
          )
        })}

        {/* Hour Numbers (Main ones) */}
        {Array.from(
          new Set([
            0,
            2,
            4,
            6,
            8,
            10,
            12,
            14,
            16,
            18,
            20,
            22,
            value.start,
            value.end,
          ]),
        ).map((h) => {
          const angle = h * DEGREES_PER_HOUR
          const pos = polarToCartesian(
            center,
            center,
            radius + strokeWidth / 2 + 24,
            angle,
          )
          const label = h < 10 ? `0${h}:00` : `${h}:00`

          const isSelected = h === value.start || h === value.end

          return (
            <SvgText
              key={h}
              x={pos.x}
              y={pos.y}
              fill={isSelected ? '#3f46f9' : '#6B7280'}
              fontSize={isSelected ? '16' : '10'}
              fontWeight={isSelected ? '700' : '500'}
              textAnchor="middle"
              alignmentBaseline="middle">
              {label}
            </SvgText>
          )
        })}

        {/* Handles */}
        <Circle
          cx={startPos.x}
          cy={startPos.y}
          r={strokeWidth / 2 - 2}
          fill="white"
          stroke="#3f46f9" // darker green
          strokeWidth={2}
        />
        <Circle
          cx={endPos.x}
          cy={endPos.y}
          r={strokeWidth / 2 - 2}
          fill="white"
          stroke="#3f46f9"
          strokeWidth={2}
        />
      </Svg>

      {/* Icons Overlay (Absolute positioned or mapped in SVG) */}
      {/* Actually, easier to put them in SVG if we can, but Lucide icons are React components. 
           We can wrap them in <View> absolute positioned. */}

      <View
        className="pointer-events-none absolute items-center justify-center"
        style={{
          left: '50%',
          bottom: 90,
          transform: [{ translateX: '-50%' }],
        }}>
        <Sun size={24} color="#FDB813" />
      </View>

      <View
        className="pointer-events-none absolute items-center justify-center"
        style={{
          left: '50%',
          top: 90,
          transform: [{ translateX: '-50%' }],
        }}>
        <Moon size={24} color="#6B7280" />
      </View>

      {/* Center Text */}
      <View className="absolute items-center justify-center">
        <Text className="text-3xl font-bold text-gray-900">{duration}h</Text>
        <Text className="text-sm text-gray-500">Duration</Text>
      </View>
    </View>
  )
}
