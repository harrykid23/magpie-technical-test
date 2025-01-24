// GENERAL
export type TypePagination = {
  currentPage: number;
  maxPage: number;
  itemPerPage: number;
};

export type TypeResponseGetUserList = {
  id: string;
  category: {
    id: string;
    name: string;
  };
  title: string;
  author: string;
  isbn: string;
  quantity: number;
  createdBy: {
    role: string;
    id: string;
    name: string;
    email: string;
    password: string;
  };
}[];
