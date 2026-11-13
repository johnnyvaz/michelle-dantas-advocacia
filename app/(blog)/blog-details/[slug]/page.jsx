import { getPostBySlug } from "@/utils/blogMarkdown";
import ReactMarkdown from "react-markdown";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footers/Footer1";
import Cta from "@/components/common/Cta";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ESCRITORIO, SITE_URL, areaDoPost } from "@/lib/site";

const dataPorExtenso = (d) =>
  new Date(d).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt || "",
    alternates: { canonical: `/blog-details/${slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt || "",
      publishedTime: post.date ? new Date(post.date).toISOString() : undefined,
      authors: [post.author || ESCRITORIO.advogadaResponsavel],
      images: post.cover ? [{ url: post.cover }] : undefined,
    },
  };
}

function articleJsonLd(post) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.cover ? `${SITE_URL}${post.cover}` : undefined,
    datePublished: post.date ? new Date(post.date).toISOString().slice(0, 10) : undefined,
    author: { "@type": "Person", name: post.author || ESCRITORIO.advogadaResponsavel },
    publisher: { "@id": `${SITE_URL}/#escritorio` },
    mainEntityOfPage: `${SITE_URL}/blog-details/${post.slug}`,
    articleSection: post.category || undefined,
    keywords: Array.isArray(post.tags) ? post.tags.join(", ") : undefined,
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();
  const area = areaDoPost(post.category);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(post)) }}
      />
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
                  <li>
                    <Link href="/blog-standard">Blog</Link>
                  </li>
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
                    <p className="post-meta" style={{ fontSize: "16px", color: "#555", marginBottom: "1.5rem" }}>
                      Por <strong>{post.author || ESCRITORIO.advogadaResponsavel}</strong>
                      {post.date && (
                        <>
                          {" · "}
                          <time dateTime={new Date(post.date).toISOString().slice(0, 10)}>
                            {dataPorExtenso(post.date)}
                          </time>
                        </>
                      )}
                      {post.category && <>{" · "}{post.category}</>}
                    </p>
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
                    <aside
                      style={{
                        marginTop: "2rem",
                        padding: "1.25rem 1.5rem",
                        borderLeft: "4px solid #4c2b87",
                        backgroundColor: "#f9f9f9",
                        fontSize: "18px",
                      }}
                    >
                      Precisa de orientação sobre este assunto?{" "}
                      {area && (
                        <>
                          Conheça nossa atuação em <Link href={area.href}>{area.nome}</Link> ou{" "}
                        </>
                      )}
                      <Link href="/contato">fale com o escritório</Link>.
                    </aside>
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
