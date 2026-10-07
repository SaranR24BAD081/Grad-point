import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => (
  <>
    <Navbar />
    <main className="page-shell">
      <Outlet />
    </main>
  </>
);

export default Layout;
