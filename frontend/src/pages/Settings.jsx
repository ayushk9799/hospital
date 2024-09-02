import React, { useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command"
import { Input } from "../components/ui/input"

const suggestedItems = ["rajiv", "ranjan", "meme", "task"];

export default function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleSuggestionSelect = (currentValue) => {
    setInputValue(currentValue);
    setIsOpen(false);
  };

  const handleInputClick = () => {
    setIsOpen(!isOpen);
  };
console.log(inputValue);
  return (
    <Command className="rounded-lg border shadow-md md:min-w-[450px]">
      <Input 
        placeholder="Type a command or search..." 
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onClick={handleInputClick}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
      {isOpen && (
        <CommandList>
          {suggestedItems
            .filter(item => item.toLowerCase().includes(inputValue.toLowerCase()))
            .map((item) => (
              <CommandItem 
                key={item}
                value={item}
                onSelect={handleSuggestionSelect}
              >
                {item}
              </CommandItem>
            ))}
        </CommandList>
      )}
    </Command>
  )
}

/*
import React, { useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command"

const suggestedItems = ["rajiv", "ranjan", "meme", "task"];

export default function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("Type a command or search..");

  const handleInputChange = (value) => {
    setInputValue(value);
    setIsOpen(true);
  };

  const handleSuggestionSelect = (currentValue) => {
   
    setInputValue(currentValue);
    setIsOpen(false);
  };

  const handleInputClick = () => {
    setIsOpen(true);
  };
console.log(inputValue);
  return (
    <Command className="rounded-lg border shadow-md md:min-w-[450px]">
      
      <CommandInput 
        placeholder={inputValue}
        //value={inputValue}
        //onValueChange={handleInputChange}
        onClick={handleInputClick}
      />
      {isOpen && (
        <CommandList>
          {suggestedItems
            .map((item) => (
              <CommandItem 
                key={item}
                value={item}
                onSelect={() => handleSuggestionSelect(item)} // Updated here
              >
                {item}
              </CommandItem>
            ))}
        </CommandList>
      )}
    </Command>
  );
}


*/
