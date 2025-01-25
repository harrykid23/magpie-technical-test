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
      [key: string]: "asc" | "desc"; // Sort by the [key] field in ascending order
    }[];
  };
};

// AUTH
export type TypeRequestLogin = {
  email: string;
  password: string;
};

export type TypeSession = {
  role: {
    id: string;
    name: string;
    mapRolePermissions: {
      permission: {
        id: string;
        name: string;
      };
    }[];
  };
  id: string;
  name: string;
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

export type TypeRequestUpdateBook = {
  title: string;
  author: string;
  isbn: string;
  quantity: number;
  categoryId: string;
};

export type TypeResponseUpdateBook = {
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

// LENDING MANAGEMENT
export type TypeResponseGetLendingList = {
  id: string;
  createdAt: Date;
  createdBy: {
    name: string;
  };
  member: {
    name: string;
    email: string;
    phone: string | null;
  };
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string;
  };
  dueDate: Date;
  returnDate: Date | null;
}[];

export type TypeRequestCreateLending = {
  bookId: string;
  memberId: string;
  dueDate: string;
};

export type TypeResponseCreateLending = {
  id: string;
  createdAt: Date;
  createdBy: {
    name: string;
  };
  member: {
    name: string;
    email: string;
    phone: string | null;
  };
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string;
  };
  dueDate: Date;
  returnDate: Date | null;
};

export type TypeResponseReturnLending = {
  id: string;
  createdAt: Date;
  createdBy: {
    name: string;
  };
  member: {
    name: string;
    email: string;
    phone: string | null;
  };
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string;
  };
  dueDate: Date;
  returnDate: Date | null;
};
