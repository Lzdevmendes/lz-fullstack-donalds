import { redirect } from "next/navigation";

const HomePage = () => {
  redirect("/admin");
};

export default HomePage;
