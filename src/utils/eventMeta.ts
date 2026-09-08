import type { EventSeverity, EventType } from '@/types/domain';
import type { IconName } from '@/components/Icon';
import type { ThemeColors } from '@/theme';

export const EVENT_TYPE_ICON: Record<EventType, IconName> = {
  person: 'person',
  vehicle: 'vehicle',
  motion: 'motion',
  cameraOnline: 'wifi',
  cameraOffline: 'cameraOff',
  recordingStarted: 'film',
  recordingStopped: 'film',
};

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  person: 'Person detected',
  vehicle: 'Vehicle detected',
  motion: 'Motion detected',
  cameraOnline: 'Camera back online',
  cameraOffline: 'Camera went offline',
  recordingStarted: 'Recording started',
  recordingStopped: 'Recording stopped',
};

/** Maps a severity to the theme color/tint pair it should render with. */
export function severityColor(
  colors: ThemeColors,
  severity: EventSeverity,
): { fg: string; tint: string } {
  switch (severity) {
    case 'critical':
    case 'high':
      return { fg: colors.live, tint: colors.liveTint };
    case 'medium':
      return { fg: colors.warning, tint: colors.warningTint };
    case 'low':
      return { fg: colors.info, tint: colors.infoTint };
    case 'info':
    default:
      return { fg: colors.textSecondary, tint: colors.bgElevated2 };
  }
}

export const SEVERITY_LABEL: Record<EventSeverity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  info: 'Info',
};
