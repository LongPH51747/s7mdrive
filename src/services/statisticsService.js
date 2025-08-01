import apiClient from './apiClient';
import {API_CONFIG} from '../constants/api';

class StatisticsService {
  // Lấy thống kê tổng quan
  async getStatistics() {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.STATISTICS);
      return response.data;
    } catch (error) {
      console.error('Get statistics error:', error);
      return null;
    }
  }

  // Lấy thống kê theo khoảng thời gian tùy chỉnh
  async getCustomStatistics(startDate, endDate, shipperId) {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      });

      if (shipperId) {
        params.append('shipper_id', shipperId.toString());
      }

      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.STATISTICS}/custom?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      console.error('Get custom statistics error:', error);
      return null;
    }
  }

  // Lấy hiệu suất shipper
  async getShipperPerformance(shipperId) {
    try {
      let url = `${API_CONFIG.ENDPOINTS.STATISTICS}/shipper-performance`;

      if (shipperId) {
        url += `?shipper_id=${shipperId}`;
      }

      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Get shipper performance error:', error);
      return [];
    }
  }

  // Lấy báo cáo doanh thu theo ngày
  async getRevenueReport(startDate, endDate, groupBy = 'day') {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        group_by: groupBy,
      });

      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.STATISTICS}/revenue?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      console.error('Get revenue report error:', error);
      return [];
    }
  }

  // Tính toán thống kê từ dữ liệu đơn hàng (fallback nếu API không có)
  async calculateStatisticsFromOrders() {
    try {
      // Lấy tất cả đơn hàng
      const ordersResponse = await apiClient.get(API_CONFIG.ENDPOINTS.ORDERS);
      const orders = ordersResponse.data;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeekStart = new Date(
        today.getTime() - today.getDay() * 24 * 60 * 60 * 1000,
      );
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Hàm tính thống kê cho một khoảng thời gian
      const calculatePeriod = (startDate, endDate) => {
        const filteredOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          const isAfterStart = orderDate >= startDate;
          const isBeforeEnd = endDate ? orderDate <= endDate : true;
          return isAfterStart && isBeforeEnd;
        });

        const completed = filteredOrders.filter(o => o.status === 'completed');
        const delivering = filteredOrders.filter(
          o => o.status === 'delivering',
        );
        const pending = filteredOrders.filter(o => o.status === 'pending');
        const cancelled = filteredOrders.filter(o => o.status === 'cancelled');

        const revenue = completed.reduce(
          (sum, order) => sum + (order.shipping_fee || 0),
          0,
        );

        return {
          total_orders: filteredOrders.length,
          completed: completed.length,
          delivering: delivering.length,
          pending: pending.length,
          cancelled: cancelled.length,
          revenue,
        };
      };

      const todayEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);
      const thisWeekEnd = new Date(
        thisWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1,
      );
      const thisMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
      );

      return {
        today: calculatePeriod(today, todayEnd),
        this_week: calculatePeriod(thisWeekStart, thisWeekEnd),
        this_month: calculatePeriod(thisMonthStart, thisMonthEnd),
      };
    } catch (error) {
      console.error('Calculate statistics from orders error:', error);
      return null;
    }
  }

  // Cập nhật thống kê (cho admin)
  async updateStatistics(statistics) {
    try {
      await apiClient.put(API_CONFIG.ENDPOINTS.STATISTICS, statistics);
      return true;
    } catch (error) {
      console.error('Update statistics error:', error);
      return false;
    }
  }
}

export default new StatisticsService();
