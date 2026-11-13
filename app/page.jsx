import Home1 from "./home/page";
export const metadata = {
  title: { absolute: "Advogada em Americana/SP | Michelle Dantas Advocacia" },
  description:
    "Escritório em Americana/SP com atuação em Direito Cível, Trabalhista, de Família, Digital e ações contra planos de saúde. Fale pelo WhatsApp (19) 99284-5413.",
  alternates: { canonical: "/" },
};
export default function Page() {
  return (
    <>
      <Home1 />
    </>
  );
}
