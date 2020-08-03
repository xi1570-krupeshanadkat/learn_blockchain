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
  const newTransaction = req.body;
  const blockIndex = xeCoin.addTransactionToPendingTransactions(newTransaction);
  res.json({ note: `Transaction will be added in block ${blockIndex}.`});
});

// Add New Transaction
app.post('/transaction/broadcast', function(req, res){
  const newTransaction = xeCoin.createNewTransaction(
    req.body.amount, 
    req.body.sender, 
    req.body.recipient
  );
  xeCoin.addTransactionToPendingTransactions(newTransaction);
  const requestPromises = [];
  xeCoin.networkNodes.forEach(networkNode => {
    const requestOptions = {
      uri: networkNode + '/transaction',
      method: 'POST',
      body: newTransaction,
      json: true
    };
    requestPromises.push(rp(requestOptions));
  });
  Promise.all(requestPromises)
    .then(data => {
      res.json({ note: 'Transaction created and broadcast successfully.'});
    });
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

  const requestPromises = [];
  xeCoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/receive-new-block',
      method: 'POST',
      body: { newBlock: newBlock },
      json: true
    }; 
    requestPromises.push(rp(requestOptions));
  });

  Promise.all(requestPromises)
    .then(data => {
      const requestOptions = {
        uri: xeCoin.currentNodeUrl + '/transaction/broadcast',
        method: 'POST',
        body: {
          amount: 12.5, 
          sender:"00", 
          recipient: nodeAddress
        },
        json: true
      };
      return rp(requestOptions);
    })
    .then(data => {
      res.json({
        message : "New Block Mined Successfully",
        block : newBlock
      });
    })
});

app.post('/receive-new-block', function(req, res) {
  const newBlock = req.body.newBlock;
  const lastBlock = xeCoin.getLastBlock();
  const correctHash = lastBlock.hash === newBlock.previousBlockHash;
  const correctIndex = newBlock.index === lastBlock.index + 1;
  if(correctHash && correctIndex) {
    xeCoin.chain.push(newBlock);
    xeCoin.pendingTransactions = [];
    res.json({
      note: 'New block received and accepted.',
      newBlock: newBlock
    });
  }else{
    res.json({
        note:'New block rejected.',
        newBlock: newBlock
    });  
  }
});


const PORT = process.argv[2];

app.listen(PORT, ()=>{
  console.log(`Listening on http://localhost:${PORT}`);
})