import { AlertDialog, Button, Flex } from "@radix-ui/themes";
import { useToast } from "../general/customToast.tsx";
import buildApiCaller from "@/hook/apiHook.ts";
import { TypeAPIBody } from "../../../../backend-app/utils/apiUtils.ts";
import { TypeResponseGetLendingList } from "@shared/types.ts";
import { Dispatch, SetStateAction } from "react";

interface DeleteLendingModalProps {
  refreshTable: (() => void) | null;
  lendingData: TypeResponseGetLendingList[number] | null;
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function DeleteLendingModal({
  refreshTable,
  lendingData,
  isModalOpen,
  setIsModalOpen,
}: DeleteLendingModalProps) {
  const { showToast } = useToast();
  const { isLoading: isLoadingDeleteLending, fetchData: deleteLending } =
    buildApiCaller<null, TypeAPIBody<any>>(`/lending/${lendingData?.id}`);
  const onConfirmDelete = () => {
    deleteLending({
      method: "DELETE",
      callback(result, isError) {
        if (isError) {
          showToast(
            "error",
            "Failed to delete this lending. " + result?.displayMessage
          );
        } else {
          showToast("success", "Lending deleted successfully.");
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
        <AlertDialog.Title>Delete lending</AlertDialog.Title>
        <AlertDialog.Description size="2">
          Are you sure? This lending data will be deleted permanently.
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel onClick={() => setIsModalOpen(false)}>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button
              loading={isLoadingDeleteLending}
              onClick={onConfirmDelete}
              variant="solid"
              color="red"
            >
              Delete Lending
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
