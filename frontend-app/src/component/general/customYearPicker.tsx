import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { Dispatch } from "react";

const CustomYearPicker = ({
  onYearChange,
  year,
  disabled,
}: {
  onYearChange: Dispatch<string>;
  year: string;
  disabled: boolean;
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 4 + i);

  return (
    <Select.Root onValueChange={onYearChange} value={year}>
      <Select.Trigger
        disabled={disabled}
        className="inline-flex items-center justify-between rounded-md bg-white px-2 py-1 text-sm text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Select.Value placeholder="Select a year" />
        <Select.Icon className="ml-2">
          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Content
        position="popper"
        sideOffset={-36}
        className="z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
      >
        <Select.ScrollUpButton className="flex items-center justify-center py-2">
          <ChevronUpIcon className="h-4 w-4 text-gray-500" />
        </Select.ScrollUpButton>

        <Select.Viewport className="p-2">
          {years.map((year) => (
            <Select.Item
              key={year}
              value={year.toString()}
              className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
            >
              <Select.ItemText>{year}</Select.ItemText>
            </Select.Item>
          ))}
        </Select.Viewport>

        <Select.ScrollDownButton className="flex items-center justify-center py-2">
          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
        </Select.ScrollDownButton>
      </Select.Content>
    </Select.Root>
  );
};

export default CustomYearPicker;
