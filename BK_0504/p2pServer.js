// 다른 노드와 통신을 위한 서버

import random from 'random';
import WebSocket from 'ws';
import { WebSocketServer } from 'ws';
import { getBlocks, getLatestBlock, createBlock , addBlock, replaceBlockchain } from './block.js';

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
            handleBlockchainResponse(message.data);
                break;
        }
    })
}

const handleBlockchainResponse = (receiveBlockchain) => {
    const newBlocks = JSON.parse(receiveBlockchain)
    // 받아온 블록의 마지막 인덱스가 내 마지막 블록의 인덱스보다 크다.
    const latestNewBlock = newBlocks[newBlocks.length -1];
    const latestMyBlock = getLatestBlock();

    if (latestNewBlock.index > latestMyBlock.index)
    {
    // 받아온 마지막 블록의 previousHash와 내 마지막 블록의 hash를 확인한다.
        if(latestNewBlock.previousHash === latestMyBlock.hash) {
            if(addBlock(latestNewBlock, latestMyBlock))
            {
                // 제한된 플러딩을 사용한다. Flooding
                broadcasting(responseLatestMessage());
            }
            
        }
    // 받아온 블록의 전체 크기가 1인 경우 -> 재요청
    else if(newBlocks.length === 1) {
        broadcasting(queryAllMessage());
    }

    // 그외
    // 받은 블록체인보다 현재 블록체인이 더 길면 안 바꿈
    // 같으면 바꾸거나 안 바꿈
    // 받은 블록체인이 현재 블록체인보다 길면 바꾼다.
    else {
        replaceBlockchain(newBlocks);
    }
    }

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