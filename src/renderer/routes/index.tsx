import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/home';
import Layout from '../pages/layout';
import ComfyUI from '../pages/comfyui';
import ErrorPage from '../pages/error';

// https://reactrouter.com/en/main/start/tutorial
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '*',
        element: <Home />,
      },
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/error',
        element: <ErrorPage />,
      },
      {
        path: '/comfyui',
        element: <ComfyUI />,
      },
    ],
  },
]);

export default router;
