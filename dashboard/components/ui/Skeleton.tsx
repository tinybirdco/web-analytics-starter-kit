import { ComponentProps } from "react";

export function Skeleton({
  width = "100%",
  height = "100%",
  style,
  ...props
}: ComponentProps<"div"> & {
  width?: number | string;
  height?: number | string;
}) {
  return (
    <div
      style={{
        width,
        height,
        backgroundColor: "var(--background-01-color)",
        border: "1px solid transparent",
        borderRadius: 4,
        ...style,
      }}
      {...props}
    />
  );
}
