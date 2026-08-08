import { collection, doc, getDocs, getDoc, addDoc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export type OrderItem = {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
};

export type Order = {
  id: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
};

export async function createOrder(userId: string, userEmail: string, userDisplayName: string, items: OrderItem[], shippingAddress: any) {
  try {
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const orderData = {
      userId,
      userEmail,
      userDisplayName,
      items,
      totalAmount,
      status: 'pending' as OrderStatus,
      shippingAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'orders'), orderData);
    return { id: docRef.id, ...orderData };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  try {
    const q = query(collection(db, 'orders'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Order;
    }
    return null;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const docRef = doc(db, 'orders', orderId);
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString()
    };
    if (status === 'delivered') {
      updateData.deliveredAt = new Date().toISOString();
    }
    await updateDoc(docRef, updateData);
    return true;
  } catch (error) {
    console.error('Error updating order:', error);
    return false;
  }
}

export async function canUserReviewProduct(userId: string, productId: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      where('status', '==', 'delivered')
    );
    const snapshot = await getDocs(q);
    
    for (const doc of snapshot.docs) {
      const order = doc.data();
      const items = order.items || [];
      if (items.some((item: any) => item.productId === productId)) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking purchase:', error);
    return false;
  }
}

export async function getUserPurchasedProducts(userId: string): Promise<string[]> {
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      where('status', '==', 'delivered')
    );
    const snapshot = await getDocs(q);
    const productIds: string[] = [];
    
    for (const doc of snapshot.docs) {
      const order = doc.data();
      const items = order.items || [];
      items.forEach((item: any) => {
        if (!productIds.includes(item.productId)) {
          productIds.push(item.productId);
        }
      });
    }
    return productIds;
  } catch (error) {
    console.error('Error fetching purchased products:', error);
    return [];
  }
}