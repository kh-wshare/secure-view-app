import React from 'react';
import { ViewProps } from 'react-native';
import { Card as HeroCard } from 'heroui-native';

/**
 * Thin themed-container wrapper around HeroUI Native's <Card variant="default">.
 * Screens keep using this the same way they always have — passing a `style`
 * object for one-off padding/gap/border overrides — rather than switching to
 * Card.Header/Body/Footer/Title/Description subcomponents, since this app's
 * screens still style with the legacy StyleSheet/theme system for now.
 */
export function Card({ style, ...rest }: ViewProps) {
  return <HeroCard variant="default" style={style} {...rest} />;
}
