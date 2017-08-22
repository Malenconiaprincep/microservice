const Koa = require('koa')
const proxy = require('koa-better-http-proxy');
const Router = require('koa-router')
const request = require('request-promise-native')
const KoaBody = require('koa-body')
const session = require('koa-session-minimal')
const redisStore = require('koa-redis')
const Crud = require('./lib/crud')

const app = new Koa()
const router = new Router()

const authList = ['/list','/addorders','/getorderdetail']

app.use(session({
    store: redisStore()
  }))

app.use(async (ctx, next) => {
  console.log('auth')
  if (authList.indexOf(ctx.path) ===-1){
    await next()
  } else {
    console.log(ctx.session)
    if(ctx.session.username) {
      await next()
    } else{
      ctx.body = '未登录'
    }
  }
})

app
  .use(KoaBody())
  .use(router.routes())
  .use(router.allowedMethods());

router.get('/reg', async(ctx, next) => {
    const { username, pass} = ctx.request.query
    const regCrud = await Crud.get({
      db:'microservice',
      collection: 'user'
    })

    const docs = {
      username,
      pass,
    }
    await regCrud.create({
      docs,
    })

    ctx.body = 'success reg'
})

router.get('/login', async(ctx, next) => {
    const { username, pass} = ctx.request.query
    const authCrud = await Crud.get({
      db:'microservice',
      collection: 'user'
    })

    let res = await authCrud.read({
      query:{
        username:username
      }
    })
    res = res[0]
    if(res && res.pass === pass){
      ctx.session.username = res.username
      ctx.body = '登录成功'
    } else {
      ctx.body = '密码不对'
    }
})

router.get('/proxy', proxy('http://localhost:3001'))

router.post('/addorders', async(ctx, next) => {
  const username = ctx.session.username
  const { proid } = ctx.request.body
  const uri = `http://localhost:3003`
  const res = await request({
    uri,
    method: 'POST',
    json: {
      proid,
      username
    }
  })
  ctx.body = res

  ctx.type = 'application/json';
})

router.get('/getorderdetail', async(ctx, next) => {
  const username = ctx.session.username
  const uri = `http://localhost:3002`
  const user = await request({
    uri,
    qs: {
      username
    }
  })
  ctx.body = user

  ctx.type = 'application/json';
})


// Protocol transformation
router.get('/errorTrend', async(ctx, next) => {
  const { app, start, end} = ctx.request.query
  const uri = 'http://localhost:7000/graphql'
  const res = await request({
    uri,
    method: 'POST',
    json:
      {
        "query": `query errorTrend($app:String,$start:Float,$end:Float){
          errorTrend(app: $app,start:$start, end:$end){
            errorTrends {
              app,
              count,
              date,
              v
            }}}`,
        "variables": {
          "app": app,
          "start": start,
          "end": end
        }
      }
  })


  ctx.body = res

  ctx.type = 'application/json';
})



app.listen(3000)
