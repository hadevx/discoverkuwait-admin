import "react-toastify/dist/ReactToastify.css";
import SideMenu2 from "./components/SideMenu2";
import { useSelector } from "react-redux";

function Layout({ children }: { children: React.ReactNode }) {
  const lang = useSelector((state: any) => state.language.lang);

  return (
    <div className="flex bg-background min-h-screen" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <SideMenu2 />
      <div className="flex flex-col flex-1 min-h-screen min-w-0">{children}</div>
    </div>
  );
}

export default Layout;
