import Image from "next/image";
import Link from "next/link";
import { getAllPosts } from "@/app/api/posts/getAllPosts";

export default async function Blog() {
  const posts = getAllPosts();

  return (
    <section className="blog-area fix">
      <div
        className="blog-wrap style1 space-top pb-425"
        style={{ backgroundImage: "url(/assets/img/bg/testimonialBg1_1.png)" }}
      >
        <div className="shape1_1 movingX d-xl-block d-none">
          <Image
            alt="shape"
            width={358}
            height={393}
            src="/assets/img/bg/testimonialBg1_1.png"
          />
        </div>
        <div className="container">
          <div className="title-area mx-auto">
            <h5 className="subtitle text-center wow fadeInUp" data-wow-delay=".3s">
              Notícias &amp; Blog
            </h5>
            <h2 className="title text-center mb-50 wow fadeInUp" data-wow-delay=".3s">
              Notícias e Informações Importantes
            </h2>
          </div>

          <div className="blog-card-wrap style1">
            {posts.map((post) => (
              <div
                className="blog-card style1 img-shine wow fadeInUp"
                data-wow-delay={post.delay || `.3s`}
                key={post.slug}
              >
                <div className="blog-card-thumb style1">
                  <Image
                    src={post.cover}
                    width={322}
                    height={216}
                    alt={`Imagem de ${post.title}`}
                  />
                </div>

                <div className="blog-card-body">
                  <div className="tag-cloud">
                    <div className="meta">
                      <span className="icon">
                        <Image
                          src="/assets/img/icon/userIcon.png"
                          width={20}
                          height={20}
                          alt="autor"
                        />
                      </span>
                      <span className="text">{post.author}</span>
                    </div>
                    <div className="meta">
                      <span className="icon">
                        <Image
                          src="/assets/img/icon/tagIcon.png"
                          width={20}
                          height={20}
                          alt="categoria"
                        />
                      </span>
                      <span className="text">{post.category}</span>
                    </div>
                  </div>

                  <h3 className="blog-title style1">
                    <Link scroll={false} href={`/blog-details/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>

                  <div className="btn-wrapper">
                    <Link scroll={false} href={`/blog-details/${post.slug}`}>
                      Leia Mais
                      <Image
                        alt="ícone"
                        width={16}
                        height={16}
                        src="/assets/img/icon/arrowIconDark.png"
                      />
                    </Link>
                  </div>

                  <div className="calendar">
                    <div className="date">
                      {new Date(post.date).getDate().toString().padStart(2, "0")}
                    </div>
                    <div className="month">
                      {new Date(post.date).toLocaleString("pt-BR", {
                        month: "short",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
