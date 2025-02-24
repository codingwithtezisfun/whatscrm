import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from "../../BaseUrl";
import '../Styles/paymentgateway.css'; 

const PaymentGatewayForm = () => {
  const [paymentData, setPaymentData] = useState({
    // Offline payment fields
    pay_offline_id: '',
    pay_offline_key: '',
    offline_active: false,
    // Stripe payment fields
    pay_stripe_id: '',
    pay_stripe_key: '',
    stripe_active: false,
    // M-Pesa fields
    mpesa_consumer_key: '',
    mpesa_consumer_secret: '',
    mpesa_shortcode: '',
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem("adminToken");

  // Fetch initial keys and statuses from the backend on mount
  useEffect(() => {
    axios.get(`${BASE_URL}/api/admin/get_payment_gateway_admin`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.data.success && res.data.data) {
          setPaymentData((prev) => ({
            ...prev,
            ...res.data.data,
            offline_active:
              res.data.data.offline_active === 1 || res.data.data.offline_active === true,
            stripe_active:
              res.data.data.stripe_active === 1 || res.data.data.stripe_active === true,
          }));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching payment data', err);
        setLoading(false);
      });
  }, [token]);

  // Handle changes for text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle toggling for active checkboxes
  const handleToggle = (field) => {
    setPaymentData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Update offline and stripe gateways
  const updatePaymentGateway = () => {
    const payload = {
      pay_offline_id: paymentData.pay_offline_id,
      pay_offline_key: paymentData.pay_offline_key,
      offline_active: paymentData.offline_active ? 1 : 0,
      pay_stripe_id: paymentData.pay_stripe_id,
      pay_stripe_key: paymentData.pay_stripe_key,
      stripe_active: paymentData.stripe_active ? 1 : 0,
    };

    axios.post(`${BASE_URL}/api/admin/update_pay_gateway`, payload, {
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setMessage(res.data.success ? 'Payment gateway updated!' : 'Update failed.');
      })
      .catch((err) => {
        console.error(err);
        setMessage('Update failed.');
      });
  };

  // Update M-Pesa credentials (assumed endpoint: /update_mpesa)
  const updateMpesaCredentials = () => {
    const payload = {
      mpesa_consumer_key: paymentData.mpesa_consumer_key,
      mpesa_consumer_secret: paymentData.mpesa_consumer_secret,
      mpesa_shortcode: paymentData.mpesa_shortcode,
    };

    axios.post(`${BASE_URL}/api/admin/update_mpesa`, payload, {
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setMessage(res.data.success ? 'M-Pesa credentials updated!' : 'M-Pesa update failed.');
      })
      .catch((err) => {
        console.error(err);
        setMessage('M-Pesa update failed.');
      });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="payment-gateway-container p-4">
      <h2 className="text-2xl font-bold mb-4">Payment Gateway Admin</h2>

      {/* Offline Payment Section */}
      <div className="mb-8 p-4 border rounded shadow payment-section">
        <h3 className="text-xl mb-2">Offline Payment</h3>
        <div className="mb-2">
          <label className="block mb-1">Account ID:</label>
          <input
            type="text"
            name="pay_offline_id"
            value={paymentData.pay_offline_id}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Account Key:</label>
          <input
            type="text"
            name="pay_offline_key"
            value={paymentData.pay_offline_key}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="flex items-center mb-2 active-section">
          <label className="mr-2">Active:</label>
          <input
            type="checkbox"
            checked={paymentData.offline_active}
            onChange={() => handleToggle('offline_active')}
          />
        </div>
      </div>

      {/* Stripe Payment Section */}
      <div className="mb-8 p-4 border rounded shadow payment-section">
        <h3 className="text-xl mb-2">Stripe Payment</h3>
        <div className="mb-2">
          <label className="block mb-1">Stripe ID:</label>
          <input
            type="text"
            name="pay_stripe_id"
            value={paymentData.pay_stripe_id}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Stripe Key:</label>
          <input
            type="text"
            name="pay_stripe_key"
            value={paymentData.pay_stripe_key}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="flex items-center mb-2 active-section">
          <label className="mr-2">Active:</label>
          <input
            type="checkbox"
            checked={paymentData.stripe_active}
            onChange={() => handleToggle('stripe_active')}
          />
        </div>
      </div>

      <button
        onClick={updatePaymentGateway}
        className="update-btn px-4 py-2 rounded mb-4"
      >
        Update Payment Gateway
      </button>

      {message && <div className="mb-4 message">{message}</div>}

      {/* M-Pesa Credentials Section */}
      <div className="p-4 border rounded shadow mpesa-section">
        <h3 className="text-xl mb-2">M-Pesa Credentials</h3>
        <div className="mb-2">
          <label className="block mb-1">Consumer Key:</label>
          <input
            type="text"
            name="mpesa_consumer_key"
            value={paymentData.mpesa_consumer_key}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Consumer Secret:</label>
          <input
            type="text"
            name="mpesa_consumer_secret"
            value={paymentData.mpesa_consumer_secret}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Shortcode:</label>
          <input
            type="text"
            name="mpesa_shortcode"
            value={paymentData.mpesa_shortcode}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          onClick={updateMpesaCredentials}
          className="update-mpesa-btn px-4 py-2 rounded"
        >
          Update M-Pesa Credentials
        </button>
      </div>
    </div>
  );
};

export default PaymentGatewayForm;
