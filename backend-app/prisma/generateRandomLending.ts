// functions to generate random lendings data

export function generateLendings(
  numResult: number,
  userList: { id: string }[],
  bookList: { id: string }[],
  memberList: { id: string }[]
): {
  bookId: string;
  memberId: string;
  dueDate: string;
  returnDate?: string;
  createdAt: string;
  createdById: string;
}[] {
  const lendings: {
    bookId: string;
    memberId: string;
    dueDate: string;
    returnDate?: string;
    createdAt: string;
    createdById: string;
  }[] = [];

  // Define the start and end dates for createdAt
  const startDate = new Date("2024-01-01T00:00:00Z");
  const endDate = new Date("2024-12-31T23:59:59Z");

  for (let i = 0; i < numResult; i++) {
    const randomMember =
      memberList[Math.floor(Math.random() * memberList.length)];
    const randomUser = userList[Math.floor(Math.random() * userList.length)];
    const randomBook = bookList[Math.floor(Math.random() * bookList.length)];

    // Generate a random createdAt date between startDate and endDate
    const createdAt = new Date(
      startDate.getTime() +
        Math.random() * (endDate.getTime() - startDate.getTime())
    );
    const dueDate = new Date(createdAt);
    dueDate.setDate(createdAt.getDate() + 7); // Set due date 1 week after createdAt

    // Generate a random returnDate between createdAt and 14 days later or undefined
    let returnDate: string | undefined;
    if (Math.random() > 0.5) {
      const returnDateTime = new Date(
        createdAt.getTime() + Math.random() * (14 * 24 * 60 * 60 * 1000)
      ); // Between createdAt and 14 days later
      returnDate = returnDateTime.toISOString();
    }

    lendings.push({
      bookId: randomBook.id,
      memberId: randomMember.id,
      dueDate: dueDate.toISOString(),
      returnDate,
      createdAt: createdAt.toISOString(),
      createdById: randomUser.id,
    });
  }

  return lendings;
}
