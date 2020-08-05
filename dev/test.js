const Blockchain = require('./blockchain');
const xeCoin = new Blockchain();

const testChain = {
  chain: [
    {
      index: 1,
      timestamp: 1596601501627,
      transactions: [],
      nonce: 100,
      hash: "0",
      previousBlockHash: "0",
    },
    {
      index: 2,
      timestamp: 1596601680434,
      transactions: [
        {
          amount: 200,
          sender: "JOHNHJ2345DFGHSDF",
          recipient: "BOBEEWIFGYTJKL123",
          transactionId: "020cb720d6d411eaaa305b64e423a8d5",
        },
        {
          amount: 10,
          sender: "JOHNHJ2345DFGHSDF",
          recipient: "BOBEEWIFGYTJKL123",
          transactionId: "03e5e3f0d6d411eaaa305b64e423a8d5",
        },
        {
          amount: 35,
          sender: "JOHNHJ2345DFGHSDF",
          recipient: "BOBEEWIFGYTJKL123",
          transactionId: "05bd14f0d6d411eaaa305b64e423a8d5",
        },
      ],
      nonce: 4752,
      hash: "000095c04a4d925e2c38f9f64219924bab63881354c237e0a43c90d120fac555",
      previousBlockHash: "0",
    },
    {
      index: 3,
      timestamp: 1596601683390,
      transactions: [
        {
          amount: 12.5,
          sender: "00",
          recipient: "a1075fc0d6d311eaaa305b64e423a8d5",
          transactionId: "0b9cd5e0d6d411eaaa305b64e423a8d5",
        },
      ],
      nonce: 3667,
      hash: "000040dfb53f753dca424e8ece93a07aa3873075fa41e2429c8ea34b764a01d5",
      previousBlockHash:
        "000095c04a4d925e2c38f9f64219924bab63881354c237e0a43c90d120fac555",
    },
    {
      index: 4,
      timestamp: 1596601685683,
      transactions: [
        {
          amount: 12.5,
          sender: "00",
          recipient: "a1075fc0d6d311eaaa305b64e423a8d5",
          transactionId: "0d5e5c00d6d411eaaa305b64e423a8d5",
        },
      ],
      nonce: 174127,
      hash: "000028ffdb5c69493296ab3b5b67b57c42c37fd1308be386521754c1b0697723",
      previousBlockHash:
        "000040dfb53f753dca424e8ece93a07aa3873075fa41e2429c8ea34b764a01d5",
    },
    {
      index: 5,
      timestamp: 1596601727451,
      transactions: [
        {
          amount: 12.5,
          sender: "00",
          recipient: "a1075fc0d6d311eaaa305b64e423a8d5",
          transactionId: "0ebc6560d6d411eaaa305b64e423a8d5",
        },
        {
          amount: 25,
          sender: "JOHNHJ2345DFGHSDF",
          recipient: "BOBEEWIFGYTJKL123",
          transactionId: "24083570d6d411eaaa305b64e423a8d5",
        },
        {
          amount: 50,
          sender: "JOHNHJ2345DFGHSDF",
          recipient: "BOBEEWIFGYTJKL123",
          transactionId: "262967c0d6d411eaaa305b64e423a8d5",
        },
      ],
      nonce: 36548,
      hash: "00007a78bf7d685b66999ba481b08dcb1df4f55ba900e0166376a92e7674b3e9",
      previousBlockHash:
        "000028ffdb5c69493296ab3b5b67b57c42c37fd1308be386521754c1b0697723",
    },
    {
      index: 6,
      timestamp: 1596601728288,
      transactions: [
        {
          amount: 12.5,
          sender: "00",
          recipient: "a1075fc0d6d311eaaa305b64e423a8d5",
          transactionId: "27a188d0d6d411eaaa305b64e423a8d5",
        },
      ],
      nonce: 32658,
      hash: "0000bee9dce6cdad4fca998ae251852809e37c104897e489f0a490d1a77cde34",
      previousBlockHash:
        "00007a78bf7d685b66999ba481b08dcb1df4f55ba900e0166376a92e7674b3e9",
    },
  ],
  pendingTransactions: [
    {
      amount: 12.5,
      sender: "00",
      recipient: "a1075fc0d6d311eaaa305b64e423a8d5",
      transactionId: "28216730d6d411eaaa305b64e423a8d5",
    },
  ],
  currentNodeUrl: "http://localhost:3001",
  networkNodes: [],
};

// console.log(testChain.getBlock('00007a78bf7d685b66999ba481b08dcb1df4f55ba900e0166376a92e7674b3e9'));

console.log(xeCoin.chainIsValid(testChain.chain));