"use client";
import { menuItems } from "@/data/menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { smoothScroll } from "@/utils/smoothScroll";

export default function Nav() {
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

  return (
    <>
      {menuItems.map((menu, index) => (
        <li
          key={index}
          className={menu.subMenu ? "menu-item-has-children" : ""}
        >
          <Link
            href={menu.href}
            onClick={menu.href.startsWith("/#") ? smoothScroll : undefined}
          >
            {menu.title}
          </Link>
          {menu.subMenu && (
            <ul className="sub-menu">
              {menu.subMenu.map((subMenu, subIndex) => (
                <li
                  key={subIndex}
                  className={subMenu.subMenu ? "menu-item-has-children" : ""}
                >
                  <Link
                    href={subMenu.href}
                    onClick={subMenu.href.startsWith("/#") ? smoothScroll : undefined}
                  >
                    {subMenu.title}
                  </Link>
                  {subMenu.subMenu && (
                    <ul className="sub-menu">
                      {subMenu.subMenu.map((subSubMenu, subSubIndex) => (
                        <li key={subSubIndex}>
                          <Link
                            href={subSubMenu.href}
                            onClick={subSubMenu.href.startsWith("/#") ? smoothScroll : undefined}
                          >
                            {subSubMenu.title}
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
    </>
  );
}
