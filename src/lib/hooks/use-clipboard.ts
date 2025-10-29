import { useState, useCallback } from 'react';
import type {
  MealPortion,
  MealSlotId,
  DayMealPlan,
} from '@/lib/persistence-types';
import { v4 as uuidv4 } from 'uuid';

/**
 * 剪贴板内容类型
 */
export type ClipboardType = 'slot' | 'day' | null;

/**
 * 剪贴板数据结构
 */
export interface ClipboardData {
  type: ClipboardType;
  slotData?: {
    slotId: MealSlotId;
    portions: MealPortion[];
  };
  dayData?: Partial<DayMealPlan>;
  timestamp: number;
}

/**
 * 剪贴板管理 hook
 * 用于复制/粘贴餐次和全天饮食计划
 */
export function useClipboard() {
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);

  /**
   * 复制单个餐次
   */
  const copySlot = useCallback(
    (slotId: MealSlotId, portions: MealPortion[]) => {
      // 深拷贝 portions，生成新的 ID
      const copiedPortions = portions.map((portion) => ({
        ...portion,
        id: uuidv4(), // 生成新 ID 避免冲突
      }));

      setClipboard({
        type: 'slot',
        slotData: {
          slotId,
          portions: copiedPortions,
        },
        timestamp: Date.now(),
      });
    },
    []
  );

  /**
   * 复制整天饮食计划
   */
  const copyDay = useCallback((dayMealPlan: Partial<DayMealPlan>) => {
    // 深拷贝所有餐次，生成新的 portion ID
    const copiedDayPlan: Partial<DayMealPlan> = {};

    Object.entries(dayMealPlan).forEach(([slotId, portions]) => {
      copiedDayPlan[slotId as MealSlotId] = portions.map((portion) => ({
        ...portion,
        id: uuidv4(),
      }));
    });

    setClipboard({
      type: 'day',
      dayData: copiedDayPlan,
      timestamp: Date.now(),
    });
  }, []);

  /**
   * 粘贴到指定餐次
   * @param currentPortions 当前餐次的 portions
   * @param mode 'replace' 替换 | 'append' 追加
   * @returns 粘贴后的 portions，如果无法粘贴则返回 null
   */
  const pasteToSlot = useCallback(
    (
      currentPortions: MealPortion[],
      mode: 'replace' | 'append' = 'replace'
    ): MealPortion[] | null => {
      if (!clipboard || clipboard.type !== 'slot') {
        return null;
      }

      const { portions } = clipboard.slotData!;

      // 再次生成新 ID 以支持多次粘贴
      const newPortions = portions.map((portion) => ({
        ...portion,
        id: uuidv4(),
      }));

      if (mode === 'replace') {
        return newPortions;
      } else {
        return [...currentPortions, ...newPortions];
      }
    },
    [clipboard]
  );

  /**
   * 粘贴到指定的多天
   * @param dayMealPlans 目标天的饮食计划映射 { dayNumber: Partial<DayMealPlan> }
   * @param targetDays 目标天数组
   * @returns 更新后的饮食计划映射
   */
  const pasteToDays = useCallback(
    (
      dayMealPlans: Record<number, Partial<DayMealPlan>>,
      targetDays: number[]
    ): Record<number, Partial<DayMealPlan>> | null => {
      if (!clipboard || clipboard.type !== 'day') {
        return null;
      }

      const updatedPlans = { ...dayMealPlans };

      targetDays.forEach((dayNumber) => {
        const newDayPlan: Partial<DayMealPlan> = {};

        Object.entries(clipboard.dayData!).forEach(([slotId, portions]) => {
          // 为每天生成新的 portion ID
          newDayPlan[slotId as MealSlotId] = portions.map((portion) => ({
            ...portion,
            id: uuidv4(),
          }));
        });

        updatedPlans[dayNumber] = newDayPlan;
      });

      return updatedPlans;
    },
    [clipboard]
  );

  /**
   * 清空剪贴板
   */
  const clearClipboard = useCallback(() => {
    setClipboard(null);
  }, []);

  /**
   * 检查剪贴板是否有数据
   */
  const hasClipboardData = clipboard !== null;

  /**
   * 检查剪贴板是否包含餐次数据
   */
  const hasSlotData = clipboard?.type === 'slot';

  /**
   * 检查剪贴板是否包含全天数据
   */
  const hasDayData = clipboard?.type === 'day';

  return {
    clipboard,
    copySlot,
    copyDay,
    pasteToSlot,
    pasteToDays,
    clearClipboard,
    hasClipboardData,
    hasSlotData,
    hasDayData,
  };
}
