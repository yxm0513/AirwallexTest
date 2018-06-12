## Prerequisites

 - Nodejs (My test env is : v8.10.0)

## Run Tests

 1. clone the souce code from github: 	
$ git clone  
 3. install the dependencies. 	
$ cd path; npm install
 5. run all tests: 
$ npm run test

Here are the options to run tests, eg, only run success cases or one single test:
 
 -  test
	 - by defualt, it run all tests,
	 - testname can be specified to run single test.
 -  test:success
	 - run all success(200) type tests.
 - test:error
	 - run all error(400) type tests.
 - list_tests
	 - list all tests
 - gen
	 - generate test case base on defined rules in gen.js
 - gen:success
	 - only generate success(200) tests
 - gen:error
	 - only generate error(200) tests

Details can be found by : $ npm run

## Test development
There is one script to generate test cases according to defined rules, it's gen.js under test folder.
Ususlly, all new tests need to be added in gen.js to generate a test configuration and save it into test.json, test runner will read the configuration from test.json and triage tests accordingly. 
The data options needs to be defined, they will be sent via REST by mocha/chai, meanwhile, the expected return data need also be defined in one test configuration. 
A Sampe test configuration:

    "success_1": {
    "enabled": "yes",
    "input": {
      "payment_method": "SWIFT",
      "bank_country_code": "US",
      "account_name": "h85",
      "account_number": "8qi",
      "swift_code": "ys3pUSwg",
      "aba": "n99zygbcc",
      "bsb": "6a55vc"
    },
    "output": {
      "ret_code": "200",
      "success": "Bank details saved"
    }
  },

 - success_1 : is test name.
 - input: is the data which will be sent to server.
 - output: is expected return values.

