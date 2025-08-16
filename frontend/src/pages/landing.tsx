import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function LandingPage() {
  const { t } = useTranslation();
  return (
    <>
      <a href="#main" className="skip-link">
        {t('landing.skipLink')}
      </a>
      <main id="main" className="min-h-screen font-sans">
        {/* Hero Section */}
        <section className="bg-[#dbeafe] text-center py-24 px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1e40af] mb-4">
            {t('landing.heroTitle')}
          </h1>
          <p className="text-xl md:text-2xl text-[#2563eb] italic">
            {t('landing.heroSubtitle')}
          </p>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <h2 className="text-3xl font-semibold text-center text-[#1e40af] mb-12">
            {t('landing.featuresTitle')}
          </h2>
          <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-3">
            <div className="p-6 rounded-lg shadow bg-white">
              <h3 className="text-xl font-semibold text-[#2563eb] mb-2">
                {t('landing.features.smartConversion.title')}
              </h3>
              <p className="text-[#64748b]">
                {t('landing.features.smartConversion.desc')}
              </p>
            </div>
            <div className="p-6 rounded-lg shadow bg-white">
              <h3 className="text-xl font-semibold text-[#2563eb] mb-2">
                {t('landing.features.intuitiveDesign.title')}
              </h3>
              <p className="text-[#64748b]">
                {t('landing.features.intuitiveDesign.desc')}
              </p>
            </div>
            <div className="p-6 rounded-lg shadow bg-white">
              <h3 className="text-xl font-semibold text-[#2563eb] mb-2">
                {t('landing.features.multiplatformSupport.title')}
              </h3>
              <p className="text-[#64748b]">
                {t('landing.features.multiplatformSupport.desc')}
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="bg-[#f8fafc] py-16 px-4">
          <h2 className="text-3xl font-semibold text-center text-[#1e40af] mb-12">
            {t('landing.pricingTitle')}
          </h2>
          <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-3">
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold text-[#2563eb] mb-4">
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
              <h3 className="text-xl font-semibold text-[#2563eb] mb-4">
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
              <h3 className="text-xl font-semibold text-[#2563eb] mb-4">
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
          <h2 className="text-3xl font-bold mb-6">
            {t('landing.ctaTitle')}
          </h2>
          <Link
            href="/app"
            className="inline-block bg-[#3b82f6] hover:bg-[#2563eb] text-white px-8 py-3 rounded-lg font-medium"
          >
            {t('landing.ctaButton')}
          </Link>
        </section>
      </main>
    </>
  );
}
