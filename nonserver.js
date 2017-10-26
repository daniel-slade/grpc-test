const os = require('os')

let myId = os.hostname()
let networkInfo = os.networkInterfaces()

function delayLoop () {
  setTimeout(delayLoop, 10000)  
}

console.log(`Starting non-server on ${myId}`)
console.log(`eth0: ${networkInfo.eth0[0].address}`)
console.log(`eth1: ${networkInfo.eth1[0].address}`)

delayLoop()