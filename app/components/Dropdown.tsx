import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "react-bootstrap-icons";
import { Option } from "../types";

interface DropdownProps {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const Dropdown = ({ options, value, onChange, placeholder = "Select...", className = "" }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className="input-primary flex items-center justify-between cursor-pointer bg-[var(--primary)]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`truncate ${!selectedOption ? "text-gray-400" : ""}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-[#1b1d25] border border-gray-700 rounded-md mt-1 z-50 shadow-lg flex flex-col">
          <div className="p-2 border-b border-gray-700">
            <input
              ref={searchInputRef}
              type="text"
              className="w-full bg-transparent border border-gray-700 rounded p-1 text-sm text-white focus:outline-none focus:border-[var(--secondary)]"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`px-3 py-2 hover:bg-[var(--secondary)]/20 cursor-pointer text-sm transition-colors flex items-center justify-between ${option.value === value ? "text-[var(--secondary)]" : "text-gray-300"}`}
                  onClick={() => handleSelect(option)}
                >
                  <span>{option.label}</span>
                  {option.type && <span className="text-[10px] text-gray-500 border border-gray-700 rounded px-1 ml-2 bg-black/20">{option.type}</span>}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
