'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); 

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();


module.exports.get = async (event, context, callback) => {
  const response =  {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }, null, 2),
  };
  callback(null, response);
  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};


module.exports.submit = (event, context, callback) => {

  const requestBody = JSON.parse(event.body);
  const name = requestBody.name;
  const price = requestBody.price;
  const store = requestBody.store;

  if (typeof name !== 'string' || typeof price !== 'number' || typeof store !== 'string') {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t submit item because of validation errors.'));
    return;
  }


  submitItemP(itemInfo(name, price, store))
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Sucessfully submitted item with name ${name}`,
          nameId: res.id
        })
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to submit item with name ${name} err ${err}`
        })
      });
    });
};

const submitItemP = item => {
    console.log('Submitting item');
    const itemInfo = {
      TableName: process.env.ITEM_TABLE,
      Item: item,
    };
    return dynamoDb.put(itemInfo).promise()
      .then(res => item);
  };
  
  const itemInfo = (name, price, store) => {
    const timestamp = new Date().getTime();
    return {
      id: uuid.v1(),
      name: name,
      price: price,
      store: store,
      submittedAt: timestamp,
      updatedAt: timestamp,
    };
  };


  module.exports.list = (event, context, callback) => {
        var params = {
            TableName: process.env.ITEM_TABLE,
            ProjectionExpression: "id, name, price"
        };
    
        console.log("Scanning item table.");
        const onScan = (err, data) => {
    
            if (err) {
                console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
                callback(err);
            } else {
                console.log("Scan succeeded.");
                return callback(null, {
                    statusCode: 200,
                    body: JSON.stringify({
                        items: data.Items
                    })
                });
            }
    
        };
    
        dynamoDb.scan(params, onScan);
    
    };


