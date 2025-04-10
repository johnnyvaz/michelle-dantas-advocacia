import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function BlogCardStandard({ post, index }) {
    return (
        <div
            className="blog-card style1 img-shine wow fadeInUp"
            data-wow-delay={`.${index + 2}s`}
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

                <p className="excerpt">
                    {post.excerpt.length > 100
                        ? `${post.excerpt.slice(0, 100)}...`
                        : post.excerpt}
                </p>

                <div className="btn-wrapper mt-3">
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

                <div className="calendar mt-2">
                    <div className="date">
                        {new Date(post.date).getDate().toString().padStart(2, "0")}
                    </div>
                    <div className="month">
                        {new Date(post.date).toLocaleString("pt-BR", { month: "short" })}
                    </div>
                </div>
            </div>
        </div>
    );
}
