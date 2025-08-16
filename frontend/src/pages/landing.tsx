import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function LandingPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen font-sans">
      {/* Hero Section */}
      <section className="bg-[#dbeafe] text-center py-24 px-4">
        <h1 className="text-h1 font-bold text-[#1e40af] mb-4">
          {t('landing.heroTitle')}
        </h1>
        <p className="text-xl md:text-2xl text-[#2563eb] italic">
          {t('landing.heroSubtitle')}
        </p>
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
          className="mx-auto mt-10 h-48 w-48"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <rect x="40" y="30" width="120" height="150" rx="12" fill="#ffffff" />
          <path
            d="M60 70h80M60 100h80M60 130h80"
            stroke="#2563eb"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </motion.svg>
      </section>
      {/* Features Section */}
      <section className="py-16 px-4">
        <h2 className="text-h2 font-semibold text-center text-[#1e40af] mb-12">
          {t('landing.featuresTitle')}
        </h2>
        <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-3">
          <div className="p-6 rounded-lg shadow bg-white">
            <h3 className="text-h3 font-semibold text-[#2563eb] mb-2">
              {t('landing.features.smartConversion.title')}
            </h3>
            <p className="text-[#64748b]">
              {t('landing.features.smartConversion.desc')}
            </p>
          </div>
          <div className="p-6 rounded-lg shadow bg-white">
            <h3 className="text-h3 font-semibold text-[#2563eb] mb-2">
              {t('landing.features.intuitiveDesign.title')}
            </h3>
            <p className="text-[#64748b]">
              {t('landing.features.intuitiveDesign.desc')}
            </p>
          </div>
          <div className="p-6 rounded-lg shadow bg-white">
            <h3 className="text-h3 font-semibold text-[#2563eb] mb-2">
              {t('landing.features.multiplatformSupport.title')}
            </h3>
            <p className="text-[#64748b]">
              {t('landing.features.multiplatformSupport.desc')}
            </p>
          </div>
        </section>
      {/* Pricing Section */}
      <section className="bg-[#f8fafc] py-16 px-4">
        <h2 className="text-h2 font-semibold text-center text-[#1e40af] mb-12">
          {t('landing.pricingTitle')}
        </h2>
        <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-3">
          <div className="p-6 border rounded-lg">
            <h3 className="text-h3 font-semibold text-[#2563eb] mb-4">
              {t('landing.pricing.free.title')}
            </h3>
            <p className="text-[#64748b] mb-6">{t('landing.pricing.free.desc')}</p>
            <Link
              href="/app"
              className="block text-center bg-[#2563eb] text-white py-2 px-4 rounded"
            >
              {t('landing.pricing.free.cta')}
            </Link>
          </div>
          <div className="p-6 border-2 border-[#2563eb] rounded-lg">
            <h3 className="text-h3 font-semibold text-[#2563eb] mb-4">
              {t('landing.pricing.pro.title')}
            </h3>
            <p className="text-[#64748b] mb-6">
              {t('landing.pricing.pro.desc')}
            </p>
            <Link
              href="/app"
              className="block text-center bg-[#3b82f6] text-white py-2 px-4 rounded"
            >
              {t('landing.pricing.pro.cta')}
            </Link>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-h3 font-semibold text-[#2563eb] mb-4">
              {t('landing.pricing.enterprise.title')}
            </h3>
            <p className="text-[#64748b] mb-6">
              {t('landing.pricing.enterprise.desc')}
            </p>
            <Link
              href="/app"
              className="block text-center bg-[#2563eb] text-white py-2 px-4 rounded"
            >
              {t('landing.pricing.enterprise.cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-20 bg-[#1e293b] text-white px-4">
        <h2 className="text-h2 font-bold mb-6">
          {t('landing.ctaTitle')}
        </h2>
        <Link
          href="/app"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-8 py-3 font-medium text-white transition-colors hover:bg-[#1e40af] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1e293b] focus:ring-white sm:w-auto"
        >
          <span>{t('landing.ctaButton')}</span>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </section>
    </div>
  );
}
