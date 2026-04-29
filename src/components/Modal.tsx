import React from "react";

interface ModalProps {
  isOpen: boolean;
  children: React.ReactNode;
}

export function Modal(props: ModalProps) {
  if (!props.isOpen) return null;
  return <div className="modal">{props.children}</div>;
}
