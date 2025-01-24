import { Prisma, PrismaClient, type Category } from "@prisma/client";
import { encryptPassword } from "../utils/authUtils.ts";
import { PERMISSION_NAME } from "../../shared/constants.ts";
import type { TypeTransaction } from "../utils/apiUtils.ts";
import { generateBooks } from "./generateRandomBook.ts";
import { generateLendings } from "./generateRandomLending.ts";

async function seedData() {
  const db = new PrismaClient();

  // Seed data
  await db.$transaction(async (trx) => {
    // clear data
    await trx.lending.deleteMany();
    await trx.member.deleteMany();
    await trx.book.deleteMany();
    await trx.category.deleteMany();
    await trx.mapRolePermission.deleteMany();
    await trx.permission.deleteMany();
    await trx.user.deleteMany();
    await trx.role.deleteMany();

    // start seeding new data
    // role
    const roleList = await trx.role.createManyAndReturn({
      select: {
        id: true,
        name: true,
      },
      data: [
        {
          name: "Super Admin",
        },
        {
          name: "Admin",
        },
      ],
    });
    const roleIdByName: { [key: string]: string } = {};
    roleList.forEach((role) => {
      roleIdByName[role.name] = role.id;
    });

    // permission
    const permissionList = await trx.permission.createManyAndReturn({
      select: {
        id: true,
        name: true,
      },
      data: [
        // book management
        {
          name: PERMISSION_NAME.create_book,
          description: "User can create new book",
        },
        {
          name: PERMISSION_NAME.read_book,
          description: "User can view book list",
        },
        {
          name: PERMISSION_NAME.update_book,
          description: "User can update book data",
        },
        {
          name: PERMISSION_NAME.delete_book,
          description: "User can delete book",
        },

        // lending management
        {
          name: PERMISSION_NAME.create_lending,
          description: "User can create new lending data",
        },
        {
          name: PERMISSION_NAME.read_lending,
          description: "User can view lending data list",
        },
        {
          name: PERMISSION_NAME.update_lending,
          description: "User can update lending data",
        },
        {
          name: PERMISSION_NAME.delete_lending,
          description: "User can delete lending data",
        },
      ],
    });
    const permissionIdByShortName: { [key: string]: string } = {};
    permissionList.forEach((permission) => {
      permissionIdByShortName[permission.name] = permission.id;
    });

    // mapRolePermission
    // assign permission to each role
    const mappingObject: { [key: string]: string[] } = {
      "Super Admin": [
        PERMISSION_NAME.create_book,
        PERMISSION_NAME.read_book,
        PERMISSION_NAME.update_book,
        PERMISSION_NAME.delete_book,
        PERMISSION_NAME.create_lending,
        PERMISSION_NAME.read_lending,
        PERMISSION_NAME.update_lending,
        PERMISSION_NAME.delete_lending,
      ],
      Admin: [
        // PERMISSION_NAME.create_book,
        PERMISSION_NAME.read_book,
        // PERMISSION_NAME.update_book,
        // PERMISSION_NAME.delete_book,
        PERMISSION_NAME.create_lending,
        PERMISSION_NAME.read_lending,
        PERMISSION_NAME.update_lending,
        PERMISSION_NAME.delete_lending,
      ],
    };
    const mapRolePermissionList: { roleId: string; permissionId: string }[] =
      [];
    Object.keys(mappingObject).forEach((roleName) => {
      const roleId = roleIdByName[roleName];
      mappingObject[roleName].forEach((permissionShortName) => {
        mapRolePermissionList.push({
          roleId: roleId,
          permissionId: permissionIdByShortName[permissionShortName],
        });
      });
    });
    await trx.mapRolePermission.createMany({
      data: mapRolePermissionList,
    });

    // user
    const userList = await trx.user.createManyAndReturn({
      select: {
        id: true,
        role: {
          select: {
            mapRolePermissions: {
              select: {
                permission: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      data: [
        {
          name: "Andy Super Admin",
          email: "andy@gmail.com",
          password: await encryptPassword("superadmin"),
          roleId: roleIdByName["Super Admin"],
        },
        {
          name: "Kevin Super Admin",
          email: "kevin@gmail.com",
          password: await encryptPassword("superadmin"),
          roleId: roleIdByName["Super Admin"],
        },
        {
          name: "Denny Admin",
          email: "denny@gmail.com",
          password: await encryptPassword("admin123"),
          roleId: roleIdByName["Admin"],
        },
        {
          name: "Peter Admin",
          email: "peter@gmail.com",
          password: await encryptPassword("admin123"),
          roleId: roleIdByName["Admin"],
        },
      ],
    });

    // categories
    const categoryList = await trx.category.createManyAndReturn({
      data: [
        { name: "Fiction" },
        { name: "Non-Fiction" },
        { name: "Science" },
        { name: "History" },
        { name: "Technology" },
        { name: "Art" },
        { name: "Biography" },
        { name: "Philosophy" },
        { name: "Poetry" },
        { name: "Adventure" },
      ],
    });

    // books
    const userCanCreateBookList = userList.filter((user) =>
      user.role.mapRolePermissions.some(
        (maprolePermission) =>
          maprolePermission.permission.name === PERMISSION_NAME.create_book
      )
    );
    const rawBookList = generateBooks(50, categoryList).map((item) => ({
      ...item,
      createdById:
        userCanCreateBookList[
          Math.floor(Math.random() * userCanCreateBookList.length)
        ].id,
    }));
    const bookList = await trx.book.createManyAndReturn({
      select: {
        id: true,
      },
      data: rawBookList,
    });

    // members
    const memberList = await trx.member.createManyAndReturn({
      select: {
        id: true,
      },
      data: [
        {
          name: "John Doe",
          email: "johndoe@example.com",
          phone: "+1 555-123-4567",
        },
        {
          name: "Jane Smith",
          email: "janesmith@example.com",
          phone: "+1 555-234-5678",
        },
        {
          name: "Michael Brown",
          email: "michaelbrown@example.com",
          phone: "+1 555-345-6789",
        },
        {
          name: "Emily Davis",
          email: "emilydavis@example.com",
          phone: "+1 555-456-7890",
        },
        {
          name: "David Wilson",
          email: "davidwilson@example.com",
          phone: "+1 555-567-8901",
        },
        {
          name: "Olivia Johnson",
          email: "oliviajohnson@example.com",
          phone: "+1 555-678-9012",
        },
        {
          name: "Daniel Lee",
          email: "daniellee@example.com",
          phone: "+1 555-789-0123",
        },
        {
          name: "Sophia Martinez",
          email: "sophiamartinez@example.com",
          phone: "+1 555-890-1234",
        },
        {
          name: "James Garcia",
          email: "jamesgarcia@example.com",
          phone: "+1 555-901-2345",
        },
        {
          name: "Ava Rodriguez",
          email: "avarodriguez@example.com",
          phone: "+1 555-012-3456",
        },
        {
          name: "William Hernandez",
          email: "williamhernandez@example.com",
          phone: "+1 555-123-4567",
        },
        {
          name: "Isabella Lewis",
          email: "isabellalewis@example.com",
          phone: "+1 555-234-5678",
        },
        {
          name: "Benjamin Walker",
          email: "benjaminwalker@example.com",
          phone: "+1 555-345-6789",
        },
        {
          name: "Mia Hall",
          email: "miahall@example.com",
          phone: "+1 555-456-7890",
        },
        {
          name: "Elijah Allen",
          email: "elijahallen@example.com",
          phone: "+1 555-567-8901",
        },
      ],
    });

    // lendings
    const rawLendingList = generateLendings(50, userList, bookList, memberList);
    await trx.lending.createMany({
      data: rawLendingList,
    });
  });

  console.log("Seeding data finished.");
}

await seedData();
