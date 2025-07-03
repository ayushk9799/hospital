import React, { useState, useMemo, useRef } from "react";
import { Badge } from "../../../ui/badge";
import { ScrollArea } from "../../../ui/scroll-area";
import { X } from "lucide-react";

export default function MultiSelectField({
  suggestions,
  selectedValues,
  onAdd,
  onRemove,
  placeholder,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef(null);

  const filteredSuggestions = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const selectedNames = new Set(selectedValues.map((v) => v.name));

    return suggestions?.filter(
      (suggestion) =>
        !selectedNames.has(suggestion?.name) &&
        suggestion?.name?.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [searchTerm, suggestions, selectedValues]);

  const handleSelect = (suggestion) => {
    onAdd(suggestion);
    setSearchTerm("");
    inputRef.current?.focus();
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col ">
      <div
        className="w-full min-h-10 rounded-md border border-input bg-background text-sm flex flex-wrap items-center gap-1 px-2 cursor-text"
        onClick={handleContainerClick}
      >
        {selectedValues.map((value, index) => (
          <Badge
            key={index}
            variant="primary"
            className="flex items-center  text-[16px] bg-blue-100 text-blue-800 px-1 py-0.5 rounded"
          >
            {value.name}
            <X
              className="ml-1 h-4 w-4 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation(); // prevent container click from firing
                onRemove(value.name);
              }}
            />
          </Badge>
        ))}
        <input
          ref={inputRef}
          type="text"
          placeholder={
            selectedValues.length === 0 ? placeholder || "Search..." : ""
          }
          className="flex-grow h-full bg-transparent leading-none p-0 border-none  focus:outline-none focus:ring-0 font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            // Handle Enter key: add current typed term
            if (e.key === "Enter") {
              e.preventDefault();
              const trimmed = searchTerm.trim();
              if (!trimmed) return;

              const alreadySelected = selectedValues.some(
                (v) => v.name.toLowerCase() === trimmed.toLowerCase()
              );
              if (alreadySelected) return;

              const existingSuggestion = suggestions?.find(
                (s) => s?.name?.toLowerCase() === trimmed.toLowerCase()
              );

              const itemToAdd = existingSuggestion || { name: trimmed };
              onAdd(itemToAdd);
              setSearchTerm("");

              setTimeout(() => inputRef.current?.focus(), 0);
              return;
            }

            // Handle Backspace key: remove last selected item when search is empty
            if (
              e.key === "Backspace" &&
              searchTerm.trim() === "" &&
              selectedValues.length > 0
            ) {
              e.preventDefault();
              const last = selectedValues[selectedValues.length - 1];
              onRemove(last.name);
              // keep focus
              setTimeout(() => inputRef.current?.focus(), 0);
            }
          }}
        />
      </div>
      <div className="border rounded-md">
        <ScrollArea className=" w-full">
          {filteredSuggestions.length > 0 ? (
            <div className="p-2 flex flex-row flex-wrap gap-2 max-h-[200px]">
              {filteredSuggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion.name}-${index}`}
                  onClick={() => handleSelect(suggestion)}
                  className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center"
                >
                  <span>{suggestion.name}</span>
                  {suggestion.rate && (
                    <span className="text-gray-600 ml-2">
                      ₹{suggestion.rate}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No available items.
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
