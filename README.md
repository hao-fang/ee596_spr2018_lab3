# EE596 Lab 3 -- DynamoDB

Course Webpage: [EE596 -- Conversational Artificial Intelligence](https://hao-fang.github.io/ee596_spr2018/)

## Taks 1: Create and Query a DyanmoDB table
* Please follow the [Getting Start](https://aws.amazon.com/getting-started/tutorials/create-nosql-table/)
for a quick walkthrough on DynamoDB.

## Taks 2: Save conversation logs and user information in DynamoDB
* Create a DynamoDB table for storing conversation logs
	* Table Name: EE596Lab3Conversations
	* Partition Key: sessionId (String)
	* Sort Key: turnIdx (Number)
* Create another DynamoDB table for storing user information
	* Table Name: EE596Lab3Users
	* Partition Key: userId (String)
* Clone the repository
  ```
  $ git clone https://github.com/hao-fang/ee596_spr2018_lab3.git
  ```
* Create a new Alexa Lambda function `ee596_spr2018_lab3` and upload the zip
	file to this Lambda function. (see Lab 1 -- Task 2 for steps).
  ```
  $ cd lambdaFunc
  $ zip -r ../lambdaFunc.zip *
  ```
  You may also use the script `upload_lambda_func.sh`.
* You need to grant DynamoDB access to your Lambda function.
	* In your AWS Management Console, go to `IAM` dashboard.  
	* In the section `Roles`, you can find the role you created for your lambda function (`lambda_basic_execution`).
	If you don't know which role you used for your lambda function, go to your
	lambda function page for `ee596_spr2018_lab3` and go the section `Execution
	role`.
	* Click the `lambda_basic_execution` role, and choose `Attach policy`.
	* Search for `AmazonDynamoDBFullAccess`, and attach it to the role.
	* This allows your lambda function to access your DynamoDB tables.
* Change your Alexa Skill's Endpoint ARN to this new Lambda Function.
* Now talk to your Alexa Skill and monitor the two DynamoDB tables.

## Task 3: (Optional) Design and create DynamoDB tables for your project

In this task, you will create DynamoDB tables for your project based on
what you learned from Task 1 and Task 2.
Explain how you plan to save data and query the tables.


## Lab Checkoff
* Task 1:
  * Show the DynamoDB table you created.
	* Search for a data entry using the query operation.
	* What's the difference between "Scan" and "Query"?
* Task 2:
  * Show the DynamoDB tables you created.
	* Explain the `saveSessionTurn`, `saveUserData`, `getUserData` functions in `lambdaFunc/index.js`.
	* Make sure you know how to use corresponding APIs in Python.
* Task 3 (Optional):
	* Explain your plan about using DynamoDB tables for your project.
	* Create these DynamoDB tables.

## Lab Report
* Explain the `saveSessionTurn`, `saveUserData`, `getUserData` functions in `lambdaFunc/index.js`.
* Explain the DynamoDB tables you plan to use for your project. Describe the partion key, the sort key (if any), and individual attributes.

## Further Reading
* [[Python and DynamoDB]](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.html)
* [[Improving Data Access with Secondary Indexes]](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SecondaryIndexes.html)

