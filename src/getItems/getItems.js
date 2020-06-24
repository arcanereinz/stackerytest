const AWS = require('aws-sdk');
const axios = require('axios');
const url = 'http://checkip.amazonaws.com/';

exports.handler = async (event, context) => {
  // Use dynamodb to get items from the Items table
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: process.env.TABLE_NAME,
  };

  let allItems = [];
  let axiosResponse;

  try {
    console.log(`Getting data from table ${process.env.TABLE_NAME}.`);
    const items = await dynamodb.scan(params).promise(); // get items from DynamoDB
    items.Items.forEach((item) => allItems.push(item)); // put contents in an array for easier parsing
    allItems.forEach((item) => console.log(`Item ${item.id}: ${item.content}\n`)); // log the contents

    axiosResponse = await axios(url);
  } catch (error) {
    console.log(
      `Error getting data from table ${process.env.TABLE_NAME}. Make sure this function is running in the same environment as the table.`,
    );
    throw new Error(error); // stop execution if data from dynamodb not available
  }

  // Return a 200 response if no errors
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `${allItems.length} items found`,
      location: axiosResponse.data,
    }),
  };

  return response;
};
