import Modal from "../../components/Modal/Modal";
import CategoryForm from "../../components/Form/CategoryForm";
import { useModal } from "../../hook/useModal";
import TableCategory from "../../components/Table/TableCategory";

const Category = () => {
  const {
    openModal,
    formType,
    editId,
    handleOpenModal,
    handleCloseModal,
  } = useModal();

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-semibold mb-5">Categories</h1>

      <TableCategory type={"income"} openModal={(id?: number) => handleOpenModal("income", id)} />

      <Modal isOpen={openModal} onClosed={handleCloseModal}>
        <CategoryForm
          type={formType!}
          editId={editId}
          onClosed={handleCloseModal}
        />
      </Modal>
      <br />
      <TableCategory type={"expense"} openModal={(id?: number) => handleOpenModal("expense", id)} />
    </div>
  );
};

export default Category;
