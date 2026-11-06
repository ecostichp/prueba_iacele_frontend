import { createBrowserRouter } from "react-router";
import MainLayout from "./layouts/MainLayout";
import ErrorPage from './pages/ErrorPage';
import MyRecords from "./pages/MyRecords";
import RegisterInventory from "./pages/RegisterInventory";

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <MyRecords />,
      },
      {
        path: '/inventory_register',
        element: <RegisterInventory />,
      },
    ],
  },
])
