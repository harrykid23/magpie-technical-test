import { Text, TextField } from "@radix-ui/themes";
import React, { useState, useEffect, useRef } from "react";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";

interface ComboboxProps {
  fetchData: (searchTerm: string) => void;
  register: any;
  name: string;
  options: { value: string; label: string }[];
  setValue: UseFormSetValue<any>;
  value: any;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const SelectWithSearch: React.FC<ComboboxProps> = ({
  fetchData,
  register,
  name,
  options,
  setValue,
  value,
  placeholder = "Search...",
  required = false,
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [isOpen, setIsOpen] = useState<{
    value: boolean;
    isOptionClicked: boolean;
  }>({ value: false, isOptionClicked: false });
  const [isLoading, setIsLoading] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);

  // Fetch data from API whenever searchTerm changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        fetchData(searchTerm);
      } catch (error) {
        console.error("Failed to fetch options:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        comboboxRef.current &&
        !comboboxRef.current.contains(event.target as Node)
      ) {
        setIsOpen({ value: false, isOptionClicked: false });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen.value && !isOpen.isOptionClicked) {
      const selectedOption = options.find(
        (option) => option.value === selectedValue
      );
      setSearchTerm(selectedOption?.label || "");
    }
  }, [isOpen, options]);

  useEffect(() => {
    if (value) {
      const option = options.find((option) => option.value === value);
      setSearchTerm(option?.label || "");
      setSelectedValue(option?.value || "");
    }
  }, [value]);

  return (
    <div ref={comboboxRef} className={`relative !mb-0 ${className}`}>
      {/* Input Field */}
      <TextField.Root
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
        }}
        onFocus={() => {
          setIsOpen({ value: true, isOptionClicked: false });
        }}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
      />

      {/* Dropdown */}
      {isOpen.value && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-2 text-gray-500">Loading...</div>
          ) : options.length > 0 ? (
            options.map((option) => (
              <div
                key={option.value}
                className="p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setValue(name, option.value);
                  setIsOpen({ value: false, isOptionClicked: true });
                }}
              >
                <Text size={"2"}>{option.label}</Text>
              </div>
            ))
          ) : (
            <div className="p-2">
              <Text size={"2"}>No options found</Text>
            </div>
          )}
        </div>
      )}

      {/* Hidden Select for react-hook-form */}
      <select
        {...register(name, { required })}
        value={selectedValue}
        className="hidden"
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectWithSearch;
