import { AlertDialog, Button, Flex } from "@radix-ui/themes";
import { useToast } from "../general/customToast.tsx";
import buildApiCaller from "@/hook/apiHook.ts";
import { TypeAPIBody } from "../../../../backend-app/utils/apiUtils.ts";
import { TypeResponseGetLendingList } from "@shared/types.ts";
import { Dispatch, SetStateAction } from "react";

interface ReturnLendingModalProps {
  refreshTable: (() => void) | null;
  lendingData: TypeResponseGetLendingList[number] | null;
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function ReturnLendingModal({
  refreshTable,
  lendingData,
  isModalOpen,
  setIsModalOpen,
}: ReturnLendingModalProps) {
  const { showToast } = useToast();
  const { isLoading: isLoadingReturnLending, fetchData: returnLending } =
    buildApiCaller<any, TypeAPIBody<any>>(`/lending/${lendingData?.id}/return`);
  const onConfirmReturn = () => {
    returnLending({
      method: "POST",
      body: {},
      callback(result, isError) {
        if (isError) {
          showToast(
            "error",
            "Failed to return this lending. " + result?.displayMessage
          );
        } else {
          showToast("success", "Lending returned successfully.");
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
        <AlertDialog.Title>Return lending</AlertDialog.Title>
        <AlertDialog.Description size="2">
          Are you sure? This lending data will be returned permanently.
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel onClick={() => setIsModalOpen(false)}>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button
              loading={isLoadingReturnLending}
              onClick={onConfirmReturn}
              variant="solid"
              color="blue"
            >
              Return Lending
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
