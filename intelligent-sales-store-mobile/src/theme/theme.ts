import { colors } from './colors';
import { elevation } from './elevation';
import { radius } from './radius';
import { spacing } from './spacing';
import { typography } from './typography';

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  elevation,
} as const;

export type AppTheme = typeof theme;
