import type { SharedSelection } from '@heroui/react';

/** First selected key of a HeroUI Select selection, as a string ('' when nothing is selected). */
export const firstKey = (keys: SharedSelection): string => (keys === 'all' ? '' : String([...keys][0] ?? ''));
