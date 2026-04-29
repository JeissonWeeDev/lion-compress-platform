import React from "react";

interface ModalProps {
  isOpen: boolean;
  children: React.ReactNode;
}

export function Modal(props: ModalProps) {
  if (!props.isOpen) return null;
  const style = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
  };
  return (
    <div style={style} className="modal">
      {props.children}
    </div>
  );
}
