import { toPng } from 'html-to-image';

export type ExportToPngOptions = {
  fileName?: string;
  pixelRatio?: number; // capture scale (3=crisper)
  backgroundColor?: string;
  width?: number;
  height?: number;
  filter?: (node: HTMLElement) => boolean;
};

function defaultBackground(): string {
  try {
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? '#0b1220' : '#ffffff';
  } catch {
    return '#ffffff';
  }
}

function defaultFilter(node: HTMLElement): boolean {
  // Exclude elements marked explicitly for exclusion
  if (node.hasAttribute('data-export-exclude')) return false;
  return true;
}

export async function exportNodeToPNG(
  node: HTMLElement,
  options: ExportToPngOptions = {}
): Promise<void> {
  const fileName = options.fileName || 'carb-cycling-plan.png';

  // Prefer full scroll size to avoid clipping scrollable areas
  const width = options.width ?? (node as HTMLElement).scrollWidth;
  const height = options.height ?? (node as HTMLElement).scrollHeight;

  const dataUrl = await toPng(node, {
    backgroundColor: options.backgroundColor ?? defaultBackground(),
    pixelRatio: options.pixelRatio ?? 3,
    width,
    height,
    filter: (n) => {
      if (!(n instanceof HTMLElement)) return true;
      const userFilter = options.filter ?? defaultFilter;
      return userFilter(n);
    },
    style: {
      // Ensure we capture complete content without current scroll
      transform: 'scale(1)',
      transformOrigin: 'top left',
    },
  });

  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  link.click();
}
