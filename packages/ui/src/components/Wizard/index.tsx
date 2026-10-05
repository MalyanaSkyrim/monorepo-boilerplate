'use client'

import { X } from 'lucide-react'
import * as React from 'react'
import { createPortal } from 'react-dom'

import { Button } from '../Button'

export type WizardStep = {
  id: string
  title?: string
  subtitle?: React.ReactNode
  component: React.ReactNode
  onNext?: () => Promise<boolean> | boolean
  /** When provided, Next/Submit is disabled when this returns false. Omit to allow proceeding. */
  canProceed?: () => boolean
}

export type WizardProps = {
  isOpen?: boolean
  canQuit?: boolean
  defaultStep?: number
  logo?: React.ReactNode
  headerActions?: React.ReactNode
  steps: WizardStep[]
  onCancel?: () => void
  onSubmit?: () => void
}

export function Wizard({
  isOpen = true,
  canQuit = true,
  defaultStep = 0,
  logo,
  headerActions,
  steps,
  onCancel,
  onSubmit,
}: WizardProps) {
  const [currentStep, setCurrentStep] = React.useState(defaultStep)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleNext = async () => {
    const step = steps[currentStep]

    if (step && step.onNext) {
      setIsLoading(true)
      try {
        const result = await step.onNext()
        if (!result) {
          setIsLoading(false)
          return
        }
      } catch (error) {
        setIsLoading(false)
        throw error
      }
      setIsLoading(false)
    }

    if (currentStep === steps.length - 1) {
      onSubmit?.()
    } else {
      setCurrentStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep((s) => Math.max(0, s - 1))
  }

  // Handle case where steps is empty
  if (!steps || steps.length === 0 || !steps[currentStep]) {
    return null
  }

  const currentStepData = steps[currentStep]
  const canProceed = currentStepData.canProceed?.() ?? true

  if (!isOpen) {
    return null
  }

  const wizardContent = (
    <div className="dark:bg-background fixed inset-0 z-[9999] flex h-screen max-h-screen w-screen flex-col overflow-hidden bg-slate-50/50 antialiased">
      {/* 1 - Header */}
      <header className="border-border/40 bg-background/80 flex h-12 flex-shrink-0 items-center justify-between border-b px-4 backdrop-blur-md sm:h-14 sm:px-6">
        <div className="flex items-center">{logo}</div>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {headerActions}
          {canQuit && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-8 w-8"
              onClick={onCancel}
              aria-label="Cancel">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      {/* 2 - Step Content */}
      <main className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col justify-start overflow-y-auto px-4 py-3 sm:px-6 md:justify-center md:overflow-hidden md:px-8 md:py-4">
        <div className="flex w-full flex-col justify-start md:h-full md:min-h-0 md:flex-1 md:justify-center">
          {currentStepData.title && (
            <div className="mb-2.5 shrink-0 sm:mb-3">
              <div className="mb-0.5 flex items-center gap-2">
                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider sm:text-[11px]">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <h1 className="text-foreground text-lg font-bold tracking-tight sm:text-xl md:text-2xl">
                {currentStepData.title}
              </h1>
              {currentStepData.subtitle && (
                <div className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
                  {currentStepData.subtitle}
                </div>
              )}
            </div>
          )}
          <div className="w-full pb-6 md:flex md:min-h-0 md:flex-1 md:flex-col md:justify-center md:overflow-hidden md:pb-0">
            {currentStepData.component}
          </div>
        </div>
      </main>

      {/* 3 - Footer Area */}
      <footer className="border-border/40 bg-background/95 relative z-10 w-full flex-shrink-0 border-t px-4 py-2.5 backdrop-blur-sm sm:px-6 sm:py-3">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
          {/* Progress Indicator */}
          <div className="flex h-1.5 gap-1.5 opacity-90 transition-opacity hover:opacity-100">
            {steps.map((_, index) => (
              <div
                key={index}
                className="bg-muted flex-1 overflow-hidden rounded-full"
                aria-hidden="true">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: index <= currentStep ? '100%' : '0%' }}
                />
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground -ml-2 h-9 px-3 text-sm font-medium"
              onClick={handleBack}
              disabled={currentStep === 0 || isLoading}>
              Back
            </Button>
            <Button
              className="shadow-xs h-9 px-6 text-sm font-medium"
              onClick={handleNext}
              isLoading={isLoading}
              disabled={isLoading || !canProceed}>
              {currentStep === steps.length - 1 ? 'Submit' : 'Continue'}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )

  return createPortal(wizardContent, document.body)
}
