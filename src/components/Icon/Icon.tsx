import React from 'react';
import { SvgXml } from 'react-native-svg';
import { iconData, IconName } from './paths';

export type IconProps = {
  name: IconName;
  size?: number;
  color: string;
  /**
   * Retained for backwards compatibility with existing call sites. Solar
   * glyphs (see paths.ts) bake in their own stroke weight per style, so
   * this no longer has an effect — no current call site overrides it.
   */
  strokeWidth?: number;
  /** Use the Solar "Bold" variant instead of "Linear", where available. */
  filled?: boolean;
};

/** Shared outline icon, sourced from the Solar icon set. Always pass an explicit `color` from theme.colors. */
export function Icon({ name, size = 20, color, filled = false }: IconProps) {
  const entry = iconData[name];
  const body = (filled && 'boldBody' in entry && entry.boldBody) ? entry.boldBody : entry.body;
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${body}</svg>`.replace(
    /currentColor/g,
    color,
  );
  return <SvgXml xml={xml} width={size} height={size} />;
}
