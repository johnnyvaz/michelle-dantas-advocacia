import Link from "next/link";
import { AREAS, ESCRITORIO } from "@/lib/site";

// Texto da página /sobre. Só fatos já publicados pelo escritório (razão social,
// CNPJ, endereço, horário, áreas). História, ano de fundação e OAB entram quando
// o escritório informar.
export default function SobreEscritorio() {
  const e = ESCRITORIO;
  return (
    <section className="space-top pb-120">
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-7">
            <div className="title-area">
              <h5 className="subtitle text-start">O escritório</h5>
              <h2 className="title text-start mb-4">Advocacia em Americana/SP</h2>
            </div>
            <p className="mb-3">
              A {e.nome} é um escritório de advocacia em {e.endereco.cidade}, no interior de
              São Paulo, registrado como {e.razaoSocial} (CNPJ {e.cnpj}). A equipe é liderada
              pela advogada {e.advogadaResponsavel} e atende pessoas e empresas em Direito
              Cível, Trabalhista, de Família e Digital, além de causas contra planos de saúde.
            </p>
            <p className="mb-3">
              O atendimento é feito no escritório, na {e.endereco.rua}, {e.endereco.cidade}/
              {e.endereco.uf}, de segunda a sexta, das 9h às 17h, e também pelo WhatsApp
              (19) 99284-5413 e pelo e-mail {e.email}.
            </p>
            <p>
              No <Link href="/blog-standard">blog</Link>, a equipe publica artigos que explicam
              direitos do consumidor, do trabalhador, da saúde e do ambiente digital em
              linguagem direta.
            </p>
          </div>
          <div className="col-lg-5">
            <h3 className="h5 mb-3">Áreas de atuação</h3>
            <ul className="list-unstyled d-flex flex-column gap-2">
              {AREAS.map((a) => (
                <li key={a.href}>
                  <Link href={a.href}>{a.nome}</Link>
                </li>
              ))}
              <li>
                <Link href="/service/direito-civel">Planos de saúde e direito do consumidor</Link>
              </li>
            </ul>
            <p className="mt-4">
              <Link href="/contato" className="gt-btn">
                Fale com o escritório
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
