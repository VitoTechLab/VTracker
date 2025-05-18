import TableTransaction from "../../components/Table/TableTransaction"
import Modal from "../../components/Modal/Modal";
import TransactionForm from "../../components/Form/TransactionForm";
import { useModal } from "../../hook/useModal";

const Transaction = () => {
  const {openModal, formType, editId, handleOpenModal, handleCloseModal} = useModal();

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-semibold mb-5">Transactions</h1>
      <TableTransaction type={"income"} openModal={(id?: number) => handleOpenModal("income", id)}/>
      <Modal isOpen={openModal} onClosed={handleCloseModal}>
        <TransactionForm type={formType!} editId={editId} onClosed={handleCloseModal}/>
      </Modal>
      <br />
      <TableTransaction type={"expense"} openModal={(id?: number) => handleOpenModal("expense", id)}/>
    </div>
    
  )
}

export default Transaction