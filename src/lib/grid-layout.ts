import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';

export interface DragData {
  type: string;
  day: number;
  dayData: {
    day: number;
    type: string;
    carbs: number;
    fat: number;
    protein: number;
    calories: number;
  };
}

export interface GridDragDropOptions {
  element: HTMLElement;
  dayData: DragData['dayData'];
  onDragStart: () => void;
  onDrop: () => void;
}

export interface GridDropTargetOptions {
  element: HTMLElement;
  onDrop: (dragData: DragData, targetIndex: number) => void;
  onDragLeave: () => void;
}

export interface CellDropTargetOptions {
  element: HTMLElement;
  index: number;
}

export const getDayTypeDisplay = (type: string, t: (key: string) => string) => {
  switch (type) {
    case 'high':
      return t('results.dayTypes.high');
    case 'medium':
      return t('results.dayTypes.medium');
    case 'low':
      return t('results.dayTypes.low');
    default:
      return type;
  }
};

export const createDraggableCard = ({
  element,
  dayData,
  onDragStart,
  onDrop,
}: GridDragDropOptions) => {
  return combine(
    draggable({
      element,
      getInitialData: () => ({
        type: 'card',
        day: dayData.day,
        dayData,
      }),
      onDragStart,
      onDrop,
    })
  );
};

export const createGridDropTarget = ({
  element,
  onDrop,
  onDragLeave,
}: GridDropTargetOptions) => {
  return dropTargetForElements({
    element,
    canDrop: ({ source }) => source.data.type === 'card',
    onDragEnter: () => {},
    onDragLeave,
    onDrop: ({ source, location }) => {
      // 获取拖放的目标位置
      const dropTargets = location.current.dropTargets;
      if (dropTargets.length > 0) {
        const targetIndex = dropTargets[0].data.gridIndex as number;
        if (typeof targetIndex === 'number') {
          onDrop(source.data as unknown as DragData, targetIndex);
        }
      }
    },
  });
};

export const createCellDropTarget = ({
  element,
  index,
}: CellDropTargetOptions) => {
  return dropTargetForElements({
    element,
    getData: () => ({ gridIndex: index }),
    canDrop: ({ source }) => source.data.type === 'card',
    onDragEnter: () => {},
    onDragLeave: () => {},
  });
};
