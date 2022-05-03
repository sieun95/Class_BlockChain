// 블록체인 관련 함수
// 블록 구조 설계


/*
    index : 블록체인의 높이
    data : 블록에 포함된 모든 데이터 (트랜잭션 포함)
    timestamp : 블록이 생성된 시간
    hash : 블록 내부 데이터로 생성한 sha256값 (블록의 유일성 )
    previousHash : 이전 블록의 해쉬 (이전 블록을 참조)
    difficulty : 문제의 난이도
    nonce : 
*/

import CryptoJS from "crypto-js";   // SHA256을 사용하기위해서 

class Block {
  // 블록의 구조를 정리
  constructor(index, data, timestamp, hash, previousHash, difficulty, nonce) {
    this.index = index;
    this.data = data;
    this.timestamp = timestamp;
    this.hash = hash;
    this.previousHash = previousHash;
    this.difficulty = difficulty;
    this.nonce = nonce;
  }
};

const getBlocks = () => {
  // 외부에서 블록을 읽어줄 함수
  return blocks;
};

const getLatestBlock  = () => {
  return blocks[blocks.length - 1];
}

// hash만드는 함수
const calculateHash = (index, data, timestamp, previousHash, difficulty, nonce) => {
  return CryptoJS.SHA256((index + data + timestamp + previousHash + difficulty + nonce).toString()).toString();
};
// 비트코인이 사용하는 방식
// 0이 difficulty만큼의 개수로 시작하는 hash값을 만드는 매개변수 (nonce)를 찾는다.
// 16진수 64자리 
// 16진수 1자리 -> 2진수 4자리 256개의 0과 1로 표현

const creatGenesisBlock = () => {
  // 제네시스 블록 만드는 함수
  const genesisBlock = new Block(   // 첫번째 블록을 만들어 준다.
    0, "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks", 0, 0, 0, 0, 0);
  genesisBlock.hash = calculateHash(
    genesisBlock.index,
    genesisBlock.data,
    genesisBlock.timestamp,
    genesisBlock.previousHash,
    genesisBlock.difficulty,
    genesisBlock.nonce
  );
  return genesisBlock;
};


// 블록을 만드는 함수
const createBlock = (blockData) => {        // blockData라는 변수에 block정보를 담는다.
    // Hash값을 만들기위해서 
  const previousBlock = blocks[blocks.length - 1];  // 블록은 배열이기 때믄에 length -1을 하면 마지막 인덱스를 가져올수있다.
  const nextIndex = previousBlock.index + 1;    // 다음 블록의 인덱스는 현재 인덱스의 값보다 +1
  const nextTimestamp = new Date().getTime() / 1000;
  const nextDifficulty = 1;   // 문제 난이도 20정도가 적당함
  const nextNonce = findNonce(nextIndex, blockData, nextTimestamp, previousBlock.hash, nextDifficulty);
  const nextHash = calculateHash(
    nextIndex,
    blockData,      // 웹에서 보내주는 데이터
    nextTimestamp,
    previousBlock.hash,      // 이전 블록의 해쉬는 previousBlock에 있음
    nextDifficulty,
    nextNonce
  );

  const newBlock = new Block(      
    nextIndex,
    blockData,
    nextTimestamp,
    nextHash,
    previousBlock.hash,
    nextDifficulty,
    nextNonce
  );

  return newBlock;
};

const addBlock = (newBlock, previousBlock) => {
  if (isValidNewBlock(newBlock, previousBlock)) {   // 블록의 무결성 검증을하고 잘 만들어진 블록이면 push해준다.
    blocks.push(newBlock);
    return true
  }
  return false;
}


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
    typeof newBlock.previousHash === "string" &&
    typeof newBlock.difficulty === "number" &&
    typeof newBlock.nonce === "number"
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

const findNonce = (index, data, timestamp, previousHash, difficulty) => {
  let nonce = 0;
  while(true)
  {
    let hash = calculateHash(index, data, timestamp, previousHash, difficulty, nonce);  // 내가 원하는 hash값이 나올때까지 nonce를 바꿔가면서 찾는 식
    if (hashMatchDifficulty(hash, difficulty)) {
      console.log(nonce)
      return nonce;
    }
    nonce++;
  }
}

//hash가 difficulty숫자 만큼의 값이 나오면 문제 해결을 매칭 검사하는 함수
const hashMatchDifficulty = (hash, difficulty) => {
  const binaryHash = hexToBinary(hash);   // 16진수를 2진수로
  const requiredPrefix = '0'.repeat(difficulty);    // 0을 difficulty 만큼 반복하는 변수

  return binaryHash.startsWith(requiredPrefix);   // binaryHash가 requiredPrefix값으로 시작했는가?
}

const hexToBinary = (hex) => {
  //  16진수를 2진수로 변환하는 함수
  const lookupTable = {   
    '0' : '0000', '1' : '0001', '2' : '0010','3' : '0011', 
    '4' : '0100', '5' : '0101', '6' : '0110','7' : '0111', 
    '8' : '1000', '9' : '1001', 'a' : '1010','b' : '1011', 
    'c' : '1100', 'd' : '1101', 'e' : '1110','f' : '1111' 
  }

  // 03cf   실제로는 64자리일것이다
  // 0000-0011-1100-1111 이런식으로 16진수를 2진수로 바꿔준다 

  let binary = '';    // lookupTable에 정의해둔 정보를 바탕으로 hex(hash)에 있는 숫자를 변환해서 넣어둘 변수
  for(let i = 0; i < hex.length; i++)   // hex.length는 hashMatchDifficulty의 hash이다
  {
    if(lookupTable [hex[i]]) {
      binary += lookupTable[hex[i]];    
    }
    else {
      console.log('invalid hex : ', hex)
      return null;
    }
  }
  return binary;
}

// 만들어진 블록을 저장할 배열 제니시스 블록이나 만들어질 블록
// genesisBlock은 가장 먼저 만든 블록이기 때문에 blocks 첫번째 배열에 넣어준다.
let blocks = [creatGenesisBlock()]; 

export { getBlocks, createBlock, getLatestBlock, addBlock, isValidNewBlock, blocks };
