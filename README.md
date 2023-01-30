# hathor-atomic-swap-service
This is the backend that provides a simplified exchange of data between participants of an Atomic Swap for all official
Hathor wallets.

It's designed to run on the AWS serverless environment and uses a MySQL database for persisting data. All data exchanged
with it is encrypted end-to-end and all proposal data stored within is discarded within a week of being used.

![Component Diagram](https://user-images.githubusercontent.com/1299409/207974802-e4a9a50b-c712-440c-8c39-58e1c40be4b5.png)
> The _Wallet Desktop_ app is used as a client reference here, but could be any other wallet-related application.

# Test locally
The plugin `serverless-offline` is used to emulate AWS Lambda and API Gateway on a local machine

## Requirements
- NodeJS v18

## Local database
To setup a local database you will need:
1. A MySQL database running and the `.env` configured with its connection information
   1. One possibility is to use the example pre-configured in the [`docker-compose.yml`](docker-compose.yml) file
2. Run `npx sequelize-cli db:migrate`

This should run all migrations from the `db/migrations` folder and get the database ready.

## `.env` file
Create an `.env` file on the project root folder, containing the following variables, with the values of your local
environment of choice: 
```sh
STAGE=local
DEV_DB=mysql
DB_USERNAME=my_user
DB_PASSWORD=password123
DB_NAME=atomic_swap_service
```
The `STAGE` variable is especially important on the management of MySql connections on the local/test environment.

## Starting local environment
With these requirements above being met, run:
```angular2html
npm run offline
```

# API Calls
Once the application is running, it is possible to manage proposals using it:

## Create a proposal
```shell
curl --location --request POST 'http://localhost:3001/dev/' \
--header 'Content-Type: application/json' \
--data-raw '{
    "partialTx": "partialTxStr1",
    "authPassword": "pass1"
}'
```
