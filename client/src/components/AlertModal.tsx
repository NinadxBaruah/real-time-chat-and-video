import React from "react";

interface AlertModalProps {
  message: string;
  color?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({ message, color }) => {
  const backgroundColor = color;
  return (
    <>
    {console.log("from alert")}
    <div
      className={`absolute top-3 left-1/2 transform -translate-x-1/2 ${backgroundColor} rounded-full z-50 animate-slideDown`}
    >
      <span className="text-white text-xs p-3">{message}</span>
    </div>
    </>
  );
};
