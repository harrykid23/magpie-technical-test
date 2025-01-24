// GENERAL
export type TypePagination = {
  currentPage: number;
  maxPage: number;
  itemPerPage: number;
};

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
    id: string;
    name: string;
  };
}[];
