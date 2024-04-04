import React, { useState, useEffect } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";

import { useQuery } from "@tanstack/react-query";
import kioskApi from "@/api/kioskApi";
import debounce from "lodash.debounce";
import { Input } from "../ui/input";
import { Label } from "@radix-ui/react-dropdown-menu";
import { set } from "zod";
interface OptionType {
  value: string;
  label: string;
}
const fetchOptions = async (inputValue: string): Promise<OptionType[]> => {
  try {
    const response = await kioskApi.getPublications(inputValue);
    return response["hydra:member"].map((item: any) => ({
      value: item["@id"].toString(),
      label: item.name,
    }));
  } catch (error) {
    console.error("Fetching options failed:", error);
    return [];
  }
};

type PublicationsPickerProps = {
  field: any;
};
export const PublicationsPicker = ({ field }: PublicationsPickerProps) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState([]);

  const { data, isFetching } = useQuery({
    queryKey: ["publications", search],
    queryFn: async () => {
      // Adjust the API call according to how your API expects the search parameter
      const response = await kioskApi.getPublications(search);
      return response.data; // Assuming the API response structure
    },
    enabled: !!search,
  });

  // Handle selection change
  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption.value);
    // setValue("publication", selectedOption.value);
  };

  // Update options based on the fetched data
  useEffect(() => {
    if (data) {
      // Transform the data to the format expected by React Select
      const newOptions = data.map((item) => ({
        value: item.id, // Adjust according to your data structure
        label: item.name, // Adjust according to your data structure
      }));
      setOptions(newOptions);
    }
  }, [data]);

  // Optional: Debounce the search input to reduce the number of API calls
  const handleSearchChange = debounce(setSearch, 500);

  return (
    <AsyncSelect
      cacheOptions
      loadOptions={fetchOptions}
      defaultOptions
      value={selectedOption}
      onChange={handleChange}
      placeholder="Select publichser..."
      isClearable={true}
      classNamePrefix="react-select"
      {...field}
      styles={{
        control: (provided) => ({
          ...provided,
          backgroundColor: "var(--color-background)",
          // borderColor: "var(--color-border)",
          "&:hover": {
            borderColor: "var(--color-border-hover)",
          },
        }),
        option: (provided, state) => ({
          ...provided,
          backgroundColor: state.isFocused
            ? "var(--color-option-focused)"
            : "white", // Adjust for a non-white background on focus
          color: "black", // Text color - change as needed
          "&:hover": {
            backgroundColor: "var(--color-hover)", // Ensure contrast with text color
          },
        }),

        // Add other custom styles as needed
      }}
    />
  );
};
