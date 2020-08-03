const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid');
const rp = require('request-promise');

// For Req.Body to be JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Initialise Blockchain & Miner Node Address
const xeCoin = new Blockchain();
const nodeAddress = uuid.v1().split('-').join('');


// Register Network Node and Broadcast to all other already registered Nodes
app.post('/register-and-broadcast-node', function(req, res){
  const newNodeUrl = req.body.newNodeUrl;
  if(xeCoin.networkNodes.indexOf(newNodeUrl) === -1){
    // Register new Node with current Node
    xeCoin.networkNodes.push(newNodeUrl);

    // Broadcast new Node 
    const regNodesPromises = [];
    xeCoin.networkNodes.forEach(networkNodeUrl => {
      const requestOptions = {
        uri : networkNodeUrl + '/register-node',
        method : 'POST',
        body : {newNodeUrl : newNodeUrl},
        json : true
      };
      regNodesPromises.push(rp(requestOptions));
    });

    Promise.all(regNodesPromises)
      .then(data => {
        const bulkRegisterOptions = { 
          uri: newNodeUrl + '/register-nodes-bulk',
          method: 'POST',
          body: {allNetworkNodes: [...xeCoin.networkNodes, xeCoin.currentNodeUrl]},
          json: true
        };
        return rp(bulkRegisterOptions);
      })
      .then(data => {
        res.json({ note: 'New node registered with network successfully.' });
      });
  }
});


// Register Brodcasted Node
app.post('/register-node', function (req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  const isNodeAlreadyPresent = xeCoin.networkNodes.indexOf(newNodeUrl) !== -1;
  const isCurrentNode = xeCoin.currentNodeUrl === newNodeUrl;
  if(!isNodeAlreadyPresent && !isCurrentNode){
    xeCoin.networkNodes.push(newNodeUrl);
    res.json({message : "New node registered successfully"})
  }else{
    res.json({message : "Node already present"})
  }
});


// Register Already Existing Node in New Node
app.post('/register-nodes-bulk', function (req, res) {
  const allNetworkNodes = req.body.allNetworkNodes;
  allNetworkNodes.forEach(networkNodeUrl => {
    const isNodeAlreadyPresent = xeCoin.networkNodes.indexOf(networkNodeUrl) !== -1;
    const isCurrentNode = xeCoin.currentNodeUrl === networkNodeUrl;
    if(!isNodeAlreadyPresent && !isCurrentNode){
      xeCoin.networkNodes.push(networkNodeUrl);
    }
  });
  res.json({message : "Bulk Registeration successful."})
});


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


const PORT = process.argv[2];

app.listen(PORT, ()=>{
  console.log(`Listening on http://localhost:${PORT}`);
})