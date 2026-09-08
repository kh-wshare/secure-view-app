import React from 'react';
import { ViewStyle } from 'react-native';
import { Skeleton } from 'heroui-native';

export type LoadingSkeletonProps = {
  width: number | `${number}%`;
  height: number;
  radius?: number;
  style?: ViewStyle;
};

/** Shimmering placeholder block for camera thumbnails, list rows, dashboard cards, timelines. */
export function LoadingSkeleton({ width, height, radius = 8, style }: LoadingSkeletonProps) {
  return <Skeleton style={[{ width, height, borderRadius: radius }, style]} />;
}
