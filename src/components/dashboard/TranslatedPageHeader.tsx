"use client";

import { PageHeader } from "./PageHeader";
import { usePreferences } from "@/components/providers/PreferencesProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

export function TranslatedPageHeader({
  titleKey,
  descriptionKey,
  children,
}: {
  titleKey: TranslationKey;
  descriptionKey?: TranslationKey;
  children?: React.ReactNode;
}) {
  const { t } = usePreferences();

  return (
    <PageHeader
      title={t(titleKey)}
      description={descriptionKey ? t(descriptionKey) : undefined}
    >
      {children}
    </PageHeader>
  );
}
