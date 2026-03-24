import { HTMLAttributes, ElementType } from "react";
import { clsx } from "clsx";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType;
}

export function Container({ as: Tag = "div", className, children, ...props }: ContainerProps) {
  const Component = Tag as "div";
  return (
    <Component
      className={clsx(
        "mx-auto w-full max-w-[1280px] px-6 md:px-12",
        className
      )}
      {...(props as HTMLAttributes<HTMLDivElement>)}
    >
      {children}
    </Component>
  );
}
