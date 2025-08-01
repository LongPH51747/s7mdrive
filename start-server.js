const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Add middleware để handle CORS
server.use(middlewares);

// Add this before server.use(router)
server.use(jsonServer.rewriter({
  '/api/*': '/$1',
}));

server.use(router);

const port = 3000;
server.listen(port, () => {
  console.log(`🚀 JSON Server đang chạy tại http://localhost:${port}`);
  console.log('📊 Database: db.json');
  console.log('🔗 Endpoints:');
  console.log('   - GET /users (Danh sách người dùng)');
  console.log('   - GET /orders (Danh sách đơn hàng)');
  console.log('   - GET /statistics (Thống kê)');
  console.log('   - GET /notifications (Thông báo)');
});