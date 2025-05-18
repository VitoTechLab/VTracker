import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Transaction from './pages/Transaction/Transaction';
// import TransactionDetail from './pages/Transaction/TransactionDetail';
import { useDatabase } from './hook/useDatabase';
import Category from './pages/Category/Category';
import { Toaster } from 'react-hot-toast';
import { useLoadData } from './hook/loadData';
import NotFoundPage from './pages/Other/NotFoundPage';
import ComingSoon from './pages/Other/ComingSoon';

const App = () => {
  useDatabase();
  useLoadData();

  return (
    <HashRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />

          <Route path="transaction" element={<Transaction />}>
            {/* <Route path=':id' element={<TransactionDetail />} /> */}
          </Route>

          <Route path="category" element={<Category />}>
            {/* <Route path=':id' element={<TransactionDetail />} /> */}
          </Route>

          <Route path="statistic" element={<ComingSoon />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
