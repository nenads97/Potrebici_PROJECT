import { Outlet } from "react-router-dom";

import "./mainLayout.scss";

const MainLayout = () => {
  return (
    <>
      {/* <AppBar /> */}
      <main className="main">
        <Outlet />
      </main>
      {/* <footer className='footer'>
                
            </footer> */}
    </>
  );
};

export default MainLayout;
