"use client";
import Link from "next/link";
import Image from "next/image";
import Nav from "./Nav";
import { activeMobileMenu } from "@/utlis/toggleMobileMenu";
import { activeSideMenu } from "@/utlis/toggleSideMenu";
import { activePopupSearch } from "@/utlis/togglePopupSearch";

export default function Header1() {
  return (
    <header className="gt-header header-layout1 border-t-0 pt-0">
      <div className="sticky-wrapper">
        <div className="menu-area">
          <div className="container">
            <div className="row align-items-center justify-content-between">
              <div className="col-auto pl-0 -ml-2">
                <div className="header-logo">
                  <Link href="/">
                    <Image
                      src="/assets/img/logo-white.png"
                      width={220}
                      height={46}
                      alt="Logo"
                      className="mt-1"
                    />
                  </Link>
                </div>
              </div>
              
              <div className="col-auto">
                <nav className="main-menu d-none d-xl-inline-block text-xl">
                  <ul>
                    <Nav />
                  </ul>
                </nav>
                <div className="header-button d-flex d-xl-none">
                  <button
                    onClick={activeMobileMenu}
                    type="button"
                    className="gt-menu-toggle sidebar-btn"
                  >
                    <span className="line" />
                    <span className="line" />
                    <span className="line" />
                  </button>
                </div>
              </div>

              <div className="col-auto d-none d-xl-block">
                <div className="header-button">
                  <Link
                    href="/contato"
                    className="gt-btn gt-btn-icon text-xl py-2 px-4"
                  >
                    CONTATO
                  </Link>
                  <button
                    type="button"
                    onClick={activeSideMenu}
                    className="simple-icon sideMenuInfo sidebar-btn"
                  >
                    <span className="line" />
                    <span className="line" />
                    <span className="line" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}