import React, { useState, useEffect, useRef, forwardRef } from "react";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { ChevronsUpDown } from "lucide-react";
import { X } from "lucide-react";

const MultiSelectInput = forwardRef(
  (
    {
      suggestions = [],
      placeholder,
      selectedValues,
      setSelectedValues,
      onSuggestionSelect,
    },
    ref
  ) => {
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const suggestionListRef = useRef(null);

    useEffect(() => {
      const filtered = suggestions.filter((suggestion) =>
        suggestion.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }, [inputValue, suggestions]);

    const handleInputChange = (e) => {
      setInputValue(e.target.value);
      setShowSuggestions(true);
    };

    const handleSuggestionClick = (suggestion) => {
      if (!selectedValues?.some((val) => val.name === suggestion.name)) {
        const newSelectedValues = [...selectedValues, suggestion];
        setSelectedValues(newSelectedValues);
        if (onSuggestionSelect) {
          onSuggestionSelect(newSelectedValues);
        }
      }
      setInputValue("");
      setShowSuggestions(false);
      if (ref && ref.current) {
        ref.current.focus();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        setSelectedValues([...selectedValues, { name: inputValue }]);
        setInputValue("");
        setShowSuggestions(false);
        if (ref && ref.current) {
          ref.current.focus();
        }
      }
    };

    return (
      <div className="relative w-full max-w-md">
        <div className="relative flex flex-wrap gap-2">
          <Input
            ref={ref}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder || "Search or type"}
            className="pr-8 hover:cursor-pointer font-semibold"
          />
          <ChevronsUpDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
        </div>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <ul
            ref={suggestionListRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <li
                key={suggestion.name}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                <span className="capitalize">{suggestion.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

export default MultiSelectInput;
