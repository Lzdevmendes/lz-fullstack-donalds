import { notFound } from "next/navigation";

// A loja não tem rota raiz — o acesso é sempre via /:slug
const HomePage = () => {
  notFound();
};

export default HomePage;
