# CI/CD for Ethereum Smart Contracts with CircleCI and Truffle

CI/CD walk-through of a simple demo app (Metacoin by Truffle) using CircleCI and docker.

> If you are interested in doing CI on a windows agent with Visual Studio Team Services instead, take a look at [David Burela's article](https://davidburela.wordpress.com/2016/12/23/ethereum-devops-with-truffle-testrpc-visual-studio-team-services/)


### Configuring the agent requirements
First, we need to request an agent with the docker service enable, because we will be using `Geth` and `testrpc` in containers.  
We also want the latest nodejs version.
 
In `circleci.yml`:
```yaml
machine:
  services:
    - docker
  node:
    version: 7.4.0
```

### Installing the dependencies

We will need [truffle](https://github.com/ConsenSys/truffle) to test and migrate our smart contracts, and [web3](https://github.com/ethereum/web3.js/) to have a JavaScript API for Ethereum.
The easiest way to install them is to use npm.  
Specify this dependencies in your `package.json`:
```json
  "dependencies": {
    "truffle": "^2.1.1",
    "web3": "^0.18.2"
  }
```

By default, CircleCI will detect your `package.json` file and automatically run `npm install`, so you don't need to add anything in your `circleci.yml` at this point.

### Testing the Contract

CircleCI will also run `npm test` just after finishing `npm install`, so we need to modify our `package.json` to correctly launch our tests.  
The easiest way to test a smart contract, is by deploying on an in-memory simulated blockchain. [`testrpc`](https://github.com/ethereumjs/testrpc) allows us to do just that.
For convenience, we are going to use launch `testrpc` inside a container, that way we don't have to deal with installing the depencies.  
You can either build the image yourself from the [`Dockerfile`](https://github.com/ethereumjs/testrpc/blob/master/Dockerfile) or use an existing one: [wbuchwalter/testrpc](https://hub.docker.com/r/wbuchwalter/testrpc/)

If not already done, you need to configure `truffle` with the correct RPC endpoint and network id ([`truffle.js`](truffle.js)).

Here is what our `package.json` script section will look like:

```json
"scripts": {
    "test": "docker run -d -p 8545:8545 --name testrpc wbuchwalter/testrpc  && truffle test",
    "posttest": "docker stop testrpc"
  }
```
We are starting the `testrpc` container in the background (-d) and exposing the `8545` port on the same port on localhost so that truffle can connect.
The `posttest` script will be executed after the `test` script automatically, and ensures we stop our `testrpc` container so that the port `8545` is freed.


### Deploying/Migrating Contracts

Now that our tests are successful you might want to deploy it on a test environment, or directly on your production blockchain.
To keep this example simple, we are going to do the former.

Again, we will be using Geth in a container as well. The official image for Geth is [`ethereum/client-go`](https://hub.docker.com/r/ethereum/client-go/).

Here is what `circleci.yml` will look like:
```yaml
deployment:
  production:
    branch: master
    commands:
      - docker run -it -v $(pwd):/app ethereum/client-go --datadir /app/geth/data init /app/genesis.json
      - docker run -d -p 8545:8545 -v $(pwd):/app ethereum/client-go --datadir /app/geth/data --networkid 20170123 --rpc --unlock 0x322ba17d251afdb6d84fd288b5aef518208cccb9 --password /app/password --rpcaddr "0.0.0.0" --verbosity 5
      - node scripts/waitForEthSync.js
      - truffle migrate
```

The first commands starts Geth, and call `init`. We need to mount the current directory into the container (`-v $(pwd):/app`) so that Geth can access `geth/data` and `genesis.json`.  

Once this is done we actually start the Geth node:
``` bash
docker run -d \ #Run in background
-p 8545:8545 \ #Expose port 8545 so that truffle can connect
-v $(pwd):/app \ #Mount the working directory inside the container 
ethereum/client-go \ #image name
--datadir /app/geth/data \
--networkid 20170123 \ 
--rpc \
--unlock 0x322ba17d251afdb6d84fd288b5aef518208cccb9 \ #unlock an account from the keystore that can submit transactions
--password /app/password \ #file containing the password to unlock the account
--rpcaddr "0.0.0.0" \ #allow localholst connections
--verbosity 5 \ #easier debugging
```

For simplicity, the password is stored in a file in the git repository. This is obviously not ideal. Instead you should use something like CircleCI's environment variables.

This command will start the syncrhonization of the Geth node with the blockchain. This can take a while (you could also use the `--fast` flag), so we need to wait for it to finish before calling `truffle migrate`.
For this purpose, I created a node script([`./scripts/waitForEthSync.js`](./scripts/waitForEthSync.js)), that will connect to the node, and block the deployment pipeline until the syncrhonization is complete:
```JavaScript
attemptConnection('http://0.0.0.0:8545').then(waitForSync).catch(console.log)
``` 

Once the synchronization completed we can submit our migration with `truffle migrate`


You should now have a pipeline similar to this one: [wbuchwalter/circleci-ethereum/48](https://circleci.com/gh/wbuchwalter/circleci-ethereum/48)
