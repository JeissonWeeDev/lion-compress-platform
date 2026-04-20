import React from "react";

interface InputProps {
  placeholder: string;
  value: string;
  onChange?: (value: string) => void;
}

export function Input(props: InputProps) {
  return <input placeholder={props.placeholder} value={props.value} />;
}
