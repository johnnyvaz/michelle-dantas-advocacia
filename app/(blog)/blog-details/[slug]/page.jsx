import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Cta from "@/components/common/Cta";
import Link from "next/link";
import BlogDetails from "@/components/otherPages/blog/BlogDetails";
import { getPostBySlug } from "@/utlis/blog";

export const metadata = {
  title: "Michelle Dantas Advocacia",
  description: "",
};

export default function Page({ params }) {
  const blogItem = getPostBySlug(params.slug);

  if (!blogItem) {
    return <div>Post não encontrado</div>;
  }

  return (
    <>
      <Header1 />
      <main className="main position-relative" id="mains">
        <div className="breadcrumb-wrapper">
          <div
            className="breadcumb"
            data-bg-src=""
            style={{ backgroundImage: "url(/assets/img/hero/breadcumbBg.png)" }}
          >
            <div className="container">
              <div className="page-heading">
                <h1 className="wow fadeInUp" data-wow-delay=".3s">
                  {blogItem.title}
                </h1>
                <ul className="breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                  <li>
                    <Link scroll={false} href={`/`}>
                      Home
                    </Link>
                  </li>
                  <li>
                    <i className="fas fa-chevrons-right" />
                  </li>
                  <li>Blog Details</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <BlogDetails blogItem={blogItem} />
        <Cta />
      </main>
      <Footer1 />
    </>
  );
}
