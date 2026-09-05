'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/commerce/Header';
import { useStore } from '@/components/commerce/StoreProvider';
import { cancelOrder, getOrdersByUser, Order } from '@/lib/order-service';
import { Package, Truck, CheckCircle, Clock, Loader2, ArrowLeft, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, userRole } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/orders');
      return;
    }
    if (userRole === 'admin') {
      router.push('/admin');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, userRole, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrdersByUser(user!.uid);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Cancel this order? This cannot be undone.')) return;

    setCancellingOrderId(orderId);
    const cancelled = await cancelOrder(orderId);
    if (cancelled) {
      setOrders((currentOrders) => currentOrders.map((order) => (
        order.id === orderId ? { ...order, status: 'cancelled' } : order
      )));
    } else {
      window.alert('Unable to cancel this order. Please try again.');
    }
    setCancellingOrderId(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-5 h-5 text-success" />;
      case 'shipped': return <Truck className="w-5 h-5 text-primary" />;
      case 'confirmed': return <Package className="w-5 h-5 text-secondary" />;
      default: return <Clock className="w-5 h-5 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-success bg-success/10 border-success/20';
      case 'shipped': return 'text-primary bg-primary/10 border-primary/20';
      case 'confirmed': return 'text-secondary bg-secondary/10 border-secondary/20';
      default: return 'text-warning bg-warning/10 border-warning/20';
    }
  };

  if (userRole === 'admin') {
    return null;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-surface text-text-primary">
        <Header />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface text-text-primary">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-24">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/')} className="p-2 rounded-lg hover:bg-card transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <h1 className="text-3xl font-bold text-text-primary">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <Package className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary">No orders yet</h3>
            <p className="text-text-secondary mt-2">Start shopping to place your first order</p>
            <Link
              href="/products"
              className="inline-block mt-4 px-6 py-2.5 bg-primary text-white rounded-theme font-medium hover:bg-primary-light transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-text-secondary">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-text-secondary">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-4">
                      <span className="text-2xl">📦</span>
                      <div className="flex-1">
                        <p className="font-medium text-text-primary">{item.productName}</p>
                        <p className="text-sm text-text-secondary">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-text-primary">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border mt-4 pt-4 flex flex-wrap justify-between items-center">
                  <div>
                    <p className="text-sm text-text-secondary">Total</p>
                    <p className="text-lg font-bold text-primary">₹{order.totalAmount}</p>
                  </div>
                  {order.status === 'delivered' && (
                    <Link
                      href={`/products/${order.items[0]?.productId}`}
                      className="px-4 py-2 bg-success/10 text-success rounded-theme text-sm font-medium hover:bg-success/20 transition-colors"
                    >
                      Write a Review ✍️
                    </Link>
                  )}
                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingOrderId === order.id}
                      className="inline-flex items-center gap-2 rounded-theme border border-danger/30 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {cancellingOrderId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                      {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}