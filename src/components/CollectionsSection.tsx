import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Eye, MessageCircle, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { buildProductWhatsAppUrl, formatInr } from '../lib/whatsapp';
import type { JewelleryProduct } from '../types/jewellery';
import { LuxuryImage } from './LuxuryImage';
import { RevealBlock } from './MotionPrimitives';

export function CollectionsSection() {
  const {
    products,
    categories,
    settings,
    addToCart,
    selectedCollectionFilter,
    setSelectedCollectionFilter,
  } = useStore();
  const selectedCategory = selectedCollectionFilter;
  const setSelectedCategory = setSelectedCollectionFilter;
  const [selectedProduct, setSelectedProduct] = useState<JewelleryProduct | null>(null);
  const [modalQty, setModalQty] = useState<number>(1);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const categoryTabs = useMemo(() => {
    const names = categories
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => c.name);
    return ['All', ...names];
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const sorted = [...products].sort((a, b) => a.sortOrder - b.sortOrder);
    if (selectedCategory === 'All') return sorted;
    return sorted.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  useEffect(() => {
    if (!selectedProduct) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProduct(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedProduct]);

  const handleQuickAdd = (product: JewelleryProduct) => {
    addToCart(product, 1, false);
    setJustAddedId(product.id);
    window.setTimeout(() => {
      setJustAddedId((curr) => (curr === product.id ? null : curr));
    }, 1500);
  };

  const openProductModal = (product: JewelleryProduct) => {
    setModalQty(1);
    setSelectedProduct(product);
  };

  return (
    <section
      id="collections"
      className="py-20 sm:py-28 bg-[#FFFFFF] text-[#292929] border-b border-[#E9DFCE]"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <RevealBlock className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.22em] uppercase text-[#7D602B] mb-3 font-semibold">
              Jewellery Catalogue
            </p>
            <h2
              className="font-editorial text-[#292929] font-normal leading-[1.08]"
              style={{ fontSize: 'clamp(2.1rem, 4vw, 3.35rem)' }}
            >
              Curated Gold, Diamond & Bridal Collections
            </h2>
            <p className="mt-4 text-base text-[#5A544B] leading-relaxed max-w-xl">
              Select pieces to add to your enquiry bag or consult directly on WhatsApp. All prices
              displayed below are illustrative demo prices editable by the showroom owner.
            </p>
          </div>

          <div className="text-xs text-[#5A544B] tabular-nums">
            Showing {filteredProducts.length} of {products.length} pieces · Demo Catalogue
          </div>
        </RevealBlock>

        {/* Interactive Collection Filter Bar */}
        <div
          role="tablist"
          aria-label="Filter jewellery collections"
          className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 border-b border-[#E9DFCE]"
        >
          {categoryTabs.map((tab) => {
            const active = selectedCategory === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(tab)}
                className={`px-4 py-2 rounded-lg text-xs tracking-[0.12em] uppercase font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[40px] border ${
                  active
                    ? 'bg-[#C6A66B] text-[#FFFFFF] border-[#C6A66B]'
                    : 'bg-[#F8F5EF] text-[#5A544B] border-[#E9DFCE] hover:border-[#C6A66B] hover:text-[#292929]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* 3-Column Luxury Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-[#E9DFCE] bg-[#F8F5EF]">
            <p className="font-editorial text-2xl text-[#292929]">
              No pieces in this category yet
            </p>
            <p className="mt-2 text-sm text-[#5A544B]">
              Select another category or add products from the Owner Admin Dashboard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product) => {
              const displayPrice = product.priceOnRequest
                ? 'Price on Request'
                : formatInr(product.demoPriceInr);
              const isAdded = justAddedId === product.id;

              return (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.06 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="group flex flex-col rounded-2xl overflow-hidden bg-[#FFFFFF] border border-[#E9DFCE] hover:border-[#C6A66B] hover:-translate-y-1 transition-all duration-300 shadow-[0_6px_24px_rgba(41,41,41,0.04)] hover:shadow-[0_18px_40px_rgba(41,41,41,0.09)]"
                >
                  {/* Unique 4:3 Product Photography */}
                  <button
                    type="button"
                    onClick={() => openProductModal(product)}
                    className="relative w-full aspect-[4/3] overflow-hidden bg-[#F8F5EF] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A66B]"
                  >
                    <LuxuryImage
                      src={product.imageUrl}
                      alt={product.name}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  </button>

                  {/* Product Card Content */}
                  <div className="p-6 flex flex-col flex-1 justify-between gap-5">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[#7D602B] tracking-[0.1em] uppercase font-semibold mb-2 tabular-nums">
                        <span>{product.productCode}</span>
                        <span aria-hidden="true" className="text-[#C6A66B]">
                          ·
                        </span>
                        <span className="truncate">{product.category}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => openProductModal(product)}
                        className="text-left focus-visible:outline-none focus-visible:underline"
                      >
                        <h3 className="font-editorial text-2xl text-[#292929] font-medium leading-snug group-hover:text-[#7D602B] transition-colors">
                          {product.name}
                        </h3>
                      </button>

                      <p className="mt-2 text-sm text-[#5A544B] leading-relaxed line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#E9DFCE] flex flex-col gap-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs text-[#5A544B]">Demo Price</span>
                        <span className="text-lg font-semibold text-[#292929] tabular-nums">
                          {displayPrice}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(product)}
                          className={`min-h-[42px] px-3 py-2 rounded-lg text-xs tracking-[0.1em] uppercase font-semibold transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap ${
                            isAdded
                              ? 'bg-[#7D602B] text-[#FFFFFF]'
                              : 'bg-[#C6A66B] text-[#FFFFFF] hover:bg-[#B29155]'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => openProductModal(product)}
                          className="min-h-[42px] px-3 py-2 rounded-lg border border-[#E9DFCE] bg-[#F8F5EF] text-[#292929] text-xs tracking-[0.1em] uppercase font-semibold hover:border-[#C6A66B] hover:bg-[#E9DFCE]/60 transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                        >
                          <Eye className="w-3.5 h-3.5 shrink-0 text-[#7D602B]" aria-hidden="true" />
                          <span>View Details</span>
                        </button>
                      </div>

                      <a
                        href={buildProductWhatsAppUrl(
                          settings.whatsappNumber,
                          product.name,
                          product.productCode,
                          displayPrice
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full min-h-[40px] px-3 py-2 rounded-lg border border-[#C6A66B]/60 text-[#7D602B] text-xs tracking-[0.12em] uppercase font-semibold hover:bg-[#C6A66B] hover:text-[#FFFFFF] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <MessageCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>Order on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Details Modal (Light Luxury Editorial Card) */}
      {selectedProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedProduct.name}
          className="fixed inset-0 z-50 bg-[#292929]/45 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setSelectedProduct(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl rounded-2xl bg-[#FFFFFF] text-[#292929] border border-[#E9DFCE] shadow-[0_28px_70px_rgba(41,41,41,0.2)] grid grid-cols-1 md:grid-cols-2 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close product details"
              className="absolute top-3.5 right-3.5 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-[#FFFFFF]/95 text-[#292929] border border-[#E9DFCE] hover:bg-[#C6A66B] hover:text-[#FFFFFF] hover:border-[#C6A66B] transition-colors shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-[4/3] md:aspect-auto md:h-full bg-[#F8F5EF]">
              <LuxuryImage
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                containerClassName="w-full h-full"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 sm:p-8 flex flex-col justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs tracking-[0.12em] uppercase text-[#7D602B] font-semibold mb-2 tabular-nums">
                  <span>ID: {selectedProduct.productCode}</span>
                  <span aria-hidden="true" className="text-[#C6A66B]">
                    ·
                  </span>
                  <span>{selectedProduct.category}</span>
                </div>

                <h3 className="font-editorial text-3xl text-[#292929] leading-tight">
                  {selectedProduct.name}
                </h3>

                <p className="mt-1.5 text-xs text-[#5A544B]">{selectedProduct.metalPurity}</p>

                <p className="mt-4 text-sm sm:text-base text-[#5A544B] leading-relaxed">
                  {selectedProduct.description}
                </p>

                <div className="mt-6 pt-5 border-t border-[#E9DFCE] flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-[#5A544B]">
                      Demo Catalogue Price
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-[#292929] tabular-nums">
                      {selectedProduct.priceOnRequest
                        ? 'Price on Request'
                        : formatInr(selectedProduct.demoPriceInr)}
                    </p>
                  </div>

                  {/* Quantity Selector */}
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-[#5A544B] mb-1.5">
                      Quantity
                    </p>
                    <div className="inline-flex items-center rounded-lg border border-[#E9DFCE] bg-[#F8F5EF]">
                      <button
                        type="button"
                        onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                        aria-label="Decrease quantity"
                        className="w-10 h-10 flex items-center justify-center text-[#292929] hover:bg-[#E9DFCE]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold tabular-nums">
                        {modalQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setModalQty((q) => Math.min(20, q + 1))}
                        aria-label="Increase quantity"
                        className="w-10 h-10 flex items-center justify-center text-[#292929] hover:bg-[#E9DFCE]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <p className="mt-2 text-[11px] text-[#5A544B]">
                  Demo pricing for website showcase. Final gold weight & rate confirmed at{' '}
                  {settings.brandName}, Sri Muktsar Sahib.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    addToCart(selectedProduct, modalQty, true);
                    setSelectedProduct(null);
                  }}
                  className="w-full min-h-[46px] px-5 py-3 rounded-xl bg-[#C6A66B] text-[#FFFFFF] text-xs tracking-[0.14em] uppercase font-semibold hover:bg-[#B29155] transition-colors inline-flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(198,166,107,0.28)]"
                >
                  <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                  <span>Add to Cart</span>
                </button>

                <a
                  href={buildProductWhatsAppUrl(
                    settings.whatsappNumber,
                    selectedProduct.name,
                    selectedProduct.productCode,
                    selectedProduct.priceOnRequest
                      ? 'Price on Request'
                      : formatInr(selectedProduct.demoPriceInr)
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[46px] px-5 py-3 rounded-xl border border-[#C6A66B] text-[#7D602B] text-xs tracking-[0.14em] uppercase font-semibold hover:bg-[#F8F5EF] transition-colors inline-flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>WhatsApp Enquiry</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
