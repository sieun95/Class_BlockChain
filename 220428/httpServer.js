// 웹에 명령어를 입력해서 내 노드를 제어하는 서버
import express from 'express';      // require 보다 크기가 작다
import bodyParser from 'body-parser';
import { createBlock, getBlocks } from './block.js';

// 초기화 함수 
const initHttpServer = (myHttpPort) => {
    const app = express();
    app.use(bodyParser.json());

    app.get('/', (req, res) => {
        res.send('Hello world');
    })

    app.get('/blocks', (req, res) => {
        res.send(getBlocks());
    })

    app.post('/createblock', (req, res) => {
        const data = req.body.data
        res.send(createBlock(data))
    })

    

    app.listen(myHttpPort, () => {
        console.log("listening httpServer Port : ", myHttpPort);
    })
}

export { initHttpServer }
