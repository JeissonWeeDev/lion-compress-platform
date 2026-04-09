import React from "react";

interface CardProps {
  title: string;
}

export function Card(props: CardProps) {
  const style = { padding: "16px", border: "1px solid #ccc" };
  return <div style={style}>{props.title}</div>;
}
