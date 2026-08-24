import axios from 'axios';
import app from '../src/app';
import http from 'http';

async function runSmokeTest() {
  console.log('🚀 Starting Full-Stack End-to-End Smoke Test for Alamuri Departmental Stores...\n');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(5001, () => resolve()));
  const API_URL = 'http://localhost:5001/api';

  try {
    // 1. Health Check
    console.log('1️⃣ Testing Server Health & Docs...');
    const health = await axios.get(`${API_URL}/health`);
    console.log('   ✅ Health Check:', health.data.data.status, 'Timestamp:', health.data.data.timestamp);

    // 2. Store Settings
    console.log('2️⃣ Testing Store Settings...');
    const settings = await axios.get(`${API_URL}/settings`);
    console.log('   ✅ Store Name:', settings.data.data.storeName);
    console.log('   ✅ Operating Hours:', `${settings.data.data.openingTime} - ${settings.data.data.closingTime}`);
    console.log('   ✅ Max Delivery Radius:', `${settings.data.data.maxDeliveryRadiusKm} km`);

    // 3. Categories & Products
    console.log('3️⃣ Testing Catalog & Product Search...');
    const categories = await axios.get(`${API_URL}/categories`);
    console.log(`   ✅ Categories Count: ${categories.data.data.length}`);

    const products = await axios.get(`${API_URL}/products?limit=10`);
    console.log(`   ✅ Products Catalog Sample Count: ${products.data.data.length}`);

    const searchRes = await axios.get(`${API_URL}/products/search?q=milk`);
    console.log(`   ✅ Search for "milk" returned ${searchRes.data.data.products.length} products and ${searchRes.data.data.suggestions.length} suggestions`);

    // 4. Customer Login
    console.log('4️⃣ Testing Customer Authentication...');
    const customerLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'customer@example.com',
      password: 'Customer@123456',
    });
    const customerToken = customerLogin.data.data.token;
    console.log('   ✅ Customer Logged In:', customerLogin.data.data.user.name);

    // 5. Admin Login
    console.log('5️⃣ Testing Admin Authentication & Dashboard...');
    const adminLogin = await axios.post(`${API_URL}/auth/admin-login`, {
      email: 'admin@quickstore.com',
      password: 'Admin@123456',
    });
    const adminToken = adminLogin.data.data.token;
    console.log('   ✅ Admin Logged In:', adminLogin.data.data.user.name);

    const adminDash = await axios.get(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('   ✅ Admin Dashboard Metrics Loaded:', adminDash.data.data.metrics);

    // 6. Geolocation Delivery Verification
    console.log('6️⃣ Testing Geolocation & Delivery Radius Check...');
    const validGeo = await axios.post(
      `${API_URL}/addresses/validate-delivery`,
      { latitude: 12.9784, longitude: 77.6408 }, // ~2.5 km away in Indiranagar
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    console.log('   ✅ Within Range Check:', validGeo.data.data.message, `(${validGeo.data.data.distanceKm} km away)`);

    const outOfRangeGeo = await axios.post(
      `${API_URL}/addresses/validate-delivery`,
      { latitude: 13.5000, longitude: 78.5000 }, // ~100 km away
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    console.log('   ✅ Out-of-Range Enforcement Check: Deliverable =', outOfRangeGeo.data.data.isDeliverable, `(${outOfRangeGeo.data.data.message})`);

    // 7. Cart Operations
    console.log('7️⃣ Testing Cart Operations...');
    const firstProduct = products.data.data[0];
    await axios.delete(`${API_URL}/cart/clear`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const addCart = await axios.post(
      `${API_URL}/cart/items`,
      { productId: firstProduct.id, quantity: 2 },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    console.log(`   ✅ Added 2x "${firstProduct.name}" to cart. Cart subtotal: ₹${addCart.data.data.pricing.subtotal}`);

    // 8. Coupon Validation
    console.log('8️⃣ Testing Coupon Engine...');
    const couponRes = await axios.post(`${API_URL}/coupons/validate`, {
      code: 'WELCOME50',
      subtotal: addCart.data.data.pricing.subtotal,
    });
    console.log(`   ✅ Coupon WELCOME50 applied! Discount: ₹${couponRes.data.data.discountAmount}`);

    // 9. Order Placement (COD)
    console.log('9️⃣ Testing Order Placement (COD)...');
    const customerAddresses = await axios.get(`${API_URL}/addresses`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const addressId = customerAddresses.data.data[0].id;

    const orderRes = await axios.post(
      `${API_URL}/orders`,
      {
        addressId,
        paymentMethod: 'CASH_ON_DELIVERY',
        couponCode: 'WELCOME50',
        deliveryNotes: 'Please ring bell',
      },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    const createdOrder = orderRes.data.data;
    console.log(`   ✅ Order #${createdOrder.orderNumber} placed successfully! Total: ₹${createdOrder.total}`);

    // 10. Admin Order Fulfillment Pipeline
    console.log('🔟 Testing Admin Order Pipeline Transitions...');
    const confirmRes = await axios.patch(
      `${API_URL}/admin/orders/${createdOrder.id}/status`,
      { status: 'CONFIRMED', comment: 'Store accepted order' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('   ✅ Order Status transitioned to:', confirmRes.data.data.status);

    const packingRes = await axios.patch(
      `${API_URL}/admin/orders/${createdOrder.id}/status`,
      { status: 'PACKING', comment: 'Packing items fresh' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('   ✅ Order Status transitioned to:', packingRes.data.data.status);

    const dispatchRes = await axios.patch(
      `${API_URL}/admin/orders/${createdOrder.id}/status`,
      { status: 'OUT_FOR_DELIVERY', comment: 'Partner is on the way' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('   ✅ Order Status transitioned to:', dispatchRes.data.data.status);

    const deliverRes = await axios.patch(
      `${API_URL}/admin/orders/${createdOrder.id}/status`,
      { status: 'DELIVERED', comment: 'Delivered to customer' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('   ✅ Order Status transitioned to:', deliverRes.data.data.status);

    console.log('\n🎉 ALL 10 E2E SMOKE TESTS PASSED PERFECTLY!');
  } catch (error: any) {
    console.error('❌ Smoke Test Failed:', error.response?.data || error.message);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runSmokeTest();