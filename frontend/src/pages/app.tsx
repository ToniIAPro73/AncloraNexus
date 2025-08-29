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
}
