## Prerequisites

 - Nodejs (My test env is : v8.10.0)

## Run Tests

 1. clone the souce code from github: 	
	`$ git clone https://github.com/yxm0513/airwallex`  
 2. install the dependencies. 	
	`$ cd path; npm install`
 3. run all tests: 
	`$ npm run test`

Here are the options to run tests, eg, only run success cases or one single test:
 
 -  test
	 - by defualt, it run all tests,
 - single <testname> 
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
	 - only generate error(400) tests

Details can be found by : $ npm run

## Test development
There is one script to generate test cases according to defined rules, it's gen.js under test folder.
Ususlly, all new tests need to be added in gen.js to generate a test configuration and save it into test.json, test runner will read the configuration from test.json and triage tests accordingly. 
The data options needs to be defined, they will be sent via REST by mocha/chai, meanwhile, the expected return data need also be defined in one test configuration. 

Data fields are generated dynamiclly here(except several fix val), it will be good to cover datas with runing with CI repeatly.

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


## Current Status
 - Totol: 36 (24 passed, 12 failed)
	- success : 10 (8 passed, 2 failed)
	- error: 25(16 passed, 10 failed) 


###Issues:
1. 	For US account_number , it is 1-17 character long in documents, however, the number is 7 and 11 in notificaton as below:
	`Length of account_number should be between 7 and 11 when bank_country_code is 'US'`
	test: error_account_number_3
2. For CN/AU account_number, the prompt message is same as above, they should have different message.
	test: success_3, success_6, error_account_number_4,error_account_number_5,error_account_number_6,error_account_number_7
3. when "account_number":"", length is 0, my expected response is 'Length of account_number should be between 1 and 17 when bank_country_code is 'US'', however, it's ''account_number' is required'.
is it a FAD? since, we already has test to cover input data without 'account_number'
    test: error_account_number_2
4. error_bsb_1, error_bsb_2 need to be verified after fix of #1 and #2
5. error_aba_1 should not pass, becase aba is mandatory when bank country is US
6. error_swift_code_6 shoud not pass, swift code length is not 8 or 11. 



## TODO
 - Add More Tests, like try charsets, current is gsm7, verify other actions(PUT/GET/UPDATE/DELETE) to this URL.
 - Enhance the test template with random data.


Finally, didn't touch mocha/chai much before, however, it should be a good start. 

Hope I can div into them deeply in feature.

