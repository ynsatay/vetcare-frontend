import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Container } from "reactstrap";
import { useContext } from "react";
import AuthContext from "../context/usercontext.tsx";
import Landing from "../views/ui/Landing";

const FullLayout = () => {
  const { isLogin } = useContext(AuthContext);

  return (
    <main>
      <div>
        <Header />
      </div>

      <div className="pageWrapper d-lg-flex">
        {isLogin && (
          <aside className="sidebarArea shadow" id="sidebarArea">
            <Sidebar />
          </aside>
        )}

        {isLogin ? (
          <div className="contentArea">
            <Container className="p-4 wrapper" fluid>
              <Outlet />
            </Container>
          </div>
        ) : (
          <Landing />
        )}

        {/* <div className="contentArea">
          <Container className="p-4 wrapper" fluid>
            {isLogin ? <Outlet /> : <Landing />} 
          </Container>
        </div> */}
      </div>
    </main>
  );
};

export default FullLayout;
