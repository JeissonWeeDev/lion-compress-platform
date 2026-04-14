import React from "react";

interface ButtonProps {
  label: string;
  onClick?: () => void;
}

export function Button(props: ButtonProps) {
  const style = { padding: "8px 16px", background: "#007bff", color: "#fff" };
  return (
    <button style={style} onClick={props.onClick}>
      {props.label}
    </button>
  );
}
