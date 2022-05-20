const toHexString = (byteArray) => {
    // byte 값들을 문자열로 치환
return Array.from(byteArray, (byte) => {
    return ('0x' + (byte & 0xFF).toString(16)).slice(-2)
  }).join('');
}

toHexString([50, 30])