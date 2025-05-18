import { AlertCircle } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
      <AlertCircle className="w-16 h-16 text-red-500 mb-6 animate-pulse" />
      <h1 className="text-5xl font-extrabold text-gray-800 mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
      <p className="text-gray-500 mb-6">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <a
        href="/"
        className="inline-block px-6 py-3 bg-red-500 text-white rounded-md font-medium hover:bg-red-600 transition"
      >
        Back to Home
      </a>
    </div>
  );
}

export default NotFoundPage;
