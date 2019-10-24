import React, { useState } from "react";
import { Link } from "react-router-dom";
import cx from "classnames";
import useAuth from "../hooks/useAuth";

interface Props {}

const svgPathCloseButton =
  "M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z";
const svgPathHamburger =
  "M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z";

export const AppNav: React.FC<Props> = () => {
  const { authToken, logOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const headerLinkClass =
    "mt-1 sm:mt-0 sm:ml-2 block px-2 py-1 text-white font-semibold hover:bg-green-800 rounded";
  return (
    <header className=" bg-green-900 sm:flex sm:justify-between sm:items-center sm:px-4 sm:py-3">
      <div className="flex items-center justify-between px-4 py-3 sm:p-0">
        <div>
          <Link to="/">
            <img
              className="h-8 rounded"
              src="https://placekitten.com/650/150"
              alt="Logo "
            />
          </Link>
        </div>
        <div className="sm:hidden">
          <button
            onClick={() => setIsOpen(open => !open)}
            type="button"
            className="block text-gray-500 hover:text-white focus:text-white focus:outline-none"
          >
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              {isOpen && <path fill-rule="evenodd" d={svgPathCloseButton} />}
              {!isOpen && <path fill-rule="evenodd" d={svgPathHamburger} />}
            </svg>
          </button>
        </div>
      </div>
      <div
        className={cx({
          "px-2 pt-2 pb-4 sm:flex sm:p-0": true,
          block: isOpen,
          hidden: !isOpen
        })}
      >
        <Link to="/lobby" className={headerLinkClass}>
          Lobby
        </Link>
        {!authToken && (
          <>
            <Link to="/login" className={headerLinkClass}>
              Log In
            </Link>
            <Link to="/signup" className={headerLinkClass}>
              Sign Up
            </Link>
          </>
        )}
        {authToken && (
          <>
            <Link to="/testme" className={headerLinkClass}>
              TestMe
            </Link>
            <Link to="/authtest" className={headerLinkClass}>
              Auth Test
            </Link>
            <Link to="/private" className={headerLinkClass}>
              Private Page Test
            </Link>
            <span
              className={headerLinkClass + " underline cursor-pointer"}
              onClick={() => logOut()}
            >
              Sign out
            </span>
          </>
        )}
      </div>
    </header>
  );
};
export default AppNav;
