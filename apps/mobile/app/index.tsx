import Constants from 'expo-constants';
import { router, Stack } from 'expo-router';

import { Button } from '@app/mobile-ui';
import { useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/src/lib/hooks/useTranslation';
import OnboardingProgress from '../components/OnboardingProgress';

import Step1Svg from '../assets/onboarding/step-1.svg';
import Step2Svg from '../assets/onboarding/step-2.svg';
import Step3Svg from '../assets/onboarding/step-3.svg';

const ONBOARDING_STEPS = [
  { key: 'one', SvgComponent: Step1Svg },
  { key: 'two', SvgComponent: Step2Svg },
  { key: 'three', SvgComponent: Step3Svg },
] as const;

function OnBoarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('onboarding');
  const svgWidth = width * 0.8;

  const topPadding = Math.max(insets.top, 16);
  const bottomPadding = Math.max(insets.bottom, 24);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    router.push('/get-started');
  };

  const handleGetStarted = () => {
    router.push('/get-started');
  };

  const step = ONBOARDING_STEPS[currentStep - 1];
  const { SvgComponent } = step;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Skip Button */}
      <View className="absolute right-6 z-10" style={{ top: topPadding + 16 }}>
        <Button label={t('skip')} variant="tertiary" size="sm" onPress={handleSkip} />
      </View>

      {/* Main Content Container */}
      <View className="flex-1 justify-between">
        {/* Illustration */}
        <View
          className="flex-1 items-center justify-center"
          style={{
            paddingTop: topPadding + 48,
            paddingHorizontal: width * 0.1,
          }}>
          <SvgComponent width={svgWidth} />
        </View>

        {/* Bottom Content */}
        <View className="px-6" style={{ paddingBottom: bottomPadding + 16 }}>
          {/* Text Content */}
          <View className="items-center" style={{ marginBottom: Math.min(height * 0.04, 32) }}>
            <Text
              className="mb-4 text-center font-bold text-greyscale-900"
              style={{
                fontSize: Math.min(width * 0.064, 24),
                lineHeight: Math.min(width * 0.096, 36),
                maxWidth: width * 0.8,
              }}>
              {t(`steps.${step.key}.title`)}
            </Text>
            <Text
              className="text-center text-sm font-normal text-greyscale-400"
              style={{
                lineHeight: 22,
                maxWidth: width * 0.85,
              }}>
              {t(`steps.${step.key}.description`)}
            </Text>
          </View>

          {/* Progress Indicators */}
          <View className="items-center" style={{ marginBottom: Math.min(height * 0.04, 32) }}>
            <OnboardingProgress currentStep={currentStep} totalSteps={3} />
          </View>

          {/* Action Button */}
          <Button label={t('next')} size="lg" variant="primary" onPress={handleNext} />
        </View>
      </View>
    </SafeAreaView>
  );
}

let OnBoardingEntryPoint = OnBoarding;

console.log('⚙ EXPO CONFIG:', {
  extra: Constants.expoConfig?.extra,
});

if (Constants.expoConfig?.extra?.storybookEnabled === 'true') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  OnBoardingEntryPoint = require('../.rnstorybook').default;
}

export default OnBoardingEntryPoint;
