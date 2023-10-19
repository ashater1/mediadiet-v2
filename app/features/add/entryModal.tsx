import { PlusIcon } from "@heroicons/react/24/outline";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { MediaType } from "../list/types";
import { SearchCombobox } from "../search";
import { SelectMediaType } from "./SelectMediaType";
import { useAddNewContext } from "./context";
import { ReviewForm } from "./entryForm";

export function NewEntryModal() {
  const {
    openModal,
    closeModal,
    mediaItemData,
    state: { selectedItem, isModalOpen },
  } = useAddNewContext();

  return (
    <>
      <button
        onClick={openModal}
        type="button"
        className="flex h-10 items-center justify-center rounded border bg-primary-800 px-3 text-sm font-medium text-gray-100 hover:bg-primary-700 hover:text-gray-50 active:bg-primary-600"
      >
        <PlusIcon className="stroke-4 h-5 w-5" />
        <span className="ml-2">Add</span>
      </button>

      <Dialog.Root
        open={isModalOpen}
        onOpenChange={(open) => !open && closeModal({ type: "default" })}
      >
        <Dialog.Portal>
          <Dialog.Overlay key={"overlay"} asChild>
            <motion.div
              onClick={() => closeModal({ type: "default" })}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
          </Dialog.Overlay>

          <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded bg-gradient-to-tr from-orange-100 via-pink-100 to-indigo-50 md:w-auto">
            <div>
              <Dialog.Title className="sr-only">Add new entry</Dialog.Title>

              {mediaItemData && selectedItem ? (
                <ReviewForm />
              ) : (
                <SelectAndSearch />
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

function SelectAndSearch() {
  const {
    searchData,
    isSearchLoading,
    state,
    setSearchTerm,
    setSelectedItem,
    setMediaType,
  } = useAddNewContext();

  return (
    <div className="w-full p-6 md:w-[500px]">
      <SelectMediaType
        mediaType={state.mediaType}
        onChange={(value: MediaType) => setMediaType(value)}
      />
      <div className="mt-4">
        <SearchCombobox
          isSearchLoading={isSearchLoading}
          items={searchData}
          mediaType={state.mediaType}
          onInputChange={(value) => setSearchTerm(value)}
          onSelect={(item) => setSelectedItem(item.id)}
          searchTerm={state.searchTerm}
          selectedItem={state.selectedItem}
        />
      </div>
    </div>
  );
}
