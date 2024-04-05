import React, { forwardRef, HTMLAttributes, useMemo } from "react";

import { Action } from "./Action";
import { GripHorizontal, SquarePen, CirclePlus } from "lucide-react";
import styles from "./TreeItem.module.css";
import { ChevronDown } from "lucide-react";
import { cn, hexToRgb } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDrawerStore } from "@/hooks/useDrawer";
import classNames from "classnames";

export interface Props extends HTMLAttributes<HTMLLIElement> {
  childCount?: number;
  clone?: boolean;
  collapsed?: boolean;
  depth: number;
  disableInteraction?: boolean;
  disableSelection?: boolean;
  ghost?: boolean;
  handleProps?: any;
  indicator?: boolean;
  indentationWidth: number;
  value: string;
  uuid?: string;
  color?: string;
  sectionID?: string;
  name?: string;
  onCollapse?(): void;
  onRemove?(): void;
  wrapperRef?(node: HTMLLIElement): void;
}

export const TreeItem = forwardRef<HTMLDivElement, Props>(
  (
    {
      childCount,
      clone,
      depth,
      disableSelection,
      disableInteraction,
      ghost,
      handleProps,
      indentationWidth,
      indicator,
      collapsed,
      onCollapse,
      onRemove,
      style,
      value,
      wrapperRef,
      uuid,
      color,
      sectionID,
      name,
      ...props
    },
    ref
  ) => {
    const { toggle, setItemId } = useDrawerStore();

    const handleUpdate = () => {
      setItemId(depth ? `item_${uuid}_${sectionID}` : `section_${uuid}`);
      toggle(); // This assumes toggle is the correct method to use
    };
    const handleInsert = () => {
      setItemId(`item_new_${sectionID}`);
      toggle(); // This assumes toggle is the correct method to use
    };
    return (
      <li
        className={classNames(
          styles.Wrapper,
          clone && styles.clone,
          ghost && styles.ghost,
          indicator && styles.indicator,
          disableSelection && styles.disableSelection,
          disableInteraction && styles.disableInteraction
        )}
        ref={wrapperRef}
        {...props}
        style={
          {
            "--spacing": `${indentationWidth * depth}px`,
          } as React.CSSProperties
        }
      >
        <div
          className="relative flex items-center p-[var(--vertical-padding)] px-2.5 bg-white border border-gray-300 text-gray-800"
          ref={ref}
          style={{
            ...style,
          }}
        >
          <GripHorizontal {...handleProps} />
          {onCollapse && (
            <Action
              onClick={(e: any) => {
                e.stopPropagation();
                e.preventDefault();
                onCollapse();
              }}
              className={classNames(
                styles.Collapse,
                collapsed && styles.collapsed
              )}
            >
              <ChevronDown />
            </Action>
          )}
          <span
            className="flex-grow pl-2 whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ color: color }}
          >
            {name}
          </span>
          {depth === 0 && (
            <Button
              variant="ghost"
              onClick={handleInsert}
              className="dark:text-dark"
            >
              <CirclePlus />
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={handleUpdate}
            className="dark:text-dark"
          >
            <SquarePen />
          </Button>
          {/* {!clone && onRemove && <Remove onClick={onRemove} />} */}
          {clone && childCount && childCount > 1 ? (
            <span className="absolute top-[-10px] right-[-10px] flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-xs font-semibold text-white">
              {childCount}
            </span>
          ) : null}
        </div>
      </li>
    );
  }
);
