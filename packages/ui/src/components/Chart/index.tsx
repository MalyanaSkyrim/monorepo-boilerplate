'use client'

import * as React from 'react'
import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { classMerge } from '../../lib/utils'

const PRIMARY_CHART_COLOR = 'hsl(var(--primary))'

export interface ChartConfig {
  [key: string]: { label?: string; color?: string }
}

export interface BarChartProps<T> {
  data: T[]
  dataKey: string
  xAxisKey: string
  config?: ChartConfig
  className?: string
  height?: number
}

function BarChartInner<T extends object>({
  data,
  dataKey,
  xAxisKey,
  config = {},
  className,
  height = 300,
}: BarChartProps<T>) {
  const color = config[dataKey]?.color ?? PRIMARY_CHART_COLOR
  return (
    <div className={classMerge('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 'var(--radius)',
              border: '1px solid hsl(var(--border))',
              backgroundColor: 'hsl(var(--background))',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Bar
            dataKey={dataKey}
            fill={color}
            radius={[4, 4, 0, 0]}
            name={config[dataKey]?.label ?? dataKey}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BarChart<T extends object>(props: BarChartProps<T>) {
  return <BarChartInner {...props} />
}

export interface LineChartProps<T> {
  data: T[]
  dataKey: string
  xAxisKey: string
  config?: ChartConfig
  className?: string
  height?: number
}

function LineChartInner<T extends object>({
  data,
  dataKey,
  xAxisKey,
  config = {},
  className,
  height = 300,
}: LineChartProps<T>) {
  const color = config[dataKey]?.color ?? PRIMARY_CHART_COLOR
  return (
    <div className={classMerge('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 'var(--radius)',
              border: '1px solid hsl(var(--border))',
              backgroundColor: 'hsl(var(--background))',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color }}
            name={config[dataKey]?.label ?? dataKey}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function LineChart<T extends object>(props: LineChartProps<T>) {
  return <LineChartInner {...props} />
}

export interface AreaChartProps<T> {
  data: T[]
  dataKey: string
  xAxisKey: string
  config?: ChartConfig
  className?: string
  height?: number
  gradientId?: string
  strokeColor?: string
  fillColor?: string
  yAxisFormatter?: (value: number) => string
}

function AreaChartInner<T extends object>({
  data,
  dataKey,
  xAxisKey,
  config = {},
  className,
  height = 300,
  gradientId = 'areaGradient',
  strokeColor = '#4f46e5',
  fillColor = '#6366f1',
  yAxisFormatter,
}: AreaChartProps<T>) {
  const color = config[dataKey]?.color ?? strokeColor
  return (
    <div className={classMerge('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={fillColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={fillColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100" />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={yAxisFormatter}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid hsl(var(--border))',
              backgroundColor: 'hsl(var(--background))',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.5}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            dot={{ r: 4, fill: color, stroke: '#ffffff', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: color, stroke: '#ffffff', strokeWidth: 2 }}
            name={config[dataKey]?.label ?? dataKey}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AreaChart<T extends object>(props: AreaChartProps<T>) {
  return <AreaChartInner {...props} />
}

export interface PieDataItem {
  name: string
  value: number
  color: string
}

export interface DonutChartProps {
  data: PieDataItem[]
  height?: number
  className?: string
  innerRadius?: number
  outerRadius?: number
  centerLabelTitle?: string
  centerLabelValue?: string
}

export function DonutChart({
  data,
  height = 240,
  className,
  innerRadius = 60,
  outerRadius = 90,
  centerLabelTitle,
  centerLabelValue,
}: DonutChartProps) {
  return (
    <div
      className={classMerge('relative w-full', className)}
      style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey="value">
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid hsl(var(--border))',
              backgroundColor: 'hsl(var(--background))',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
      {(centerLabelTitle || centerLabelValue) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerLabelValue && (
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {centerLabelValue}
            </span>
          )}
          {centerLabelTitle && (
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {centerLabelTitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
