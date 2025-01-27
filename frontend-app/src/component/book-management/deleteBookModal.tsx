import { AlertDialog, Button, Flex } from "@radix-ui/themes";
import { useToast } from "../general/customToast.tsx";
import buildApiCaller from "@/hook/apiHook.ts";
import { TypeAPIBody } from "../../../../backend-app/utils/apiUtils.ts";
import { TypeResponseGetBookList } from "@shared/types.ts";
import { Dispatch, SetStateAction } from "react";

interface DeleteBookModalProps {
  refreshTable: (() => void) | null;
  bookData: TypeResponseGetBookList[number] | null;
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function DeleteBookModal({
  refreshTable,
  bookData,
  isModalOpen,
  setIsModalOpen,
}: DeleteBookModalProps) {
  const { showToast } = useToast();
  const { isLoading: isLoadingDeleteBook, fetchData: deleteBook } =
    buildApiCaller<null, TypeAPIBody<any>>(`/book/${bookData?.id}`);
  const onConfirmDelete = () => {
    deleteBook({
      method: "DELETE",
      callback(result, isError) {
        if (isError) {
          showToast(
            "error",
            "Failed to delete this book. " + result?.displayMessage
          );
        } else {
          showToast("success", "Book deleted successfully.");
          setIsModalOpen(false);
          refreshTable?.();
        }
      },
    });
  };

  return (
    <AlertDialog.Root open={isModalOpen}>
      <AlertDialog.Content
        maxWidth="450px"
        onFocusOutside={() => setIsModalOpen(false)}
      >
        <AlertDialog.Title>Delete book</AlertDialog.Title>
        <AlertDialog.Description size="2">
          Are you sure? This book will be deleted permanently.
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel onClick={() => setIsModalOpen(false)}>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button
              loading={isLoadingDeleteBook}
              onClick={onConfirmDelete}
              variant="solid"
              color="red"
            >
              Delete Book
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
