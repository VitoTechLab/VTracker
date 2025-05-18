import { FaTimes } from "react-icons/fa";

interface ModalProps {
  isOpen: boolean;
  onClosed: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClosed, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-saturate-150 bg-black/30"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
        <button
          onClick={onClosed}
          className="absolute top-14 right-13 text-gray-500 hover:text-gray-800"
          aria-label="Close modal"
        >
          <FaTimes className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;



// import { FaTimes } from "react-icons/fa";
// import { motion, AnimatePresence } from "framer-motion";

// interface ModalProps {
//   isOpen: boolean;
//   onClosed: () => void;
//   children: React.ReactNode;
// }

// const backdropVariants = {
//   visible: { opacity: 1 },
//   hidden: { opacity: 0 },
// };

// const modalVariants = {
//   hidden: { opacity: 0, scale: 0.9 },
//   visible: { opacity: 1, scale: 1 },
//   exit: { opacity: 0, scale: 0.9 },
// };

// const Modal: React.FC<ModalProps> = ({ isOpen, onClosed, children }) => {
//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <motion.div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
//           variants={backdropVariants}
//           initial="hidden"
//           animate="visible"
//           exit="hidden"
//           onClick={onClosed} // Klik background juga tutup modal
//           aria-modal="true"
//           role="dialog"
//         >
//           <motion.div
//             className="relative w-full max-w-md p-6 bg-white rounded-xl shadow-lg"
//             variants={modalVariants}
//             initial="hidden"
//             animate="visible"
//             exit="exit"
//             onClick={(e) => e.stopPropagation()} // Jangan tutup saat klik konten modal
//             transition={{ duration: 0.25 }}
//           >
//             <button
//               onClick={onClosed}
//               className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
//               aria-label="Close modal"
//             >
//               <FaTimes className="w-5 h-5" />
//             </button>
//             {children}
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default Modal;
