const sha256 = require('sha256');
const uuid = require('uuid');
const currentNodeUrl = process.argv[3];

// Blockchain Constructor with Genesis block
function Blockchain() {
  this.chain               = [];
  this.pendingTransactions = [];

  this.currentNodeUrl = currentNodeUrl;
  this.networkNodes = [];
  this.createNewBlock(100, '0', '0');
}

// Create new block in blockchain
Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash){
  const newBlock = {
    index             : this.chain.length + 1,
    timestamp         : Date.now(),
    transactions      : this.pendingTransactions,
    nonce             : nonce,
    hash              : hash,
    previousBlockHash : previousBlockHash
  };
  this.pendingTransactions = [];
  this.chain.push(newBlock);
  return newBlock;
};

// Get last block in blockchain
Blockchain.prototype.getLastBlock = function(){
  return this.chain[this.chain.length - 1];
};

// Create New Transaction in blockchain
Blockchain.prototype.createNewTransaction = function(amount, sender, recipient) {
  const newTransaction = {
    amount    : amount,
    sender    : sender,
    recipient : recipient,
    transactionId : uuid.v1().split('-').join('')
  };
  return newTransaction;
};

Blockchain.prototype.addTransactionToPendingTransactions = function(transactionObj) {
  this.pendingTransactions.push(transactionObj);
  return this.getLastBlock()['index'] + 1;
};

// Hashing Single Block
Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce){
  const dataAsString = previousBlockHash + 
                       nonce.toString() + 
                       JSON.stringify(currentBlockData);
  const hash = sha256(dataAsString);
  return hash;
};

// Proof of Work
Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData){
  let nonce = 0;
  let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  while(hash.substr(0, 4) !== '0000'){
    nonce++;
    hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  }
  return nonce;
};

// Consensur Algorithm - Longest Chain Rule
Blockchain.prototype.chainIsValid = function(blockchain){
  let validChain = true; 
  for (let i = 1; i < blockchain.length; i++) {
    const currentBlock = blockchain[i];
    const previousBlock = blockchain[i-1];
    const blockHash = this.hashBlock(
      previousBlock['hash'],
      {transactions: currentBlock['transactions'], index: currentBlock['index']},
      currentBlock['nonce']
    );
    if (blockHash.substring(0, 4) !== '0000') validChain = false;
		if (currentBlock['previousBlockHash'] !== previousBlock['hash']) validChain = false;
  }

  const genesisBlock = blockchain[0];
	const correctNonce = genesisBlock['nonce'] === 100;
	const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
	const correctHash = genesisBlock['hash'] === '0';
	const correctTransactions = genesisBlock['transactions'].length === 0;

	if (!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) validChain = false;

  return validChain;
};


module.exports = Blockchain;