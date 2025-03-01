import React, { CSSProperties } from "react";

import styles from "./Action.module.css";
import { cn } from "@/lib/utils";

export interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  active?: {
    fill: string;
    background: string;
  };
  cursor?: CSSProperties["cursor"];
}

export function Action({ active, className, cursor, style, ...props }: Props) {
  return (
    <button
      {...props}
      className={cn(styles.Action, className)}
      tabIndex={0}
      style={
        {
          ...style,
          cursor,
          "--fill": active?.fill,
          "--background": active?.background,
        } as CSSProperties
      }
    />
  );
}
