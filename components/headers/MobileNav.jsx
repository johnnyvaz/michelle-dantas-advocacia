"use client";
import { menuItems } from "@/data/menu";
import { closeMobileMenu } from "@/utlis/toggleMobileMenu";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function MobileNav() {
  const [activeParent, setActiveParent] = useState(-1);
  const [activeParent2, setActiveParent2] = useState(-1);
  const pathname = usePathname();
  const isMenuActive = (menu = menuItems[3]) => {
    let isActive = false;
    if (menu.href !== "#") {
      if (pathname.split("/")[1] == menu.href?.split("/")[1]) {
        isActive = true;
      }
    }
    if (menu.subMenu) {
      menu.subMenu.forEach((el) => {
        if (el.href != "#") {
          if (pathname.split("/")[1] == el.href?.split("/")[1]) {
            isActive = true;
          }
        }
        if (el.subMenu) {
          el.subMenu.map((elm) => {
            if (elm.href != "#") {
              if (pathname.split("/")[1] == elm.href?.split("/")[1]) {
                isActive = true;
              }
            }
          });
        }
      });
    }
    return isActive;
  };

  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);
  const menuAreaRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current && // Check if click is inside #mobileMenu
        mobileMenuRef.current.contains(event.target) &&
        menuAreaRef.current && // Check if click is outside .gt-menu-area
        !menuAreaRef.current.contains(event.target)
      ) {
        closeMobileMenu();
        // Add your custom logic here
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      id="mobileMenu"
      ref={mobileMenuRef}
      className="gt-menu-wrapper onepage-nav"
    >
      <div ref={menuAreaRef} className="gt-menu-area text-center">
        <button onClick={closeMobileMenu} className="gt-menu-toggle">
          <i className="fal fa-times"></i>
        </button>
        <div className="mobile-logo">
          <Link scroll={false} href="/">
            <Image
              alt="techo"
              src="/assets/img/logo-dark.png"
              width="199"
              height="42"
            />
          </Link>
        </div>
        <div className="gt-mobile-menu">
          <ul>
            {menuItems.map((item, index) => (
              <li
                key={index}
                className={item.subMenu ? "menu-item-has-children" : ""}
              >
                <Link
                  scroll={false}
                  className={`${isMenuActive(item) ? "menuActive" : ""} `}
                  href={item.href.includes("/") ? item.href : "#"}
                  onClick={() =>
                    setActiveParent((pre) => (pre == index ? -1 : index))
                  }
                >
                  {item.title}
                  <span className="gt-mean-expand"></span>
                </Link>
                {item.subMenu && (
                  <ul
                    className={`sub-menu ${
                      index == activeParent ? "active" : ""
                    } `}
                  >
                    {item.subMenu.map((subItem, subIndex) => (
                      <li
                        key={subIndex}
                        className={
                          subItem.subMenu ? "menu-item-has-children" : ""
                        }
                      >
                        <Link
                          scroll={false}
                          className={`${
                            isMenuActive(subItem) ? "menuActive" : ""
                          }`}
                          href={subItem.href.includes("/") ? subItem.href : "#"}
                          onClick={() =>
                            setActiveParent2((pre) =>
                              pre == index ? -1 : index
                            )
                          }
                        >
                          {subItem.title}
                        </Link>
                        {subItem.subMenu && (
                          <ul
                            className={`sub-menu ${
                              index == activeParent2 ? "active" : ""
                            } `}
                          >
                            {subItem.subMenu.map((subSubItem, subSubIndex) => (
                              <li key={subSubIndex}>
                                <Link
                                  scroll={false}
                                  className={`${
                                    isMenuActive(subSubItem) ? "menuActive" : ""
                                  }`}
                                  href={subSubItem.href}
                                >
                                  {subSubItem.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
