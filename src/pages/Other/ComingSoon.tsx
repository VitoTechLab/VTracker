import { Construction } from "lucide-react";

const ComingSoon = () => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-gray-100 text-center p-4 overflow-hidden">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full">
        <div className="flex justify-center mb-6 animate-bounce">
          <Construction className="w-12 h-12 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Coming Soon</h1>
        <p className="text-gray-600 mb-6">
          This page is currently under construction. We’re working hard to bring it to life!
        </p>
        <p className="text-sm text-gray-400">Thank you for your patience 🛠️</p>
      </div>
    </div>
  );
};

export default ComingSoon;
