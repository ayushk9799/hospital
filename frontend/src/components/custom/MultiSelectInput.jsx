import React, { useState, useEffect, useRef, forwardRef } from "react";
import { createPortal } from "react-dom";
import { Input } from "../ui/input";
import { ChartNoAxesColumnDecreasingIcon, ChevronsUpDown } from "lucide-react";
import { useFloating, offset, flip, shift } from "@floating-ui/react";
import { ScrollArea } from "../ui/scroll-area";

const MultiSelectInput = forwardRef(
  (
    {
      suggestions = [],
      placeholder,
      selectedValues,
      setSelectedValues,
      onSuggestionSelect,
      onError = false,
      height = true
    },
    ref
  ) => {
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const parentRef = useRef(null);

    useEffect(() => {
      const filtered = suggestions.filter((suggestion) =>
        suggestion?.name?.toLowerCase().includes(inputValue.toLowerCase())
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
      if (ref && ref?.current) {
        ref?.current?.focus();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        // First check if we have a highlighted suggestion
        if (
          highlightedIndex !== -1 &&
          showSuggestions &&
          filteredSuggestions.length > 0
        ) {
          handleSuggestionClick(filteredSuggestions[highlightedIndex]);
        }
        // Otherwise, add custom value if valid
        else {
          const trimmedValue = inputValue.trim();
          if (
            trimmedValue &&
            !selectedValues?.some((val) => val.name === trimmedValue)
          ) {
            const newSelectedValues = [
              ...selectedValues,
              { name: trimmedValue },
            ];
            setSelectedValues(newSelectedValues);
            if (onSuggestionSelect) {
              onSuggestionSelect(newSelectedValues);
            }
            setInputValue("");
            setShowSuggestions(false);
            if (ref && ref.current) {
              ref.current.focus();
            }
          }
        }
      } else if (showSuggestions && filteredSuggestions.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setHighlightedIndex((prevIndex) =>
            prevIndex < filteredSuggestions.length - 1 ? prevIndex + 1 : 0
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setHighlightedIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : filteredSuggestions.length - 1
          );
        }
      }
    };

    useEffect(() => {
      const handleScroll = () => {
        if (showSuggestions && ref?.current) {
          setShowSuggestions(false);
          setTimeout(() => setShowSuggestions(true), 0);
        }
      };

      window.addEventListener("scroll", handleScroll, true);
      return () => window.removeEventListener("scroll", handleScroll, true);
    }, [showSuggestions]);

    const { refs, floatingStyles } = useFloating({
      placement: "bottom-start",
      middleware: [
        offset(4),
        flip({
          fallbackPlacements: ["top-start"],
        }),
        shift(),
      ],
      strategy: "absolute",
    });

    const renderSelectedTags = () => (
      <div className="flex flex-wrap gap-1 mb-1">
        {selectedValues?.map((value) => (
          <span
            key={value.name}
            className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-primary/10"
          >
            {value.name}
            <button
              type="button"
              className="ml-1 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                const newValues = selectedValues.filter(
                  (v) => v.name !== value.name
                );
                setSelectedValues(newValues);
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    );

    return (
      <div className="relative w-full" ref={parentRef}>
        <div ref={refs.setReference} className="relative">
          <Input
            ref={ref}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder || "Search or type"}
            className={`pr-8 hover:cursor-pointer font-semibold w-full ${
              onError ? `border-red-500 focus-visible:ring-red-500` : ""
            }`}
          />
          <ChevronsUpDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
        </div>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              width: "100%",
              position: "absolute",
              left: 0,
              marginTop: "4px",
            }}
            className="z-[9999] bg-popover rounded-md border shadow-md"
          >
            <ScrollArea className={`${!height ? "" : "h-[200px]"}`}>
              <ul>


                {filteredSuggestions.map((suggestion, index) => (
                  <li
                    key={suggestion.name}

                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`px-4 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground
                      ${
                        index === highlightedIndex
                          ? "bg-accent text-accent-foreground"
                          : ""
                      }`}
                  >
                    {suggestion.name}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        )}
      </div>
    );
  }
);

export default MultiSelectInput;
