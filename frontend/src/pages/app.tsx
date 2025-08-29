<<<<<<< HEAD
import { MainLayout } from "../components/Layout/MainLayout";
import { NewConversorInteligente } from "../components/NewConversorInteligente";
import { useState } from "react";

export default function AppPage() {
  const [activeTab, setActiveTab] = useState("Conversor");

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <NewConversorInteligente />
    </MainLayout>
  );
=======
import NewApp from "../components/NewApp";

export default function AppPage() {
  return <NewApp />;
>>>>>>> 43582ad5a028c4800272a24231e28d97db6bab87
}
