import { useState, useEffect } from "react";
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;
axios.defaults.withCredentials = true;

// Define the type for the options object
interface CallApiOptions<TBody = Record<string, any>> {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  queryParams?: Record<string, string | number | boolean>;
  body?: TBody;
  callback?: (result: any, isError: boolean) => void;
  axiosConfig?: AxiosRequestConfig;
}

// Define the return type of the callApi function
interface CallApiResult<TResult = any> {
  result: TResult | null;
  isLoading: boolean;
  isError: boolean;
  fetchData: (options: CallApiOptions) => void;
}

// The callApi function
const callApi = <TResult = any>(url: string): CallApiResult<TResult> => {
  const [result, setResult] = useState<TResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchData = async (options: CallApiOptions = {}) => {
    setIsLoading(true);
    const {
      method = "GET",
      queryParams = {},
      body = null,
      callback = null,
      axiosConfig = {},
    } = options;

    try {
      // Axios request configuration
      const config: AxiosRequestConfig = {
        url,
        method,
        params: queryParams,
        data: body,
        ...axiosConfig, // Merge additional Axios config
      };

      // Fetch data using Axios
      const response: AxiosResponse<TResult> = await axios(config);

      setResult(response.data);
      setIsError(false);

      // Call the callback function if provided
      if (callback) {
        callback(response.data, false);
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      const result = axiosError.response?.data as TResult;
      setIsError(true);
      setResult(result);

      // Call the callback function with error
      if (callback) {
        callback(result, true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { result, isLoading, isError, fetchData };
};

export default callApi;
