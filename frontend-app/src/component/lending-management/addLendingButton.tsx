import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "@radix-ui/react-icons";
import { Button, Dialog, Flex, Text, TextField } from "@radix-ui/themes";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useToast } from "../general/customToast.tsx";
import buildApiCaller from "@/hook/apiHook.ts";
import { TypeAPIBody } from "../../../../backend-app/utils/apiUtils.ts";
import {
  TypeRequestCreateLending,
  TypeRequestSearchBookList,
  TypeRequestSearchMemberList,
  TypeResponseSearchBookList,
  TypeResponseSearchMemberList,
} from "@shared/types.ts";
import SelectWithSearch from "../general/selectWithSearch.tsx";
import { useState } from "react";

interface AddLendingButtonProps {
  refreshTable: (() => void) | null;
}

const schema = z.object({
  bookId: z.string().min(1, "Required"),
  memberId: z.string().min(1, "Required"),
  dueDate: z
    .string()
    .min(1, "Required")
    .refine(
      (value) => {
        const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
        return isoRegex.test(value);
      },
      {
        message: "String must be in YYYY-MM-DD format (e.g., 2023-10-05)",
      }
    ),
});

// Infer the type from the schema
type FormData = z.infer<typeof schema>;

export default function AddLendingButton({
  refreshTable,
}: AddLendingButtonProps) {
  // form validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // form modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // form submission
  const { showToast } = useToast();
  const { isLoading: isLoadingCreateLending, fetchData: createLending } =
    buildApiCaller<TypeRequestCreateLending, TypeAPIBody<any>>(
      "/lending/create"
    );
  const onSubmit = (data: FormData) => {
    createLending({
      method: "POST",
      body: {
        bookId: data.bookId,
        memberId: data.memberId,
        dueDate: new Date(`${data.dueDate} 23:59:59`).toISOString(),
      },
      callback: (result, isError) => {
        if (isError) {
          showToast("error", result?.displayMessage || "");
        } else {
          showToast("success", "New lending data added successfully");
          setIsModalOpen(false);
          reset();
          refreshTable?.();
        }
      },
    });
  };

  // search book functions
  const { result: bookList, fetchData: searchBookList } = buildApiCaller<
    TypeRequestSearchBookList,
    TypeAPIBody<TypeResponseSearchBookList>
  >("/book");

  // search member functions
  const { result: memberList, fetchData: searchMemberList } = buildApiCaller<
    TypeRequestSearchMemberList,
    TypeAPIBody<TypeResponseSearchMemberList>
  >("/member");

  return (
    <Dialog.Root open={isModalOpen}>
      <Dialog.Trigger>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusIcon /> Add Lending Data
        </Button>
      </Dialog.Trigger>

      <Dialog.Content
        maxWidth="450px"
        className="!overflow-visible"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Dialog.Title>Add Lending Data</Dialog.Title>
          {/* <Dialog.Description size="2" mb="4">
          Make changes to your profile.
        </Dialog.Description> */}

          <Flex direction="column" gap="4">
            <Flex direction="column" gap="1">
              <SelectWithSearch
                fetchData={async (searchQuery) => {
                  searchBookList({
                    queryParams: {
                      search: searchQuery,
                    },
                  });
                }}
                options={
                  bookList?.data.map((book) => ({
                    value: book.id,
                    label: `${book.title} | ${book.author} | ${book.isbn}`,
                  })) || []
                }
                register={register}
                name="bookId"
                placeholder="Search book title, author, or ISBN..."
                required
                className="mb-4"
                setValue={setValue}
                value={watch("bookId")}
              />
              {errors.bookId && (
                <Text color="red" size="2">
                  {errors.bookId.message}
                </Text>
              )}
            </Flex>

            <Flex direction="column" gap="1">
              <SelectWithSearch
                fetchData={async (searchQuery) => {
                  searchMemberList({
                    queryParams: {
                      search: searchQuery,
                    },
                  });
                }}
                options={
                  memberList?.data.map((member) => ({
                    value: member.id,
                    label: `${member.name} | ${member.email}`,
                  })) || []
                }
                register={register}
                name="memberId"
                placeholder="Search member name or email..."
                required
                className="mb-4"
                setValue={setValue}
                value={watch("memberId")}
              />
              {errors.memberId && (
                <Text color="red" size="2">
                  {errors.memberId.message}
                </Text>
              )}
            </Flex>

            <Flex direction="column" gap="1" className="w-fit">
              <TextField.Root
                {...register("dueDate", { required: "Due date is required" })}
                type="text"
                placeholder="Due Date"
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                onFocus={(e) => (e.target.type = "date")} // Switch to date picker
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = "text"; // Revert if no date selected
                }}
                pattern="\d{4}-\d{2}-\d{2}" // Enforce the format
              />
              {errors.dueDate && (
                <Text color="red" size="2">
                  {errors.dueDate.message}
                </Text>
              )}
            </Flex>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="soft"
                color="gray"
              >
                Cancel
              </Button>
            </Dialog.Close>
            <Button loading={isLoadingCreateLending} type="submit">
              Add Lending Data
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
