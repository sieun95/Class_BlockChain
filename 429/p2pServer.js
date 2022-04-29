// 다른 노드와 통신을 위한 서버

import WebSocket from 'ws';
import { WebSocketServer } from 'ws';

const sockets = [];
const getPeers = () => {
    return sockets
}

const initP2PServer = (p2pPort) => {
    const server = new WebSocketServer({port:p2pPort});
    server.on('connection', (ws) => {          // on 은 connection은 연결이 되면 어떠한 함수를 호출하겠다 라는 식 ws모듈에 있는 내장함수
        initConnection(ws);
    })
    console.log('listening P2PServer Port : ', p2pPort);
}

const initConnection = (ws) => {
    sockets.push(ws);       // sockets의 배열안의 메모리를 추가하는거
}

const connectionToPeer = (newPeer) => {
    console.log(newPeer)
    const ws = new WebSocket(newPeer);
    ws.on('open', () => { 
        initConnection(ws); 
        console.log('Connect peer : ', newPeer)
        return true;
    });
    ws.on('error', () => { 
        console.log('Fail to Connection peer : ', newPeer) 
        return false;
    });
}

export { initP2PServer, connectionToPeer, getPeers }