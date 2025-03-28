import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Blog from "@/components/homes/home-1/Blog";
import Cta from "@/components/common/Cta";
import Facts from "@/components/homes/home-1/Facts";
import Hero from "@/components/homes/home-1/Hero";
import Services from "@/components/homes/home-1/Services";
import Services2 from "@/components/homes/home-1/Services2";
import Team from "@/components/homes/home-1/Team";
import Testimonials from "@/components/homes/home-1/Testimonials";
export const metadata = {
  title: "Michelle Dantas Advocacia",
  description: "",
};
export default function Home1() {
  return (
    <>
      <Header1 />
      <main className="main position-relative" id="mains">
        <Hero />
        <Services />
        <Services2 />
        <Blog />
        <Facts />
        {/* <Team /> */}
        <Testimonials />
        {/* <Cta /> */}
      </main>
      <Footer1 />
    </>
  );
}
