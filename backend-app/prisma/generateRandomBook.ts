import type { Category, Prisma } from "@prisma/client";

// functions to generate random boooks
type Book = Prisma.BookUncheckedCreateInput;

const generateRandomISBN = (): string => {
  return "978-" + Math.floor(Math.random() * 1000000000).toString();
};

const generateRandomDate = (start: Date, end: Date): string => {
  const randomTimestamp =
    start.getTime() + Math.random() * (end.getTime() - start.getTime());
  const randomDate = new Date(randomTimestamp);
  return randomDate.toISOString();
};

const generateBook = (categories: Category[], index: number): Book => {
  const singleWordTitles = [
    "The",
    "A",
    "Beyond",
    "Journey",
    "Darkness",
    "Light",
    "Dream",
    "Echo",
    "Whispers",
    "Endless",
  ];
  const singleWordTitles2 = [
    "Life",
    "World",
    "Dreams",
    "Hope",
    "Ocean",
    "Stars",
    "Mind",
    "Thoughts",
    "Waves",
    "Future",
  ];

  const title = `${
    singleWordTitles2[Math.floor(Math.random() * singleWordTitles2.length)]
  } ${singleWordTitles[Math.floor(Math.random() * singleWordTitles.length)]}`;
  const author = `Author ${Math.floor(Math.random() * 100)}`;
  const isbn = generateRandomISBN();
  const quantity = Math.floor(Math.random() * 20) + 50;
  const categoryId =
    categories[Math.floor(Math.random() * categories.length)].id;
  const startDate = new Date("2024-01-01T00:00:00Z");
  const endDate = new Date("2024-12-31T23:59:59Z");
  const createdAt = generateRandomDate(startDate, endDate);

  return {
    title,
    author,
    isbn,
    quantity,
    categoryId,
    createdAt,
    createdById: "",
  };
};

export const generateBooks = (
  numBooks: number,
  categories: Category[]
): Book[] => {
  const books: Book[] = [];

  for (let i = 0; i < numBooks; i++) {
    books.push(generateBook(categories, i));
  }

  return books;
};
