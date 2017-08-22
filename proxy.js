const Koa = require('koa')
const app = new Koa()

app.use(ctx => {
  ctx.body = '这是3001服务'
})

app.listen(3001)
