// 블록체인 관련 함수
// 블록 구조 설계

/*
    index : 블록체인의 높이
    data : 블록에 포함된 모든 데이터 (트랜잭션 포함)
    timestamp : 블록이 생성된 시간
    hash : 블록 내부 데이터로 생성한 sha256값 (블록의 유일성 )
    previousHash : 이전 블록의 해쉬 (이전 블록을 참조)
*/

import CryptoJS from "crypto-js";   // SHA256을 사용하기위해서 

class Block {
  // 블록의 구조를 정리
  constructor(index, data, timestamp, hash, previousHash) {
    this.index = index;
    this.data = data;
    this.timestamp = timestamp;
    this.hash = hash;
    this.previousHash = previousHash;
  }
};

const getBlocks = () => {
  // 외부에서 블록을 읽어줄 함수
  return blocks;
};

const calculateHash = (index, data, timestamp, previousHash) => {
  // hash만드는 함수
  return CryptoJS.SHA256(
    (index + data + timestamp + previousHash).toString()).toString();
};

const creatGenesisBlock = () => {
  // 제네시스 블록 만드는 함수
  const genesisBlock = new Block(   // 첫번째 블록을 만들어 준다.
    0,
    "The Times 03/jan/2009 Chancellor on brink of second bailout for banks",
    new Date().getTime() / 1000,
    0,
    0
  );
  genesisBlock.hash = calculateHash(
    genesisBlock.index,
    genesisBlock.data,
    genesisBlock.timestamp,
    genesisBlock.previousHash
  );

  return genesisBlock;
};

// 만들어진 블록을 저장할 배열 제니시스 블록이나 만들어질 블록
// genesisBlock은 가장 먼저 만든 블록이기 때문에 blocks 첫번째 배열에 넣어준다.
const blocks = [creatGenesisBlock()]; 
// 블록을 만드는 함수
const createBlock = (blockData) => {        // blockData라는 변수에 block정보를 담는다.
    // Hash값을 만들기위해서 
  const previousBlock = blocks[blocks.length - 1];  // 블록은 배열이기 때믄에 length -1을 하면 마지막 인덱스를 가져올수있다.
  const nextIndex = previousBlock.index + 1;    // 다음 블록의 인덱스는 현재 인덱스의 값보다 +1
  const nextTimestamp = new Date().getTime() / 1000;

  const nextHash = calculateHash(
    nextIndex,
    blockData,      // 웹에서 보내주는 데이터
    nextTimestamp,
    previousBlock.hash      // 이전 블록의 해쉬는 previousBlock에 있음
  );

  const newBlock = new Block(      
    nextIndex,
    blockData,
    nextTimestamp,
    nextHash,
    previousBlock.hash
  );
  if (isValidNewBlock(newBlock, previousBlock)) {   // 블록의 무결성 검증을하고 잘 만들어진 블록이면 push해준다.
    blocks.push(newBlock);
    return newBlock;    // 웹에서 보고싶어서 return을 한거다.
  }
  console.log("fail to create newblock");
  return null;
};

// 블록의 무결성 검증
/* 
    블록의 인덱스가 이전 블록인덱스보다 1 크다.
    블록의 previousHash가 이전 블록의 hash이다.
    블록의 구조가 일치해야 한다.
*/

const inValidBlockStructure = (newBlock) => {
  if (
    typeof newBlock.index === "number" &&
    typeof newBlock.data === "string" &&
    typeof newBlock.timestamp === "number" &&
    typeof newBlock.hash === "string" &&
    typeof newBlock.previousHash === "string"
  ) {
    return true;
  }
  return false;
};

const isValidNewBlock = (newBlock, previousBlock) => { // newBlock이 올바른 블록인지 확인하는 함수
  // 이전 블록이랑 index가 다르면
  if (newBlock.index !== previousBlock.index + 1) {
    console.log("invalid index");
    return false;
  } else if (newBlock.previousHash !== previousBlock.hash) {
    console.log("invalid previous hash");
    return false;
  } else if (inValidBlockStructure(newBlock) == false) {
    console.log("newBlock이 구조가 내가 정의한 클래스 구조와 일치하는가?");
    return false;
  }
  return true;
};

export { getBlocks, createBlock };
