import {externalApiClient} from './apiClient';
import {API_CONFIG} from '../constants/api';

class StatisticsService {
  // Lấy thống kê tổng quan
  async getStatistics(shipperId) {
    try {
      if (!shipperId) {
        console.error("❌ ShipperId is missing in getStatistics");
        return null;
      }
      const url = API_CONFIG.ENDPOINTS.ORDER_BY_SHIPPER(shipperId);
      const response = await externalApiClient.get(url);
      return response.data;
    } catch (error) {
      console.error("Get statistics error:", error);
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

      const response = await externalApiClient.get(
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
      let url = `${API_CONFIG.ENDPOINTS.ORDER_BY_SHIPPER}/shipper-performance`;

      if (shipperId) {
        url += `?shipper_id=${shipperId}`;
      }

      const response = await externalApiClient.get(url);
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

      const response = await externalApiClient.get(
        `${API_CONFIG.ENDPOINTS.STATISTICS}/revenue?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      console.error('Get revenue report error:', error);
      return [];
    }
  }

  // Tính toán thống kê từ dữ liệu đơn hàng (fallback nếu API không có)
  async calculateStatisticsFromOrders(province = 'Hà Nội', ward = 'Xuân Phương') {
    try {
      // Lấy tất cả đơn hàng từ external API
      const url = `${API_CONFIG.ENDPOINTS.ORDER_FILTER_BY_AREA}?province=${encodeURIComponent(province)}&ward=${encodeURIComponent(ward)}`;
      const ordersResponse = await externalApiClient.get(url);
      const orders = ordersResponse.data || [];

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
      await externalApiClient.put(API_CONFIG.ENDPOINTS.STATISTICS, statistics);
      return true;
    } catch (error) {
      console.error('Update statistics error:', error);
      return false;
    }
  }

  // Lấy thống kê hôm nay cho shipper
  async getTodayStatisticsByShipper(shipperId) {
    try {
      const url = API_CONFIG.ENDPOINTS.ORDER_BY_SHIPPER(shipperId);
      const response = await externalApiClient.get(url);
      const orders = Array.isArray(response.data) ? response.data : [];
  
      // Phòng xa: chỉ lấy đúng đơn thuộc shipper này
      const shipperOrders = orders.filter(
        o => String(o.shipper) === String(shipperId)
      );
  
      // Mốc thời gian theo giờ máy (VN +07:00 là hợp lý vì server trả ISO có 'Z')
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
      const isToday = (o) => {
        const d = new Date(o.updatedAt || o.createdAt);
        return d >= startOfDay && d <= endOfDay;
      };
  
      // Đơn giao thành công hôm nay (status = 7)
      const deliveredToday = shipperOrders.filter(
        o => Number(o.status) === 7 && isToday(o)
      );
  
      // Tổng chuyến đi
      const totalTrips = deliveredToday.length;
  
      // Tổng sản phẩm đã giao
      const totalProducts = deliveredToday.reduce((sum, o) =>
        sum + (o.orderItems?.reduce((s, i) => s + (Number(i.quantity) || 0), 0) || 0)
      , 0);
  
      // Thu nhập hôm nay: chỉ tính COD
      const totalRevenue = deliveredToday.reduce((sum, o) =>
        String(o.payment_method || '').toUpperCase() === 'COD'
          ? sum + (Number(o.total_amount) || 0)
          : sum
      , 0);
  
      // Năng suất = đơn giao thành công / tổng đơn hôm nay
      const totalOrdersToday = shipperOrders.filter(isToday).length;
      const productivity = totalOrdersToday
        ? Math.round((totalTrips / totalOrdersToday) * 100)
        : 0;
  
      return {
        totalTrips,
        totalProducts,
        totalRevenue,
        productivity,
        todayOrders: deliveredToday,
      };
    } catch (error) {
      console.error('Get today statistics by shipper error:', error);
      return null;
    }
  }
}

export default new StatisticsService();
