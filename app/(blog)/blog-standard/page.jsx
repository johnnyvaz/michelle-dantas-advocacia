import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Cta from "@/components/common/Cta";
import Link from "next/link";
import { getAllMarkdownPosts } from "@/utils/blogMarkdown";
import BlogCardStandard from "@/components/otherPages/blog/BlogCardStandard";

export const metadata = {
  title: "Blog || Michelle Dantas Advocacia",
  description: "Artigos jurídicos e informações relevantes sobre seus direitos.",
};

export default function Page() {
  const posts = getAllMarkdownPosts();

  return (
    <>
      <Header1 />
      <main className="main position-relative" id="mains">
        <div className="breadcrumb-wrapper">
          <div
            className="breadcumb"
            style={{ backgroundImage: "url(/assets/img/hero/breadcumbBg.png)" }}
          >
            <div className="container">
              <div className="page-heading">
                <h1 className="wow fadeInUp" data-wow-delay=".3s">
                  Blog
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
                  <li>Blog</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <section className="blog-area space-top pb-120">
          <div className="container">
            <div className="row gy-4">
              {posts.map((post, index) => (
                <div className="col-lg-4 col-md-6" key={post.slug}>
                  <BlogCardStandard post={post} index={index} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <Cta />
      </main>
      <Footer1 />
    </>
  );
}
