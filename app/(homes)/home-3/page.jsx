import Footer1 from "@/components/footers/Footer1";
import Footer2 from "@/components/footers/Footer2";
import Header1 from "@/components/headers/Header1";
import HeaderTop from "@/components/headers/HeaderTop";
import About from "@/components/homes/home-3/About";
import DownloadApp from "@/components/homes/home-3/DownloadApp";
import Features from "@/components/homes/home-3/Features";
import Hero from "@/components/homes/home-3/Hero";
import Pricing from "@/components/homes/home-3/Pricing";
import Screenshoots from "@/components/homes/home-3/Screenshoots";
import Service2 from "@/components/homes/home-3/Service2";
import Services from "@/components/homes/home-3/Services";
import Skills from "@/components/homes/home-3/Skills";
import Testimonials from "@/components/homes/home-3/Testimonials";
export const metadata = {
  title: "Home 3 || Techbe-IT Solution & Technology Service Nextjs Template",
  description: "Techbe-IT Solution & Technology Service Nextjs Template",
};
export default function Page() {
  return (
    <>
      <HeaderTop />
      <Header1 />
      <main className="main position-relative" id="mains">
        <Hero />
        <Services />
        <About />
        <Features />
        <Service2 />
        <Screenshoots />
        <Pricing />
        <Skills />
        <Testimonials />
        <DownloadApp />
      </main>
      <Footer2 />
    </>
  );
}
