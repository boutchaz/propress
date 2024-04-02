import React, { forwardRef, HTMLAttributes } from "react";

import { Action } from "./Action";
import { GripHorizontal, SquarePen } from "lucide-react";
import styles from "./TreeItem.module.css";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDialogStore } from "@/hooks/useDialog";

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
      ...props
    },
    ref
  ) => {
    const handleOpenDialog = () => {
      const { open, setItemId } = useDialogStore.getState();
      setItemId(depth ? `item_${uuid}` : `section_${uuid}`);
      open();
      console.log("props");
    };
    return (
      <li
        // className={cn(
        //   styles.Wrapper,
        //   clone && styles.clone,
        //   ghost && styles.ghost,
        //   indicator && styles.indicator,
        //   disableSelection && styles.disableSelection,
        //   disableInteraction && styles.disableInteraction
        // )}
        className={`list-none box-border mb-[-1px] pl-[var(--spacing)] ${clone ? "inline-block pointer-events-none p-0 ml-2.5 mt-1.25" : ""}`}
        ref={wrapperRef}
        style={
          {
            "--spacing": `${indentationWidth * depth}px`,
          } as React.CSSProperties
        }
        {...props}
      >
        <div
          className="relative flex items-center p-[var(--vertical-padding)] px-2.5 bg-white border border-gray-300 text-gray-800"
          ref={ref}
          style={style}
        >
          <GripHorizontal {...handleProps} />
          {onCollapse && (
            <Action
              onClick={onCollapse}
              className={cn(
                `transition-transform duration-250 ease-in-out mx-4 ${collapsed ? "transform rotate-[-90deg]" : ""}`
              )}
            >
              <ChevronDown />
            </Action>
          )}
          <span className="flex-grow pl-2 whitespace-nowrap overflow-hidden text-ellipsis">
            {value}
          </span>
          <Button variant="ghost" onClick={handleOpenDialog}>
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

const collapseIcon = (
  <svg width="10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 41">
    <path d="M30.76 39.2402C31.885 40.3638 33.41 40.995 35 40.995C36.59 40.995 38.115 40.3638 39.24 39.2402L68.24 10.2402C69.2998 9.10284 69.8768 7.59846 69.8494 6.04406C69.822 4.48965 69.1923 3.00657 68.093 1.90726C66.9937 0.807959 65.5106 0.178263 63.9562 0.150837C62.4018 0.123411 60.8974 0.700397 59.76 1.76024L35 26.5102L10.24 1.76024C9.10259 0.700397 7.59822 0.123411 6.04381 0.150837C4.4894 0.178263 3.00632 0.807959 1.90702 1.90726C0.807714 3.00657 0.178019 4.48965 0.150593 6.04406C0.123167 7.59846 0.700153 9.10284 1.75999 10.2402L30.76 39.2402Z" />
  </svg>
);
