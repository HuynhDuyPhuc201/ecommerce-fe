import { lazy } from 'react';
import { path } from './config/path';
const Page404 = lazy(() => import('./pages/404/404'));
const DefaultLayout = lazy(() => import('./layouts/DefaultLayout'));
const ProfileLayout = lazy(() => import('./layouts/ProfileLayout'));
const Home = lazy(() => import('./pages/index'));
const CartPage = lazy(() => import('./pages/CartPage/CartPage'));
const Payment = lazy(() => import('./pages/Payment'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const ProductDetail = lazy(() => import('./pages/ProductPage/ProductDetail'));
const Profile = lazy(() => import('./pages/Account/Profile'));
const Address = lazy(() => import('./pages/Account/Address'));
const MyOrder = lazy(() => import('./pages/Account/MyOrder'));
const Wishlist = lazy(() => import('./pages/Account/Wishlist'));

// admin
const Admin = lazy(() => import('./pages/Admin/Admin'));

const routers = [
  {
    path: '/',
    element: <DefaultLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: path.Product,
        element: <Home />,
      },
      {
        path: path.Cart,
        element: <CartPage />,
      },
      {
        path: path.Payment,
        element: <Payment />,
      },
      {
        path: path.OrderSuccess,
        element: <OrderSuccessPage />,
      },
      {
        path: path.ProductDetail,
        element: <ProductDetail />,
      },
      {
        path: path.Account.Profile,
        element: <ProfileLayout />,
        children: [
          {
            index: true,
            element: <Profile />,
          },
          {
            path: path.Account.Address,
            element: <Address />,
          },
          {
            path: path.Account.MyOrder,
            element: <MyOrder />,
          },
          {
            path: path.Account.Wishlist,
            element: <Wishlist />,
          },
        ],
      },
    ],
  },
  {
    path: path.Admin,
    element: <Admin />,
  },
  {
    path: '*',
    element: <Page404 />,
  },
];

export default routers;
