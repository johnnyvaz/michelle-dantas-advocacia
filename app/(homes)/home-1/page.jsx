import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import HeaderTop from "@/components/headers/HeaderTop";
import About from "@/components/homes/home-1/About";
import Blog from "@/components/homes/home-1/Blog";
import Cta from "@/components/common/Cta";
import Facts from "@/components/homes/home-1/Facts";
import Hero from "@/components/homes/home-1/Hero";
import Offering from "@/components/homes/home-1/Offering";
import Pricing from "@/components/homes/home-1/Pricing";
import Process from "@/components/homes/home-1/Process";
import Projects from "@/components/homes/home-1/Projects";
import Services from "@/components/homes/home-1/Services";
import Services2 from "@/components/homes/home-1/Services2";
import Team from "@/components/homes/home-1/Team";
import Testimonials from "@/components/homes/home-1/Testimonials";
import VideoBox from "@/components/homes/home-1/VideoBox";
export const metadata = {
  title: "Home 1 || Techbe-IT Solution & Technology Service Nextjs Template",
  description: "Techbe-IT Solution & Technology Service Nextjs Template",
};
export default function Home1() {
  return (
    <>
      <HeaderTop />
      <Header1 />
      <main className="main position-relative" id="mains">
        <Hero />
        <Services />
        <About />
        <Services2 />
        <Offering />
        <VideoBox />
        <Team />
        <Projects />
        <Process />
        <Facts />
        <Pricing />
        <Testimonials />
        <Blog />
        <Cta />
      </main>
      <Footer1 />
    </>
  );
}
