import React from "react";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "full";
}

const sizeClasses = { sm: "max-w-2xl", md: "max-w-4xl", lg: "max-w-6xl", full: "max-w-full" };

export const Container: React.FC<ContainerProps> = ({ size = "lg", className = "", children, ...rest }) => {
  return (
    <div className={`w-full mx-auto px-4 sm:px-6 ${sizeClasses[size]} ${className}`} {...rest}>
      {children}
    </div>
  );
};

export default Container;