import { View } from 'react-native';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
      }}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const isActive = index + 1 === currentStep;
        return (
          <View
            key={index}
            style={{
              width: isActive ? 26 : 10,
              height: 10,
              backgroundColor: isActive ? '#3f46f9' : '#e5e7eb',
              borderRadius: 5,
            }}
          />
        );
      })}
    </View>
  );
}
