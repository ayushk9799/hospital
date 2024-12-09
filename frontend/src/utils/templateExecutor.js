import React from "react";
import * as Babel from "@babel/standalone";

// Function to create a React component from a JSX string
export const createComponentFromTemplate = (templateString) => {
  return async ({ hospitalInfo }) => {
    // Transpile the JSX string into JavaScript
    const transpiledCode = Babel.transform(templateString, {
        presets: [
            ["env", { modules: false }], // Use ES modules
            "react", // Transform JSX into React code
          ],
    }).code;
    const dataUrl = 'data:text/javascript;base64,' + btoa(transpiledCode);
    // Use eval to evaluate the transpiled code into a React component
    return (await import(dataUrl)).default;    
    // Render the resulting component

  };
};
