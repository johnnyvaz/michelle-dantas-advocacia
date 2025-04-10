import { getPostBySlug } from "@/utils/blogMarkdown";
import ReactMarkdown from "react-markdown";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footers/Footer1";
import Cta from "@/components/common/Cta";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug);
  return {
    title: `${post?.title || "Post"} | Michelle Dantas`,
    description: post?.excerpt || "",
  };
}

export default function Page({ params }) {
  const post = getPostBySlug(params.slug);

  if (!post) return <div>Post não encontrado.</div>;

  return (
    <>
      <Header1 />
      <main className="main position-relative" id="mains">
        <div className="breadcrumb-wrapper">
          <div
            className="breadcumb"
            style={{
              backgroundImage: "url(/assets/img/hero/breadcumbBg.png)",
            }}
          >
            <div className="container">
              <div className="page-heading">
                <h1 className="wow fadeInUp" data-wow-delay=".3s">
                  {post.title}
                </h1>
                <ul
                  className="breadcrumb-items wow fadeInUp"
                  data-wow-delay=".5s"
                >
                  <li>
                    <Link href="/">Home</Link>
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
        <section className="news-standard fix space-top pb-425">
          <div className="container">
            <div className="row g-5">
              <div className="col-lg-8">
                <div className="single-blog-post">
                  <div className="post-featured-thumb">
                    <Image
                      src={post.cover}
                      alt={post.title}
                      width={710}
                      height={430}
                    />
                  </div>
                  <div
                    className="post-content"
                    style={{
                      fontSize: "22px",
                      lineHeight: "1.8",
                      color: "#333",
                    }}
                  >
                    <div className="post-body typography-blog">
                      <ReactMarkdown
                        components={{
                          h2: ({ node, ...props }) => (
                            <h2
                              style={{
                                fontSize: "24px",
                                marginTop: "2rem",
                                marginBottom: "1rem",
                                color: "#4c2b87",
                              }}
                              {...props}
                            />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3
                              style={{
                                fontSize: "20px",
                                marginTop: "1.5rem",
                                marginBottom: "1rem",
                                color: "#6d45b4",
                              }}
                              {...props}
                            />
                          ),
                          p: ({ node, ...props }) => (
                            <p style={{ marginBottom: "1.25rem" }} {...props} />
                          ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote
                              style={{
                                borderLeft: "4px solid #4c2b87",
                                paddingLeft: "1rem",
                                margin: "1.5rem 0",
                                color: "#555",
                                fontStyle: "italic",
                                backgroundColor: "#f9f9f9",
                              }}
                              {...props}
                            />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul
                              style={{
                                paddingLeft: "1.25rem",
                                marginBottom: "1rem",
                              }}
                              {...props}
                            />
                          ),
                          li: ({ node, ...props }) => (
                            <li style={{ marginBottom: "0.5rem" }} {...props} />
                          ),
                        }}
                      >
                        {post.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
              {/* Aqui você pode inserir o Sidebar se quiser */}
            </div>
          </div>
        </section>
        <Cta />
      </main>
      <Footer1 />
    </>
  );
}
