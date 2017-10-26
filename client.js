const os = require('os')
const grpc = require('grpc')
const pingProto = grpc.load(__dirname + '/ping.proto')
const grpcClient = new pingProto.grpctest.PingService('pingserver:3000', grpc.credentials.createInsecure(), {'grpc.lb_policy_name': 'round_robin', 'grpc.min_reconnect_backoff_ms': 100, 'grpc.initial_reconnect_backoff_ms': 100})

let myId = os.hostname()
let networkInfo = os.networkInterfaces()

const pingInterval = 2000
let nextPing = 1

function ping (pingNumber) {
  console.log(`NODEJS: Sending ping: ${pingNumber}`)
  grpcClient.ping({ pingFrom: myId, pingNumber: pingNumber }, (error, response) => {
    if (error) {
      console.log(`NODEJS: ERROR: ${JSON.stringify(error)}`)
    } else {
      console.log(`NODEJS: ${response.message}`)
    }
  })
}

function pingLoop () {
  ping(nextPing++)
  setTimeout(pingLoop, pingInterval)  
}

console.log(`NODEJS: Starting client on ${myId}`)
console.log(`NODEJS: eth0: ${networkInfo.eth0[0].address}`)
console.log(`NODEJS: eth1: ${networkInfo.eth1[0].address}`)

pingLoop()