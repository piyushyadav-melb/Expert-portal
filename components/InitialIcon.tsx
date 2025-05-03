import React from "react";

interface InitialIconProps {
  initial: string;
  bgColor?: string;
  textColor?: string;
}

export const InitialIcon: React.FC<InitialIconProps> = ({
  initial,
  bgColor = "#e0e7ff", // default bg color (light indigo)
  textColor = "#3730a3", // default text color (indigo-800)
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 32,
      height: 32,
      borderRadius: "50%",
      background: bgColor,
      color: textColor,
      fontWeight: 700,
      fontSize: 18,
      userSelect: "none",
    }}
  >
    {initial}
  </span>
);
