const os = require('os')
const grpc = require('grpc')
const pingProto = grpc.load(__dirname + '/ping.proto')

let myId = os.hostname()
let networkInfo = os.networkInterfaces()
let myIp = networkInfo.eth0[0].address

function doPing (call, callback) {
  let i = call.request.pingNumber
  let from = call.request.pingFrom
  console.log(`NODEJS: Got ping ${i} from ${from}`)
  callback(null, { message: `Ping Reply ${i} to ${from} from ${myId}(${myIp})`})
}

function startServer () {
  const server = new grpc.Server();
  
  process.on('SIGTERM', () => {
    console.log('NODEJS: shutdown received, closing...')

    let timer = setTimeout(() => {
      server.forceShutdown()
      console.log('NODEJS: ...shutdown received, closed (by force)')
    }, 4000)

    server.tryShutdown(() => {
      console.log('NODEJS: ...shutdown received, closed')
      clearTimeout(timer)
    })
  })

  server.addService(pingProto.grpctest.PingService.service, { ping: doPing })
  server.bind('0.0.0.0:3000', grpc.ServerCredentials.createInsecure())
  server.start()
}

console.log('NODEJS: Starting server')
console.log(`NODEJS: eth0: ${networkInfo.eth0[0].address}`)
console.log(`NODEJS: eth1: ${networkInfo.eth1[0].address}`)

startServer()
