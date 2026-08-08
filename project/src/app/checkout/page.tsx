'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/commerce/Header';
import { useStore } from '@/components/commerce/StoreProvider';
import { createOrder } from '@/lib/order-service';
import { saveCartSnapshot } from '@/lib/cart-service';
import { Loader2, CheckCircle, Truck, Package, MapPin, CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, cart, refreshCart } = useStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [subtotal, setSubtotal] = useState(0);

  const [shippingData, setShippingData] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }
    if (cart.length === 0) {
      router.push('/cart');
      return;
    }
    const total = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
    setSubtotal(total);
  }, [isAuthenticated, cart, router]);

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingData.fullName || !shippingData.address || !shippingData.city || !shippingData.pincode) {
      alert('Please fill in all shipping details');
      return;
    }
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderItems = cart.map(item => ({
        productId: item.id,
        productName: item.name,
        price: item.price || 0,
        quantity: item.quantity || 1,
        image: item.image,
      }));

      const order = await createOrder(
        user!.uid,
        user!.email || '',
        user!.displayName || 'Customer',
        orderItems,
        shippingData
      );

      setOrderId(order.id);
      
      await saveCartSnapshot(user!.uid, { cart: [], wishlist: [] });
      await refreshCart?.();
      
      setStep('confirmation');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'confirmation' && orderId) {
    return (
      <main className="min-h-screen bg-surface text-text-primary">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary">Order Placed! 🎉</h1>
            <p className="text-text-secondary mt-2">Thank you for your purchase</p>
            <p className="text-sm text-text-secondary mt-1">Order ID: #{orderId.slice(0, 8)}</p>
            
            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="w-4 h-4 text-primary" />
                <span className="text-text-secondary">You can now review your purchased products</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link
                href="/orders"
                className="px-6 py-2.5 bg-primary text-white rounded-theme font-medium hover:bg-primary-light transition-colors"
              >
                View Orders
              </Link>
              <Link
                href="/products"
                className="px-6 py-2.5 border border-border rounded-theme font-medium hover:bg-card transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const total = subtotal + (subtotal * 0.1) + (subtotal > 10000 ? 0 : 100);

  return (
    <main className="min-h-screen bg-surface text-text-primary">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-24">
        <div className="mb-8">
          <button
            onClick={() => router.push('/cart')}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-text-primary">Checkout</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className={`text-sm ${step === 'shipping' ? 'text-primary font-medium' : 'text-text-secondary'}`}>
              📦 Shipping
            </span>
            <span className="text-text-secondary">→</span>
            <span className={`text-sm ${step === 'payment' ? 'text-primary font-medium' : 'text-text-secondary'}`}>
              💳 Payment
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Shipping Address
                </h2>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={shippingData.fullName}
                      onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border rounded-theme bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={shippingData.address}
                      onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border rounded-theme bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="123 Main St"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={shippingData.city}
                        onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                        className="w-full px-4 py-2.5 border border-border rounded-theme bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="Mumbai"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        value={shippingData.state}
                        onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                        className="w-full px-4 py-2.5 border border-border rounded-theme bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="Maharashtra"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        value={shippingData.pincode}
                        onChange={(e) => setShippingData({ ...shippingData, pincode: e.target.value })}
                        className="w-full px-4 py-2.5 border border-border rounded-theme bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="400001"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={shippingData.phone}
                        onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-border rounded-theme bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="9876543210"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-primary text-white rounded-theme font-medium hover:bg-primary-light transition-colors"
                  >
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Payment Details
                </h2>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm text-text-secondary">💳 Test Mode</p>
                    <p className="text-xs text-text-secondary mt-1">Use any card number for testing</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-border rounded-theme bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="4242 4242 4242 4242"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-border rounded-theme bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        CVV *
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-border rounded-theme bg-surface text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep('shipping')}
                      className="px-6 py-2.5 border border-border rounded-theme font-medium hover:bg-card transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 bg-primary text-white rounded-theme font-medium hover:bg-primary-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Pay ₹' + total.toFixed(0)
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm sticky top-24">
              <h3 className="font-semibold text-text-primary mb-4">Order Summary</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="text-2xl">📦</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
                      <p className="text-xs text-text-secondary">Qty: {item.quantity || 1}</p>
                    </div>
                    <p className="text-sm font-medium text-text-primary">₹{(item.price || 0) * (item.quantity || 1)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="text-text-primary">₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Tax (10%)</span>
                  <span className="text-text-primary">₹{(subtotal * 0.1).toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Shipping</span>
                  <span className="text-text-primary">{subtotal > 10000 ? 'FREE' : '₹100'}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span className="text-text-primary">Total</span>
                  <span className="text-primary">₹{total.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}