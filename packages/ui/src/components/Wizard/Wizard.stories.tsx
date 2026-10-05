import type { StoryObj } from '@storybook/react'
import * as React from 'react'

import { Button } from '../Button'
import { Wizard } from './index'

type Story = StoryObj<typeof Wizard>

export default {
  title: 'Components/Wizard',
  component: Wizard,
  parameters: {
    layout: 'centered',
  },
}

// Mock dummy steps for the story
const DefaultSteps = [
  {
    id: 'step-1',
    title: 'Welcome',
    component: (
      <div className="flex flex-col gap-4 text-left">
        <p className="text-muted-foreground w-full max-w-sm">
          Let&apos;s get your account set up. This will only take a few minutes.
        </p>
      </div>
    ),
  },
  {
    id: 'step-2',
    title: 'Personal Info',
    component: (
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">First Name</label>
            <input
              type="text"
              className="rounded-md border px-3 py-2"
              placeholder="John"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Last Name</label>
            <input
              type="text"
              className="rounded-md border px-3 py-2"
              placeholder="Doe"
            />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'step-3',
    title: 'Async Step',
    component: (
      <div className="flex flex-col gap-4 text-left">
        <p className="text-muted-foreground max-w-sm">
          Clicking &quot;Next&quot; will simulate a 2-second async request.
          Watch the button and navigation states!
        </p>
      </div>
    ),
    onNext: async () => {
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          resolve(true)
        }, 2000)
      })
    },
  },
  {
    id: 'step-4',
    title: 'Completed',
    component: (
      <div className="flex flex-col gap-4 text-left">
        <div className="bg-primary/20 text-primary mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl">
          ✓
        </div>
        <p className="text-muted-foreground">
          You are ready to start using the platform.
        </p>
      </div>
    ),
  },
]

function WizardDemo() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Wizard</Button>
      <Wizard
        isOpen={isOpen}
        logo={<div className="text-xl font-bold tracking-tight">AppLogo</div>}
        steps={DefaultSteps}
        onCancel={() => setIsOpen(false)}
        onSubmit={() => {
          alert('Wizard Completed!')
          setIsOpen(false)
        }}
      />
    </div>
  )
}

export const Default: Story = {
  render: () => <WizardDemo />,
}

function WizardWithCanProceedDemo() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [name, setName] = React.useState('')

  const stepsWithValidation: React.ComponentProps<typeof Wizard>['steps'] = [
    {
      id: 'name',
      title: 'Your name',
      component: (
        <div className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            Enter at least 2 characters to enable Continue.
          </p>
          <input
            type="text"
            className="rounded-md border px-3 py-2"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      ),
      canProceed: () => name.trim().length >= 2,
    },
    {
      id: 'done',
      title: 'Done',
      component: (
        <p className="text-muted-foreground">
          You can proceed to the next step.
        </p>
      ),
    },
  ]

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Wizard (canProceed)</Button>
      <Wizard
        isOpen={isOpen}
        logo={<div className="text-xl font-bold tracking-tight">AppLogo</div>}
        steps={stepsWithValidation}
        onCancel={() => setIsOpen(false)}
        onSubmit={() => {
          alert('Done!')
          setIsOpen(false)
        }}
      />
    </div>
  )
}

export const WithStepValidation: Story = {
  render: () => <WizardWithCanProceedDemo />,
}
