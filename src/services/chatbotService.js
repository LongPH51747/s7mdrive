const CHATBOT_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const API_KEY = 'AIzaSyBwwkxJNw7H3fxffYvpX8__SWMgViTieQ0';

// System prompt để hướng dẫn AI về ứng dụng
const SYSTEM_PROMPT = `Bạn là trợ lý AI của ứng dụng S7M Drive - một ứng dụng giao hàng và vận chuyển.

VỀ ỨNG DỤNG S7M DRIVE:
- Đây là ứng dụng giao hàng, vận chuyển và quản lý đơn hàng
- Người dùng có thể tạo đơn hàng, theo dõi vị trí, check-in tại điểm giao hàng
- Ứng dụng có các tính năng: Dashboard, Orders, Map Tracking, History, Profile, Check-in

CÁCH TRẢ LỜI:
1. Trả lời bằng tiếng Việt, ngắn gọn và dễ hiểu
2. Nếu người dùng hỏi về tính năng, hãy giải thích rõ ràng
3. Nếu có lỗi hoặc vấn đề, hãy đưa ra hướng dẫn khắc phục
4. Luôn thân thiện và hữu ích
5. Nếu không biết câu trả lời, hãy nói thẳng thắn

CÁC TÍNH NĂNG CHÍNH:
- Dashboard: Xem tổng quan đơn hàng và thống kê
- Orders: Tạo, xem và quản lý đơn hàng
- Map Tracking: Theo dõi vị trí giao hàng
- History: Xem lịch sử đơn hàng
- Profile: Quản lý thông tin cá nhân
- Check-in: Đánh dấu điểm giao hàng

Hãy trả lời câu hỏi của người dùng một cách hữu ích và chính xác.`;

export const chatbotService = {
  async sendMessage(message) {
    try {
      const response = await fetch(CHATBOT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${SYSTEM_PROMPT}\n\nNgười dùng hỏi: ${message}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      throw error;
    }
  },

  getSystemPrompt() {
    return SYSTEM_PROMPT;
  }
}; 