import { useAtomValue } from 'jotai';
import React, { ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import { messages } from '../i18n';
import { languageAtom } from '../store/language';

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useAtomValue(languageAtom);
  // Default to English if the stored locale is invalid
  const currentMessages = messages[locale as keyof typeof messages] || messages.en;

  return (
    <IntlProvider locale={locale} messages={currentMessages} defaultLocale="en">
      {children}
    </IntlProvider>
  );
}
