function broadcastSystemMessage(wss, content) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: "system",
                content: content
            }))
        }
    })
}

function broadcastUserCount(wss) {
    const userCount = wss.clients.size
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: "userCount",
                count: userCount
            }))
        }
    })
}

module.exports = {
    broadcastSystemMessage,
    broadcastUserCount
}