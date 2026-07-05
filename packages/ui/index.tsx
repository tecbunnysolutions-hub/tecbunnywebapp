import * as React from "react";

export const SharedButton = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button style={{ padding: "0.5rem 1rem", background: "blue", color: "white", borderRadius: "4px" }} {...props}>
      {children}
    </button>
  );
};
