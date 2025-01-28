import { Text, TextField } from "@radix-ui/themes";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";

interface OptionInterface {
  value: string;
  label: string;
}
interface ComboboxProps {
  fetchData: (searchTerm: string) => void;
  register: any;
  name: string;
  options: OptionInterface[];
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
  const [selectedValue, setSelectedValue] = useState<OptionInterface | null>(
    null
  );
  const [isOpen, setIsOpen] = useState<{
    value: boolean;
    isOptionClicked: boolean;
  }>({ value: false, isOptionClicked: false });
  const [isLoading, setIsLoading] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);

  // if any option selected, add it to options
  const optionsWithSelectedValue = [
    ...(selectedValue ? [selectedValue] : []),
    ...(options.filter((option) => option.value !== selectedValue?.value) ||
      []),
  ];

  // Fetch data from API whenever searchTerm changes
  useEffect(() => {
    if (isOpen.value) {
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
    }
  }, [searchTerm, isOpen]);

  // set internal selectedValue when setValue triggered
  useEffect(() => {
    if (value) {
      const option = optionsWithSelectedValue.find(
        (option) => option.value === value
      );
      setSearchTerm(option?.label || "");
      setSelectedValue(option || null);
    }
  }, [value]);

  // if dropdown closed by clicking non-option element, set input to seletedValue label
  useEffect(() => {
    if (!isOpen.value && !isOpen.isOptionClicked) {
      const selectedOption = optionsWithSelectedValue.find(
        (option) => option.value === selectedValue?.value
      );
      setSearchTerm(selectedOption?.label || "");
    }
  }, [isOpen, optionsWithSelectedValue]);

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

  return (
    <div ref={comboboxRef} className={`relative !mb-0 ${className}`}>
      {/* Input Field */}
      <TextField.Root
        autoFocus={false}
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
          ) : optionsWithSelectedValue.length > 0 ? (
            optionsWithSelectedValue.map((option) => (
              <div
                key={option.value}
                className="p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setValue(name, option.value);
                  if (option.value === selectedValue?.value) {
                    setSearchTerm(option.label);
                  }
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
        value={selectedValue?.value || ""}
        className="hidden"
      >
        <option value="">Select an option</option>
        {optionsWithSelectedValue.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectWithSearch;
