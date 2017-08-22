const Koa = require('koa')
const app = new Koa()
const KoaBody = require('koa-body')
const Crud = require('./lib/crud')

app.use(KoaBody())

app.use(async (ctx,next) => {
  const { proid, username } = ctx.request.body
  const orderCrud = await Crud.get({
    db:'microservice',
    collection: 'orders'
  })

  const docs = {
    proid,
    username
  }

  await orderCrud.create({
    docs,
  })

  ctx.body = {
    ret_code:0,
    msg: '订单写入成功',
    proid
  }
})

app.listen(3003)
