import apiClient from './apiClient';
import {API_CONFIG} from '../constants/api';

class NotificationService {
  // Lấy danh sách thông báo
  async getNotifications(userId, unreadOnly = false) {
    try {
      let url = API_CONFIG.ENDPOINTS.NOTIFICATIONS;
      const params = new URLSearchParams();

      if (userId) {
        params.append('user_id', userId.toString());
      }

      if (unreadOnly) {
        params.append('read', 'false');
      }

      // Sắp xếp theo thời gian tạo mới nhất
      params.append('_sort', 'created_at');
      params.append('_order', 'desc');

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Get notifications error:', error);
      return [];
    }
  }

  // Lấy thông báo theo ID
  async getNotificationById(notificationId) {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/${notificationId}`,
      );
      return response.data;
    } catch (error) {
      console.error('Get notification by id error:', error);
      return null;
    }
  }

  // Tạo thông báo mới
  async createNotification(notificationData) {
    try {
      const newNotification = {
        ...notificationData,
        read: false,
        created_at: new Date().toISOString(),
      };

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.NOTIFICATIONS,
        newNotification,
      );
      return response.data;
    } catch (error) {
      console.error('Create notification error:', error);
      return null;
    }
  }

  // Đánh dấu thông báo đã đọc
  async markAsRead(notificationId) {
    try {
      await apiClient.patch(
        `${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/${notificationId}`,
        {
          read: true,
        },
      );
      return true;
    } catch (error) {
      console.error('Mark notification as read error:', error);
      return false;
    }
  }

  // Đánh dấu tất cả thông báo đã đọc
  async markAllAsRead(userId) {
    try {
      // Lấy tất cả thông báo chưa đọc của user
      const unreadNotifications = await this.getNotifications(userId, true);

      // Đánh dấu từng thông báo đã đọc
      const promises = unreadNotifications.map(notification =>
        this.markAsRead(notification.id),
      );

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      return false;
    }
  }

  // Xóa thông báo
  async deleteNotification(notificationId) {
    try {
      await apiClient.delete(
        `${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/${notificationId}`,
      );
      return true;
    } catch (error) {
      console.error('Delete notification error:', error);
      return false;
    }
  }

  // Đếm số thông báo chưa đọc
  async getUnreadCount(userId) {
    try {
      const unreadNotifications = await this.getNotifications(userId, true);
      return unreadNotifications.length;
    } catch (error) {
      console.error('Get unread count error:', error);
      return 0;
    }
  }

  // Gửi thông báo đơn hàng mới (cho admin)
  async notifyNewOrder(orderId, orderCode) {
    try {
      // Gửi thông báo cho tất cả admin
      const usersResponse = await apiClient.get(API_CONFIG.ENDPOINTS.USERS);
      const admins = usersResponse.data.filter(user => user.role === 'admin');

      const promises = admins.map(admin =>
        this.createNotification({
          title: 'Đơn hàng mới',
          message: `Có đơn hàng mới #${orderCode} cần xử lý`,
          type: 'new_order',
          user_id: admin.id,
          order_id: orderId,
        }),
      );

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Notify new order error:', error);
      return false;
    }
  }

  // Gửi thông báo cập nhật đơn hàng (cho shipper)
  async notifyOrderUpdate(orderId, orderCode, shipperId, status) {
    try {
      const statusMap = {
        confirmed: 'đã được xác nhận',
        delivering: 'đang được giao',
        completed: 'đã hoàn thành',
        cancelled: 'đã bị hủy',
      };

      await this.createNotification({
        title: 'Cập nhật đơn hàng',
        message: `Đơn hàng #${orderCode} ${
          statusMap[status] || 'đã được cập nhật'
        }`,
        type: 'order_updated',
        user_id: shipperId,
        order_id: orderId,
      });

      return true;
    } catch (error) {
      console.error('Notify order update error:', error);
      return false;
    }
  }

  // Gửi thông báo hệ thống
  async notifySystem(title, message, userIds) {
    try {
      let targetUsers = [];

      if (userIds && userIds.length > 0) {
        // Gửi cho user cụ thể
        targetUsers = userIds.map(id => ({id}));
      } else {
        // Gửi cho tất cả user
        const usersResponse = await apiClient.get(API_CONFIG.ENDPOINTS.USERS);
        targetUsers = usersResponse.data;
      }

      const promises = targetUsers.map(user =>
        this.createNotification({
          title,
          message,
          type: 'system',
          user_id: user.id,
        }),
      );

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Notify system error:', error);
      return false;
    }
  }

  // Gửi thông báo khuyến mãi
  async notifyPromotion(title, message, data) {
    try {
      // Gửi cho tất cả user
      const usersResponse = await apiClient.get(API_CONFIG.ENDPOINTS.USERS);
      const users = usersResponse.data;

      const promises = users.map(user =>
        this.createNotification({
          title,
          message,
          type: 'promotion',
          user_id: user.id,
          data,
        }),
      );

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Notify promotion error:', error);
      return false;
    }
  }
}

export default new NotificationService();
