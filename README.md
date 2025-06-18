
````markdown
# VoteX: Decentralized Voting Application

**VoteX** is a hybrid blockchain-based voting application that combines the security and transparency of blockchain with the efficiency of traditional web apps. The goal is to create a secure, transparent, and accessible digital voting ecosystem suitable for academic, organizational, or community elections.

---

##  Overview

VoteX addresses the core challenges in modern digital voting systems:

- **Security**: Voting logic is executed on the Energy Web Volta blockchain.
- **Transparency**: All votes are permanently and publicly verifiable on-chain.
- **Accessibility**: Simple and intuitive user interface for non-technical users.
- **Scalability**: Hybrid architecture supports elections of varying sizes.

---

##  Technology Stack

### Frontend
- **React.js** and **Next.js** – UI development
- **Ethers.js** – Blockchain wallet & smart contract interactions
- **Tailwind CSS** – Styling

### Backend
- **Node.js** – Server-side JavaScript
- **Express.js** – RESTful API creation
- **MongoDB** – Data storage (voters, candidates, elections)

### Blockchain
- **Solidity** – Smart contract development
- **Hardhat** – Ethereum development framework
- **IPFS** – Decentralized storage for assets
- **Energy Web Volta Testnet** – Deployment & testing

---

##  Installation and Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git
- MongoDB (running locally or in the cloud)

---

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/VoteX.git
cd VoteX
````

---

### 2. Install Dependencies

```bash
npm install
```

---

##  MetaMask Setup

### Install MetaMask

* Download from [https://metamask.io](https://metamask.io)
* Create a wallet and **store your recovery phrase safely**

### Add Volta Testnet to MetaMask

* Network Name: `Energy Web Volta`
* RPC URL: `https://volta-rpc.energyweb.org`
* Chain ID: `73799`
* Currency Symbol: `VT`
* Block Explorer: `https://volta-explorer.energyweb.org/`

### Get Test Tokens

* Visit the [Volta Faucet](https://voltafaucet.energyweb.org/) and request test tokens using your wallet address

---

##  Smart Contract Deployment

### Configure Environment

Create a `.env` file in the root directory:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
```

### Deploy Smart Contracts (Hardhat)

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network volta
```

After deployment, update the `constants.js` file in the frontend with the contract address.

---

##  Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` folder:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

Run the server:

```bash
npm start
```

---

##  Frontend Setup

Go back to the root directory:

```bash
cd ..
npm run dev
```

Visit the app at: [http://localhost:3000](http://localhost:3000)

---

## 🗳️ How to Use VoteX

### For Admins (Election Organizers)

* Connect MetaMask wallet (admin address)
* Create elections, add candidates, set timing
* Publish and monitor election activity

### For Voters

* Connect MetaMask wallet
* View available elections
* Select a candidate and cast a vote
* Confirm the transaction on MetaMask
* Verify your vote on the blockchain

---

##  Development & Contribution

### Local Smart Contract Testing

```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

### deploying Smart Contract in Volta testnet

Run the command:
npx hardhat run scripts/deploy.js --network volta

Next add the address of the deployed contract (printed as a result of the previous command) in the "context/constants.js" file.


##  PS
The website still needs some modifications and error handling, feel free to fork this repository, open issues, and submit pull requests. All contributions are welcome. 