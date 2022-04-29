// 웹에 명령어를 입력해서 내 노드를 제어하는 서버
import express from 'express';      // require 보다 크기가 작다
import bodyParser from 'body-parser';
import { createBlock, getBlocks } from './block.js';    // 함수를 사용하기 위해서 import를 해준다.
import { connectionToPeer, getPeers, sendMessage } from './p2pServer.js';


// 초기화 함수 
const initHttpServer = (myHttpPort) => {
    const app = express();
    app.use(bodyParser.json());

    app.get('/', (req, res) => {
        res.send('Hello world');
    })

    app.get('/blocks', (req, res) => {  // get으로 getBlocks에 담긴 블록을 보여준다
        res.send(getBlocks());
    })

    app.post('/createblock', (req, res) => {    // 만든 블럭의 body.data를 보여준다 data를 주고받기위해서 post를 사용한다.
        const data = req.body.data
        res.send(createBlock(data))
    })

    app.post('/addPeer', (req, res) => {
       res.send(connectionToPeer(req.body.data))
    })

    app.get('/peers', (req, res) => {
        res.send(getPeers());
    })

    app.post('/sendMessage', (req, res) => {
        res.send(sendMessage(req.body.data))
    })

    app.listen(myHttpPort, () => {
        console.log("listening httpServer Port : ", myHttpPort);
    })
}

export { initHttpServer }
