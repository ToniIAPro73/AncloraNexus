import { MainLayout } from "../components/Layout/MainLayout";
import ConversorInteligente from "../components/ConversorInteligente";
import { useState } from "react";


export default function HomePage() {
  const [activeTab, setActiveTab] = useState("Conversor");

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <ConversorInteligente />
    </MainLayout>
  );
}
