import React, { useEffect, useState } from "react";
import Logo from "./Logo";
import { BiSolidDashboard } from "react-icons/bi";
import { MdOutlineCreate, MdOutlineLogout } from "react-icons/md";
import { Link } from "react-router-dom";
import Cookies from 'js-cookie';
import { useNavigate, useLocation } from "react-router-dom";

const Sidepanel = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const isAllowedRoute = (path) => {
        // Static routes
        const staticRoutes = ["/", "/create"];
        if (staticRoutes.includes(path)) return true;
        
        // Dynamic routes
        if (path.startsWith("/response/")) return true;
        return false;
    }

    const [sidepanelVisible, setSidepanelVisible] = useState(false);

    const handleLogout = () => {
        Cookies.remove('jwt');
        navigate('/login');
    }

    useEffect(() => {
        if (isAllowedRoute(currentPath)) {
            setSidepanelVisible(true);
        } else {
            setSidepanelVisible(false);
        }
    }, [currentPath]);

    return (
        sidepanelVisible === true &&
        <div className="w-72 h-screen border-r-2 border-slate-200 flex flex-col justify-between">
            <div>
                <Logo />
                <div className="mt-5">
                    <Link to='/'>
                        <div className="flex justify-start items-center gap-2 px-4 py-2 m-2 rounded-md cursor-pointer hover:bg-indigo-100 transform transition-all duration-100">
                            <BiSolidDashboard className="text-xl text-slate-600" />
                            <p className="text-slate-900">Dashboard</p>
                        </div>
                    </Link>
                    <Link to='/create'>
                        <div className="flex justify-start items-center gap-2 px-4 py-2 m-2 rounded-md cursor-pointer hover:bg-indigo-100 transform transition-all duration-100">
                            <MdOutlineCreate className="text-xl text-slate-600" />
                            <p className="text-slate-900">Create Form</p>
                        </div>
                    </Link>
                </div>
            </div>
            <div onClick={handleLogout} className="flex justify-start items-center gap-2 px-4 py-2 m-2 rounded-md cursor-pointer hover:bg-red-500 hover:text-slate-50 transform transition-all duration-100">
                <MdOutlineLogout className="text-xl  hover:text-slate-50" />
                <p>Log Out</p>
            </div>
        </div>
    )
}

export default Sidepanel;