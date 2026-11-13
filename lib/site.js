// Dados do escritório usados em metadados, JSON-LD, sitemap e llms.txt.
// Fonte única: mude aqui e todos os pontos acompanham.
// OAB: ainda não informada pelo escritório; quando vier, preencha `oab` e ela
// passa a aparecer no JSON-LD e nos posts.

export const SITE_URL = "https://mdantas.adv.br";

export const ESCRITORIO = {
  nome: "Michelle Dantas Advocacia",
  razaoSocial: "Michelle Dantas Sanches Sociedade Individual de Advocacia",
  cnpj: "51.721.550/0001-30",
  advogadaResponsavel: "Michelle Dantas",
  oab: null,
  email: "contato@mdantas.adv.br",
  telefone: "+55-19-3406-5788",
  whatsapp: "+55-19-99284-5413",
  endereco: {
    rua: "R. Uruguai, 853, Vila Frezzarim",
    cidade: "Americana",
    uf: "SP",
    cep: "13465-680",
  },
  horario: { dias: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], abre: "09:00", fecha: "17:00" },
  redes: [
    "https://www.facebook.com/mdantasadvocacia/",
    "https://www.linkedin.com/company/michelledantasadvocacia/",
    "https://www.instagram.com/michelledantasadvocacia/",
  ],
};

export const AREAS = [
  { nome: "Direito Cível", href: "/service/direito-civel" },
  { nome: "Direito Trabalhista", href: "/service/direito-trabalhista" },
  { nome: "Direito de Família", href: "/service/direito-familia" },
  { nome: "Direito Digital", href: "/service/direito-digital" },
];

// Categoria do post → página de serviço mais próxima (link no fim do artigo).
const AREA_POR_CATEGORIA = {
  "Direito do Trabalho": "/service/direito-trabalhista",
  "Direito Previdenciário": "/service/direito-trabalhista",
  "Direito Digital": "/service/direito-digital",
  "Direito das Mulheres": "/service/direito-familia",
  "Direito do Consumidor": "/service/direito-civel",
  "Direito Cível": "/service/direito-civel",
  "Direito da Saúde": "/service/direito-civel",
  "Direito Imobiliário": "/service/direito-civel",
};

export function areaDoPost(categoria) {
  const href = AREA_POR_CATEGORIA[categoria];
  if (!href) return null;
  const area = AREAS.find((a) => a.href === href);
  return { nome: area.nome, href };
}

/** JSON-LD do escritório, injetado no layout. */
export function legalServiceJsonLd() {
  const e = ESCRITORIO;
  return {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "@id": `${SITE_URL}/#escritorio`,
    name: e.nome,
    legalName: e.razaoSocial,
    taxID: e.cnpj,
    url: SITE_URL,
    logo: `${SITE_URL}/assets/img/logo-dark.png`,
    image: `${SITE_URL}/assets/img/team/michelle.jpeg`,
    email: e.email,
    telephone: e.telefone,
    address: {
      "@type": "PostalAddress",
      streetAddress: e.endereco.rua,
      addressLocality: e.endereco.cidade,
      addressRegion: e.endereco.uf,
      postalCode: e.endereco.cep,
      addressCountry: "BR",
    },
    areaServed: { "@type": "City", name: e.endereco.cidade },
    knowsAbout: [...AREAS.map((a) => a.nome), "Planos de Saúde", "Direito do Consumidor"],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: e.horario.dias,
      opens: e.horario.abre,
      closes: e.horario.fecha,
    },
    founder: {
      "@type": "Person",
      name: e.advogadaResponsavel,
      jobTitle: "Advogada",
      ...(e.oab ? { identifier: e.oab } : {}),
    },
    sameAs: e.redes,
  };
}
