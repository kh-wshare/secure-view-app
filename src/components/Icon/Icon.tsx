import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { iconPaths, IconName } from './paths';

export type IconProps = {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
  filled?: boolean;
};

/** Shared outline icon. Always pass an explicit `color` from theme.colors. */
export function Icon({ name, size = 20, color, strokeWidth = 1.75, filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={iconPaths[name]}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
    </Svg>
  );
}
