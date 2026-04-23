import React from "react";

interface ContainerProps {
  children: React.ReactNode;
}

export function Container(props: ContainerProps) {
  const style = { maxWidth: "1200px", margin: "0 auto", padding: "16px" };
  return <div style={style}>{props.children}</div>;
}
