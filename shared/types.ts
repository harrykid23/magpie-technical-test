import type { TypeSession } from "../backend-app/utils/authUtils.ts";

// GENERAL
export type TypePagination = {
  currentPage: number;
  maxPage: number;
  itemPerPage: number;
};

export type TypeRequestGetTable = TypePagination & {
  option?: {
    search?: string;
    orderBy?: {
      [key: string]: "asc" | "desc"; // Sort by the 'name' field in ascending order
    }[];
  };
};

// AUTH
export type TypeRequestLogin = {
  email: string;
  password: string;
};

export type TypeResponseLogin = TypeSession;

// BOOK MANAGEMENT
export type TypeResponseGetBookList = {
  category: {
    id: string;
    name: string;
  };
  id: string;
  title: string;
  author: string;
  isbn: string;
  quantity: number;
  createdBy: {
    name: string;
  };
}[];

export type TypeRequestCreateBook = {
  title: string;
  author: string;
  isbn: string;
  quantity: number;
  categoryId: string;
};

export type TypeResponseCreateBook = {
  category: {
    id: string;
    name: string;
  };
  id: string;
  title: string;
  author: string;
  isbn: string;
  quantity: number;
  createdBy: {
    name: string;
  };
};
