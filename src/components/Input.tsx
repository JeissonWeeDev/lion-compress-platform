import React from "react";

interface InputProps {
  placeholder: string;
  value: string;
  onChange?: (value: string) => void;
}

export function Input(props: InputProps) {
  const style = { padding: "8px", border: "1px solid #ccc", borderRadius: "4px" };
  return <input style={style} placeholder={props.placeholder} value={props.value} />;
}
