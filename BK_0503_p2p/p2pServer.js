// 다른 노드와 통신을 위한 서버

import random from 'random';
import WebSocket from 'ws';
import { WebSocketServer } from 'ws';
import { getBlocks, getLatestBlock, createBlock , addBlock, isValidNewBlock } from './block.js';

const MessageType = {
    // RESPONCE_MESSAGE : 0,   // 받은 메세지 숫자로 메세지의 타입을 정해준다
    // SENT_MESSAGE : 1        // 보낸 메세지

    // 최신 블록 요청
    QUERY_LATEST : 0,
    // 모든 블록 요청
    QUERY_ALL : 1,
    // 블록 전달
    RESPONSE_BLOCKCHAIN : 2,
}

const sockets = [];     
const getPeers = () => {        // 피어를 연결하면 소켓에 담아둔다
    return sockets;
}

// 
const initP2PServer = (p2pPort) => {
    const server = new WebSocketServer({port:p2pPort});
    server.on('connection', (ws) => {          // on 은 connection은 연결이 되면 어떠한 함수를 호출하겠다 라는 식 ws모듈에 있는 내장함수
        initConnection(ws);
    })
    console.log('listening P2PServer Port : ', p2pPort);
}

// 2
const initConnection = (ws) => {
    sockets.push(ws);       // sockets의 배열안의 메모리를 추가하는거
    initMessageHandler(ws);

    write(ws, queryAllMessage());
}

// 1
const connectionToPeer = (newPeer) => {
    console.log(newPeer)
    const ws = new WebSocket(newPeer);
    ws.on('open', () => {       // 상대방의 웹소켓 
        initConnection(ws); 
        console.log('Connect peer : ', newPeer)
        return true;
    });
    ws.on('error', () => { 
        console.log('Fail to Connection peer : ', newPeer) 
        return false;
    });
}

// 3
const initMessageHandler = (ws) => {
    ws.on('message', (data) => {        // 상대방이 하는 동작
        const message = JSON.parse(data);
        switch(message.type)
        {
            // case MessageType.SENT_MESSAGE:      // 메시지 보낼 때
            //     console.log(message.message);
            //     break;
            case MessageType.QUERY_LATEST:
                break;
            case MessageType.QUERY_ALL:         // 내가 누군가한테 블록을 보내달라고 요청
                write(ws, responseAllMessage());
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:        // 누군가 내가 요청한 블록을 보내준상태
            // console.log(ws._socket.remoteAddress, ':', message.data);
            // handleBlockchainResponse(message);
            replaceBlockchain(message.data);
                break;
        }
    })
}
const isValidBlockchain = () => {
    // 같은 제네시스 블록인가
    if(JSON.stringify(receiveBlockchain[0]) !== JSON.stringify(getBlocks()[0])) {
        return false;
    }
    // 체인 내의 모든 블록을 확인
    for(let i = 1; i < receiveBlockchain.lenght; i++) {
        if(isValidNewBlock(receiveBlockchain[i], receiveBlockchain[i - 1]) == false) {
            return false;
        }
    }
    return true;
}

const replaceBlockchain = (receiveBlockchain) => {
    const newBlocks = JSON.parse(receiveBlockchain);
    console.log(newBlocks)

    if (isValidBlockchain(receiveBlockchain)) {

        // let blocks = getBlocks();
        if(receiveBlockchain.lenght > blocks.length) {
            console.log('받은 블록체인 길이가 길다')
            blocks = receiveBlockchain;
        }
        else if(receiveBlockchain.lenght == blocks.length && random.boolean() ) {
            console.log('받은 블록체인 길이가 같다')
            blocks = receiveBlockchain;
        }
    }
    else {
        console.log('받은 블록체인에 문제가 있음')
    }
}

const handleBlockchainResponse = (receiveBlockchain) => {
    // 받은 블록체인보다 현재 블록체인이 더 길면 안 바꿈


    // 같으면 바꾸거나 안 바꿈

    // 받은 블록체인이 현재 블록체인보다 길면 바꾼다.
}

const queryLatestMessage = () => {
    return ({ 
        "type": MessageType.QUERY_LATEST,
        "data": null
        })
}

const queryAllMessage = () => {
    return ({ 
        "type": MessageType.QUERY_ALL,
        "data": null
        })
}

const responseLatestMessage = () => {
    return ({ 
        "type": MessageType.RESPONSE_BLOCKCHAIN,
        "data":JSON.stringify(getLatestBlock())     // 내가 가지고 있는 마지막 블록
        })
}

const responseAllMessage = () => {
    return ({ 
        "type": MessageType.RESPONSE_BLOCKCHAIN,
        "data":JSON.stringify(getBlocks())      // 내가 가지고 있는 전체 블록
        })
}

// 내가 하는 동작
const write = (ws, message) => {        // ws : 보낼 상대방의 정보
    console.log(message)
    ws.send(JSON.stringify(message));
}

const broadcasting = (message) => {
    sockets.forEach( (socket) => {
        write(socket,message);      // 소켓에 담긴 모든 피어들한테 보낸다.
    });
}
const mineBlock = (blockData) => {
    const newBlock = createBlock(blockData);
    if (addBlock(newBlock, getLatestBlock())) {
       broadcasting(responseLatestMessage());
    }
  }

// 내가 새로운 블록을 채굴했을 때 연결된 노드들에게 전파


export { 
    initP2PServer, 
    connectionToPeer, 
    getPeers, 
    broadcasting, 
    mineBlock,
}