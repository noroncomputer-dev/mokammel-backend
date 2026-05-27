// app/page.tsx
import FeaturesSection from "./components/home/FeaturesSection";
import PromoGrid from "./components/home/PromoGrid";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import BrandsAndStats from "./components/sections/BrandsAndStats";
import CategoryFinder from "./components/sections/CategoryFinder";
import FeaturedProducts from "./components/sections/FeaturedProducts";
import HeroSlider from "./components/ui/HeroSlider";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <HeroSlider />
        <PromoGrid />
        <FeaturesSection />
        <CategoryFinder />
        <BrandsAndStats />
        <FeaturedProducts />
      </main>
      <Footer />
    </div>
  );
}
