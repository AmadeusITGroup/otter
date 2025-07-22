/** List of icons proposed by the otter-picker */
export const OTTER_ICONS = [
  '/assets/otter.svg',
  '/assets/mini-otters/astronotter.svg',
  '/assets/mini-otters/bonotter.svg',
  '/assets/mini-otters/c3potter.svg',
  '/assets/mini-otters/colombotter.svg',
  '/assets/mini-otters/djokotter.svg',
  '/assets/mini-otters/hallowtter.svg',
  '/assets/mini-otters/harry-otter.svg',
  '/assets/mini-otters/jack-sparrowtter.svg',
  '/assets/mini-otters/mandalotter.svg',
  '/assets/mini-otters/mariotter.svg',
  '/assets/mini-otters/neotter.svg',
  '/assets/mini-otters/pizzaiotter.svg',
  '/assets/mini-otters/ronaldotter.svg',
  '/assets/mini-otters/sombrerotter.svg'
] as const;

/**
 * Check if the given path corresponds to an icon proposed by the otter-picker
 * @param path
 */
export const isOtterIcon = (path: string): path is typeof OTTER_ICONS[number] => {
  return OTTER_ICONS.includes(path as typeof OTTER_ICONS[number]);
};
