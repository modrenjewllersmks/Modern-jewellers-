import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MessageCircle, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { buildCartWhatsAppOrderUrl, formatInr } from '../lib/whatsapp';
import { LuxuryImage } from './LuxuryImage';

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateCartQuantity,
    cartItemCount,
    cartSubtotalInr,
    settings,
  } = useStore();

  useEffect(() => {
    if (!isCartOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isCartOpen, closeCart]);

  const handleContinueShopping = () => {
    closeCart();
    document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' });
  };

  const whatsappOrderUrl = buildCartWhatsAppOrderUrl(
    settings.whatsappNumber,
    cart,
    cartSubtotalInr
  );

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Shopping Bag"
          className="fixed inset-0 z-50 flex justify-end"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            className="fixed inset-0 bg-[#292929]/40 backdrop-blur-sm"
          />

          {/* Slide-in Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="relative z-10 w-full max-w-md bg-[#FFFFFF] text-[#292929] border-l border-[#E9DFCE] h-full flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#E9DFCE] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[#C6A66B]" aria-hidden="true" />
                <div>
                  <h2 className="font-editorial text-2xl text-[#292929] leading-none">
                    Your Selection
                  </h2>
                  <p className="text-xs text-[#5A544B] tabular-nums mt-1">
                    {cartItemCount} {cartItemCount === 1 ? 'piece' : 'pieces'} selected
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeCart}
                aria-label="Close shopping cart"
                className="w-10 h-10 rounded-full flex items-center justify-center border border-[#E9DFCE] bg-[#F8F5EF] text-[#292929] hover:border-[#C6A66B] hover:text-[#7D602B] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#F8F5EF] border border-[#C6A66B]/45 flex items-center justify-center mb-5 text-[#C6A66B]">
                  <ShoppingBag className="w-7 h-7 stroke-[1.25]" aria-hidden="true" />
                </div>
                <h3 className="font-editorial text-3xl text-[#292929]">
                  Your bag is currently empty
                </h3>
                <p className="mt-3 text-sm text-[#5A544B] leading-relaxed max-w-xs">
                  Explore our handcrafted bridal sets, gold necklaces, and diamond pieces to build
                  your personal enquiry list.
                </p>
                <button
                  type="button"
                  onClick={handleContinueShopping}
                  className="mt-7 min-h-[46px] px-7 py-3 rounded-lg bg-[#C6A66B] text-[#FFFFFF] text-xs tracking-[0.16em] uppercase font-semibold hover:bg-[#B29155] transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto divide-y divide-[#E9DFCE] px-6">
                  {cart.map(({ product, quantity }) => {
                    const unitPrice = product.priceOnRequest
                      ? 'Price on Request'
                      : formatInr(product.demoPriceInr);
                    const lineTotal = product.priceOnRequest
                      ? 'Price on Request'
                      : formatInr(product.demoPriceInr * quantity);

                    return (
                      <div key={product.id} className="py-5 flex gap-4">
                        <div className="w-20 h-20 rounded-xl shrink-0 border border-[#E9DFCE] bg-[#F8F5EF] overflow-hidden">
                          <LuxuryImage
                            src={product.imageUrl}
                            alt={product.name}
                            containerClassName="w-full h-full"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[11px] tracking-[0.12em] uppercase text-[#7D602B] font-semibold tabular-nums">
                                {product.productCode} · {product.category}
                              </p>
                              <h3 className="font-editorial text-lg text-[#292929] leading-snug truncate">
                                {product.name}
                              </h3>
                              <p className="text-xs text-[#5A544B] tabular-nums mt-0.5">
                                {unitPrice} each (Demo Price)
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeFromCart(product.id)}
                              aria-label={`Remove ${product.name}`}
                              className="w-8 h-8 flex items-center justify-center text-[#5A544B] hover:text-red-700 transition-colors shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-3 pt-1">
                            <div className="inline-flex items-center rounded-lg border border-[#E9DFCE] bg-[#F8F5EF]">
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(product.id, quantity - 1)}
                                aria-label={`Decrease quantity of ${product.name}`}
                                className="w-9 h-9 flex items-center justify-center text-[#292929] hover:text-[#7D602B] transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center text-xs font-semibold tabular-nums text-[#292929]">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(product.id, quantity + 1)}
                                aria-label={`Increase quantity of ${product.name}`}
                                className="w-9 h-9 flex items-center justify-center text-[#292929] hover:text-[#7D602B] transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <span className="text-sm font-semibold text-[#292929] tabular-nums">
                              {lineTotal}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Totals & WhatsApp Checkout */}
                <div className="p-6 bg-[#F8F5EF] border-t border-[#E9DFCE] space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-[#5A544B]">
                      <span>Subtotal ({cartItemCount} items)</span>
                      <span className="tabular-nums font-medium text-[#292929]">
                        {formatInr(cartSubtotalInr)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#E9DFCE]">
                      <span className="text-xs tracking-[0.14em] uppercase text-[#7D602B] font-semibold">
                        Estimated Demo Total
                      </span>
                      <span className="text-xl font-semibold text-[#292929] tabular-nums">
                        {formatInr(cartSubtotalInr)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5A544B] leading-relaxed">
                      Demo catalogue estimate only. Final live gold weight and store pricing will
                      be confirmed directly with you on WhatsApp.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <a
                      href={whatsappOrderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-[#C6A66B] text-[#FFFFFF] text-xs tracking-[0.15em] uppercase font-semibold hover:bg-[#B29155] transition-colors inline-flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(198,166,107,0.28)]"
                    >
                      <MessageCircle className="w-4 h-4" aria-hidden="true" />
                      <span>Proceed to WhatsApp Order</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleContinueShopping}
                      className="w-full min-h-[42px] px-6 py-2.5 rounded-xl border border-[#E9DFCE] bg-[#FFFFFF] text-[#292929] text-xs tracking-[0.14em] uppercase font-semibold hover:border-[#C6A66B] transition-colors"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
