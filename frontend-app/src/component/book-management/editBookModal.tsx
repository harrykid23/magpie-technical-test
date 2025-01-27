import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Dialog, Flex, Text, TextField } from "@radix-ui/themes";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "../general/customToast.tsx";
import buildApiCaller from "@/hook/apiHook.ts";
import { TypeAPIBody } from "../../../../backend-app/utils/apiUtils.ts";
import {
  TypeRequestGetCategoryList,
  TypeRequestUpdateBook,
  TypeResponseGetBookList,
  TypeResponseGetCategoryList,
} from "@shared/types.ts";
import SelectWithSearch from "../general/selectWithSearch.tsx";
import { Dispatch, SetStateAction, useEffect } from "react";

interface EditBookModalProps {
  refreshTable: (() => void) | null;
  bookData: TypeResponseGetBookList[number] | null;
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

const schema = z.object({
  title: z.string().min(3, "The minimum character is 3"),
  author: z.string().min(3, "The minimum character is 3"),
  isbn: z.string().min(3, "The minimum character is 3"),
  quantity: z.number().min(1, "The minimum quantity is 1"),
  categoryId: z.string().min(1, "Required"),
});

// Infer the type from the schema
type FormData = z.infer<typeof schema>;

export default function EditBookModal({
  refreshTable,
  bookData,
  isModalOpen,
  setIsModalOpen,
}: EditBookModalProps) {
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

  // form submission
  const { showToast } = useToast();
  const { isLoading: isLoadingEditBook, fetchData: editBook } = buildApiCaller<
    TypeRequestUpdateBook,
    TypeAPIBody<any>
  >(`/book/${bookData?.id}`);
  const onSubmit = (data: FormData) => {
    editBook({
      method: "PUT",
      body: {
        title: data.title,
        author: data.author,
        isbn: data.isbn,
        quantity: data.quantity,
        categoryId: data.categoryId,
      },
      callback: (result, isError) => {
        if (isError) {
          showToast("error", result?.displayMessage || "");
        } else {
          showToast("success", "Book edited successfully");
          setIsModalOpen(false);
          reset();
          refreshTable?.();
        }
      },
    });
  };

  const { result: categoryList, fetchData: getCategoryList } = buildApiCaller<
    TypeRequestGetCategoryList,
    TypeAPIBody<TypeResponseGetCategoryList>
  >("/book/category");

  // set default data
  useEffect(() => {
    setValue("title", bookData?.title || "");
    setValue("author", bookData?.author || "");
    setValue("isbn", bookData?.isbn || "");
    setValue("quantity", bookData?.quantity || 0);
    setValue("categoryId", bookData?.category.id || "");
  }, [bookData]);

  const categoryListWithDefaultOption = [
    ...(bookData?.category.id
      ? [
          {
            value: bookData.category.id,
            label: bookData.category.name,
          },
        ]
      : []),
    ...(categoryList?.data
      .map((category) => ({
        value: category.id,
        label: category.name,
      }))
      .filter((category) => category.value !== bookData?.category.id) || []),
  ];

  return (
    <Dialog.Root open={isModalOpen}>
      <Dialog.Content
        maxWidth="450px"
        onInteractOutside={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Dialog.Title>Edit Book</Dialog.Title>
          {/* <Dialog.Description size="2" mb="4">
          Make changes to your profile.
        </Dialog.Description> */}

          <Flex direction="column" gap="4">
            <Flex direction="column" gap="1">
              <TextField.Root
                {...register("title")}
                placeholder="Title"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                required
              />
              {errors.title && (
                <Text color="red" size="2">
                  {errors.title.message}
                </Text>
              )}
            </Flex>

            <Flex direction="column" gap="1">
              <TextField.Root
                {...register("author")}
                placeholder="Author"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                required
              />
              {errors.author && (
                <Text color="red" size="2">
                  {errors.author.message}
                </Text>
              )}
            </Flex>

            <Flex direction="column" gap="1">
              <TextField.Root
                {...register("isbn")}
                placeholder="ISBN"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                required
              />
              {errors.isbn && (
                <Text color="red" size="2">
                  {errors.isbn.message}
                </Text>
              )}
            </Flex>

            <Flex direction="column" gap="1">
              <TextField.Root
                {...register("quantity", {
                  setValueAs: (value) =>
                    value === "" ? undefined : Number(value),
                })}
                placeholder="Quantity"
                type="number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                required
              />
              {errors.quantity && (
                <Text color="red" size="2">
                  {errors.quantity.message}
                </Text>
              )}
            </Flex>

            <Flex direction="column" gap="1">
              <SelectWithSearch
                fetchData={async (searchQuery) => {
                  getCategoryList({
                    queryParams: {
                      search: searchQuery,
                    },
                  });
                }}
                options={categoryListWithDefaultOption}
                register={register}
                name="categoryId"
                placeholder="Search category..."
                required
                className="mb-4"
                setValue={setValue}
                value={watch("categoryId")}
              />
              {errors.categoryId && (
                <Text color="red" size="2">
                  {errors.categoryId.message}
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
            <Button loading={isLoadingEditBook} type="submit">
              Edit Book
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
