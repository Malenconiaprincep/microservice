const Koa = require('koa')
const app = new Koa()
const Crud = require('./lib/crud')

app.use(async (ctx,next) => {
  const { username } = ctx.request.query

  const orderCrud = await Crud.get({
    db:'microservice',
    collection: 'orders'
  })

  let orderInfo = await orderCrud.read({
    query:{
      username
    }
  })

  let proids = orderInfo.map(item => item.proid)


  const orderDetailCrud = await Crud.get({
    db:'microservice',
    collection: 'products'
  })

  let orderDetail = await orderDetailCrud.read({
    query: {
      id: {
        $in: proids
      }
    }
  })



  ctx.body = {
    ret_code: 0,
    list: orderDetail,
    user: orderInfo[0],
    msg: '订单列表'
  }
})

app.listen(3002)
