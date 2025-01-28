import dayjs from "dayjs";

export const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const dateToString = (date: dayjs.ConfigType) => {
  const dayjsDate = dayjs(date);
  const dayjsDateString = dayjsDate.format("YYYY-MM-DD HH:mm:ss");

  return dayjsDateString;
};
