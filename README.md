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
 
 - test
	 - by defualt, it run all tests,
 - single \<testname\> 
	 - testname can be specified to run single test.
 - test:success
	 - run all success(200) type tests.
 - test:error
	 - run all error(400) type tests.
 - list\_tests
	 - list all tests
 - gen
	 - generate test case base on defined rules in gen.js
 - gen:success
	 - only generate success(200) tests
 - gen:error
	 - only generate error(400) tests

Details can be found by : $ npm run


## Test development
The designed tests was managed and generated into file test.json, which can be create by 'npm gen', 

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


 - success\_1 : is test name.
 - input: is the data which will be sent to server.
 - output: is expected return values.

The data fields in configuration are generated dynamiclly, of course, you can edit(include add/enable/disaable) them according your requirements.

Commonly, we define rules to generate tests in gen.js, it's under test folder as well.

Usually, all new tests need to be added in gen.js, and then generate the test configuration and save it into test.json, test runner(mocha) will read the configuration from test.json and trigger tests accordingly.

For each test, the 'input' needs to be defined, they will be sent via REST by mocha/chai, on another side, the expected return data 'output' also needs be defined in each test configuration.

Data fields are generated dynamically here(except several fix val), it will be good to cover datas with runing with CI repeatly.

## Current Status
 - Total: 36 (24 passed, 12 failed)
	- success : 10 (8 passed, 2 failed)
	- error: 25(16 passed, 10 failed) 



### Issues:
1. For US account\_number , it is 1-17 character long in documents, however, the number is 7 and 11 in notificaton as below:
	`Length of account_number should be between 7 and 11 when bank_country_code is 'US'`
	test: error\_account\_number\_3
2. For CN/AU account\_number, the prompt message is same as above, they should have different message.
	test: success\_3, success\_6, error\_account\_number\_4,error\_account\_number\_5,error\_account\_number\_6,error\_account\_number\_7
3. when "account\_number":"", length is 0, my expected response is 'Length of account\_number should be between 1 and 17 when bank\_country\_code is 'US'', however, it's ''account\_number' is required'.
is it a FAD? since, we already has test to cover input data without 'account\_number'
    test: error\_account\_number\_2
4. error\_bsb\_1, error\_bsb\_2 need to be verified after fix of #1 and #2
5. error\_aba\_1 should not pass, becase aba is mandatory when bank country is US
6. error\_swift\_code\_6 shoud not pass, swift code length is not 8 or 11. 



## TODO
 - Enhance the test template gen.js with random data.
 - Add More Tests, combile mutiple invalid fields after current issue fix,
 - othrs tests like try other charsets, current is gsm7, 
 - verify other actions(PUT/GET/UPDATE/DELETE) to this URL.


Finally, I didn't touch mocha/chai much before, however, it should be a good start. Kindly leave some comments, no matter for anything missing in the implemantation, or how to desgin, implement better,  if it's possible:) 

Hope I can div into them deeply in future.

