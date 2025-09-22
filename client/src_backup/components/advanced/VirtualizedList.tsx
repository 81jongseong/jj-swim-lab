'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 고급 TypeScript 패턴: Generic Constraints와 Mapped Types
interface VirtualizedItem {
  id: string | number;
  [key: string]: unknown;
}

interface VirtualizedListProps<T extends VirtualizedItem> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
  onScroll?: (scrollTop: number) => void;
  enableAnimation?: boolean;
  className?: string;
  itemClassName?: string;
}

// 가상화된 리스트 컴포넌트
export function VirtualizedList<T extends VirtualizedItem>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
  renderItem,
  keyExtractor = (item) => item.id,
  onScroll,
  enableAnimation = true,
  className = '',
  itemClassName = ''
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 가상화 계산
  const virtualizedData = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length - 1
    );

    const visibleItems = items.slice(startIndex, endIndex + 1);
    const offsetY = startIndex * itemHeight;

    return {
      startIndex,
      endIndex,
      visibleItems,
      offsetY,
      totalHeight: items.length * itemHeight
    };
  }, [items, itemHeight, containerHeight, overscan, scrollTop]);

  // 스크롤 핸들러
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // 스크롤 위치 복원
  const scrollToIndex = useCallback((index: number) => {
    if (containerRef.current) {
      const targetScrollTop = index * itemHeight;
      containerRef.current.scrollTop = targetScrollTop;
    }
  }, [itemHeight]);

  // 스크롤 위치 복원 (아이템 ID로)
  const scrollToItem = useCallback((itemId: string | number) => {
    const index = items.findIndex(item => keyExtractor(item, 0) === itemId);
    if (index !== -1) {
      scrollToIndex(index);
    }
  }, [items, keyExtractor, scrollToIndex]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: virtualizedData.totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${virtualizedData.offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {enableAnimation ? (
            <AnimatePresence>
              {virtualizedData.visibleItems.map((item, index) => (
                <motion.div
                  key={keyExtractor(item, virtualizedData.startIndex + index)}
                  className={itemClassName}
                  style={{ height: itemHeight }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderItem(item, virtualizedData.startIndex + index)}
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            virtualizedData.visibleItems.map((item, index) => (
              <div
                key={keyExtractor(item, virtualizedData.startIndex + index)}
                className={itemClassName}
                style={{ height: itemHeight }}
              >
                {renderItem(item, virtualizedData.startIndex + index)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// 무한 스크롤 가상화 리스트
interface InfiniteVirtualizedListProps<T extends VirtualizedItem> extends Omit<VirtualizedListProps<T>, 'items'> {
  items: T[];
  hasMore: boolean;
  loadMore: () => void;
  loadingComponent?: React.ReactNode;
  threshold?: number;
}

export function InfiniteVirtualizedList<T extends VirtualizedItem>({
  items,
  hasMore,
  loadMore,
  loadingComponent,
  threshold = 100,
  ...props
}: InfiniteVirtualizedListProps<T>) {
  const [isLoading, setIsLoading] = useState(false);

  const handleScroll = useCallback((scrollTop: number) => {
    if (isLoading || !hasMore) return;

    const totalHeight = items.length * props.itemHeight;
    const scrollBottom = scrollTop + props.containerHeight;
    const distanceFromBottom = totalHeight - scrollBottom;

    if (distanceFromBottom < threshold) {
      setIsLoading(true);
      loadMore();
    }
  }, [isLoading, hasMore, loadMore, threshold, props]);

  useEffect(() => {
    if (isLoading) {
      setIsLoading(false);
    }
  }, [items.length]);

  const allItems = useMemo(() => {
    const loadingItem = {
      id: 'loading',
      type: 'loading'
    } as unknown as T;

    return hasMore ? [...items, loadingItem] : items;
  }, [items, hasMore]);

  const renderItem = useCallback((item: T, index: number) => {
    if (item.id === 'loading') {
      return loadingComponent || <div>Loading...</div>;
    }
    return props.renderItem(item, index);
  }, [props.renderItem, loadingComponent]);

  return (
    <VirtualizedList
      {...props}
      items={allItems}
      renderItem={renderItem}
      onScroll={handleScroll}
    />
  );
}

// 그리드 가상화 리스트
interface VirtualizedGridProps<T extends VirtualizedItem> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  gap?: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
  className?: string;
}

export function VirtualizedGrid<T extends VirtualizedItem>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  gap = 0,
  overscan = 5,
  renderItem,
  keyExtractor = (item) => item.id,
  className = ''
}: VirtualizedGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const virtualizedData = useMemo(() => {
    const itemsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
    const totalRows = Math.ceil(items.length / itemsPerRow);
    
    const startRow = Math.floor(scrollTop / (itemHeight + gap));
    const endRow = Math.min(
      startRow + Math.ceil(containerHeight / (itemHeight + gap)) + overscan,
      totalRows - 1
    );

    const visibleItems = [];
    for (let row = startRow; row <= endRow; row++) {
      for (let col = 0; col < itemsPerRow; col++) {
        const index = row * itemsPerRow + col;
        if (index < items.length) {
          visibleItems.push({
            item: items[index],
            index,
            row,
            col,
            x: col * (itemWidth + gap),
            y: row * (itemHeight + gap)
          });
        }
      }
    }

    return {
      startRow,
      endRow,
      visibleItems,
      totalHeight: totalRows * (itemHeight + gap),
      totalWidth: itemsPerRow * (itemWidth + gap)
    };
  }, [items, itemWidth, itemHeight, containerWidth, containerHeight, gap, overscan, scrollTop]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
    setScrollLeft(e.currentTarget.scrollLeft);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ width: containerWidth, height: containerHeight }}
      onScroll={handleScroll}
    >
      <div
        style={{
          width: virtualizedData.totalWidth,
          height: virtualizedData.totalHeight,
          position: 'relative'
        }}
      >
        {virtualizedData.visibleItems.map(({ item, index, x, y }) => (
          <motion.div
            key={keyExtractor(item, index)}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: itemWidth,
              height: itemHeight
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// 성능 최적화된 리스트 훅
export const useVirtualizedList = <T extends VirtualizedItem>(
  items: T[],
  options: {
    itemHeight: number;
    containerHeight: number;
    overscan?: number;
  }
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const virtualizedData = useMemo(() => {
    const { itemHeight, containerHeight, overscan = 5 } = options;
    
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length - 1
    );

    return {
      startIndex,
      endIndex,
      visibleItems: items.slice(startIndex, endIndex + 1),
      offsetY: startIndex * itemHeight,
      totalHeight: items.length * itemHeight
    };
  }, [items, options, scrollTop]);

  const scrollToIndex = useCallback((index: number) => {
    setScrollTop(index * options.itemHeight);
  }, [options.itemHeight]);

  return {
    ...virtualizedData,
    scrollTop,
    setScrollTop,
    scrollToIndex
  };
};

export default VirtualizedList;
