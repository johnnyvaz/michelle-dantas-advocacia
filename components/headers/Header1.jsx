"use client";
import Link from "next/link";
import Image from "next/image";
import Nav from "./Nav";
import { activeMobileMenu } from "@/utlis/toggleMobileMenu";
import { activeSideMenu } from "@/utlis/toggleSideMenu";
import { activePopupSearch } from "@/utlis/togglePopupSearch";

export default function Header1() {
  return (
    <header className="gt-header header-layout1">
      <div className="sticky-wrapper">
        {/* Main Menu Area */}
        <div className="menu-area">
          <div className="container">
            <div className="row align-items-center justify-content-between">
              <div className="col-auto">
                <div className="header-logo">
                  <Link scroll={false} href={`/`}>
                    <Image
                      src="/assets/img/logo-white.png"
                      width={199}
                      height={42}
                      alt="techo"
                    />
                  </Link>
                </div>
              </div>
              <div className="col-auto">
                <nav className="main-menu d-none d-xl-inline-block">
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
                  <button
                    type="button"
                    onClick={activePopupSearch}
                    className="simple-icon searchBoxToggler"
                  >
                    <i className="far fa-search" />
                  </button>
                  <Link
                    scroll={false}
                    href={`/contact`}
                    className="gt-btn gt-btn-icon"
                  >
                    GET IN TOUCH
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
