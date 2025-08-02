import apiClient from './apiClient';
import axios from 'axios';
import {API_CONFIG} from '../constants/api';

class OrderService {
  // Lấy danh sách đơn hàng
  async getOrders(filters) {
    try {
      let url = API_CONFIG.ENDPOINTS.ORDERS;
      const params = new URLSearchParams();

      if (filters?.status) {
        params.append('status', filters.status);
      }
      if (filters?.shipper_id) {
        params.append('shipper_id', filters.shipper_id.toString());
      }
      if (filters?.limit) {
        params.append('_limit', filters.limit.toString());
      }
      if (filters?.page) {
        params.append('_page', filters.page.toString());
      }

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Get orders error:', error);
      return [];
    }
  }

  // Lấy chi tiết đơn hàng
  async getOrderById(orderId) {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}`,
      );
      return response.data;
    } catch (error) {
      console.error('Get order by id error:', error);
      return null;
    }
  }

  // Tạo đơn hàng mới
  async createOrder(orderData) {
    try {
      const newOrder = {
        ...orderData,
        order_code: `S7M${Date.now()}`, // Tạo mã đơn hàng unique
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.ORDERS,
        newOrder,
      );
      return response.data;
    } catch (error) {
      console.error('Create order error:', error);
      return null;
    }
  }

  // Cập nhật đơn hàng
  async updateOrder(orderId, updateData) {
    try {
      const updatedData = {
        ...updateData,
        updated_at: new Date().toISOString(),
      };

      // Nếu status là completed, thêm completed_at
      if (updateData.status === 'completed') {
        updatedData.completed_at = new Date().toISOString();
      }

      await apiClient.patch(
        `${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}`,
        updatedData,
      );
      return true;
    } catch (error) {
      console.error('Update order error:', error);
      return false;
    }
  }

  // Xóa đơn hàng
  async deleteOrder(orderId) {
    try {
      await apiClient.delete(`${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}`);
      return true;
    } catch (error) {
      console.error('Delete order error:', error);
      return false;
    }
  }

  // Nhận đơn hàng (cho shipper)
  async acceptOrder(orderId, shipperId) {
    try {
      await this.updateOrder(orderId, {
        status: 'confirmed',
        shipper_id: shipperId,
      });
      return true;
    } catch (error) {
      console.error('Accept order error:', error);
      return false;
    }
  }

  // Bắt đầu giao hàng
  async startDelivery(orderId) {
    try {
      await this.updateOrder(orderId, {
        status: 'delivering',
      });
      return true;
    } catch (error) {
      console.error('Start delivery error:', error);
      return false;
    }
  }

  // Hoàn thành đơn hàng
  async completeOrder(orderId, rating, feedback) {
    try {
      await this.updateOrder(orderId, {
        status: 'completed',
        rating,
        feedback,
      });
      return true;
    } catch (error) {
      console.error('Complete order error:', error);
      return false;
    }
  }

  // Hủy đơn hàng
  async cancelOrder(orderId, reason) {
    try {
      await this.updateOrder(orderId, {
        status: 'cancelled',
        notes: reason,
      });
      return true;
    } catch (error) {
      console.error('Cancel order error:', error);
      return false;
    }
  }

  // Lấy đơn hàng theo shipper
  async getOrdersByShipper(shipperId) {
    try {
      return await this.getOrders({shipper_id: shipperId});
    } catch (error) {
      console.error('Get orders by shipper error:', error);
      return [];
    }
  }

  // Lấy đơn hàng chưa có shipper (cho admin)
  async getPendingOrders() {
    try {
      return await this.getOrders({status: 'pending'});
    } catch (error) {
      console.error('Get pending orders error:', error);
      return [];
    }
  }

  // Lấy đơn hàng theo khu vực (province và ward)
  async getOrdersByArea(province, ward) {
    try {
      const url = `https://92f8fa709052.ngrok-free.app/api/order/filterOrderAddressByCityAndWard?province=${encodeURIComponent(province)}&ward=${encodeURIComponent(ward)}`;
      
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data || [];
    } catch (error) {
      console.error('Get orders by area error:', error);
      return [];
    }
  }
}

export default new OrderService();
