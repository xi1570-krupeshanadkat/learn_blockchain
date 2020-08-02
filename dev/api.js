const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid');

// For Req.Body to be JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Initialise Blockchain & Miner Node Address
const xeCoin = new Blockchain();
const nodeAddress = uuid.v1().split('-').join('');

// Get Blockchain
app.get('/blockchain', function(req, res){
  res.send(xeCoin);
});

// Post New Transaction in Blockchain
app.post('/transaction', function(req, res){
  try {
    const blockIndex = xeCoin.createNewTransaction(
      req.body.amount, 
      req.body.sender, 
      req.body.recipient
    );
    res.json({message : `Success, transaction will be added in block ${blockIndex}`});
  } catch (error) {
    res.status(400).json({message : "Bad request, invalid body parameters"})
  }
});

// Mine New Block
app.get('/mine', function(req, res){
  const lastBlock = xeCoin.getLastBlock();
  const previousBlockHash = lastBlock['hash'];
  const currentBlockData = {
    index        : lastBlock['index'] + 1,
    transactions : xeCoin.pendingTransactions,
  };
  const nonce = xeCoin.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = xeCoin.hashBlock(previousBlockHash, currentBlockData, nonce);
  const newBlock = xeCoin.createNewBlock(nonce, previousBlockHash, blockHash);
  // Reward Miner from system : "00" as sender in next Mine
  xeCoin.createNewTransaction(10, "00", nodeAddress);
  // respond with mined block
  res.json({
    message : "New Block Mined Successfully",
    block : newBlock
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
  console.log(`Listening on http://localhost:${PORT}`);
})