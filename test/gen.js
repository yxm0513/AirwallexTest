var program = require('commander');

program
  .version('0.1.0')
  .option('-n, --negative', 'generate negative tests')
  .option('-p, --postive', 'generate postive tests')
  .parse(process.argv);

if (Object.keys(process.argv).length === 2) {
  program.negative = 1;
  program.postive = 1;
}

/*
 * Generate tests
 *
 */
var template = {
  "payment_method": "SWIFT",
  "bank_country_code": "US",
  "account_name": "John Smith",
  "account_number": "123",
  "swift_code": "ICBCUSBJ",
  "aba": "11122233A",
  "bsb": "111222"
};

var payment_method = ["SWIFT", "LOCAL"]
var bank_country_code = ["US", "AU", "CN"]
var account_name_min = 2
var account_name_max = 10
var us_account_number_min = 1
var us_account_number_max = 17
var au_account_number_min = 6
var au_account_number_max = 9
var cn_account_number_min = 8
var cn_account_number_max = 20
var swift_pre = 4
var swift_suf1 = 2
var swift_suf2 = 5
var bsb = 6
var aba = 9

/*
 * get a random number between min and max
 */
function get_random(min, max) {
  return Math.random() * (max - min) + min;
}

/*
 * generate random text, the length is between min and max
 */
function get_random_text(min, max) {
  //return (Math.random().toString(36) + '00000000000000000').slice(2, get_random(min, max) + 2);
  var text = "";
  //var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var possible = '@£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞ^{}\[]~|€ÆæßÉ!"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿äöñüàabctefghijklmnopqrstuvwxyz';
  l = get_random(min, max);
  for (var i = 0; i < l; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;

}
/*
 * create positive tests
 */
var tests = {}

if (program.postive) {
  var i = 1;
  payment_method.forEach(function(payment) {
    bank_country_code.forEach(function(country_code) {
      var obj = new Object();
      obj.payment_method = payment;
      obj.bank_country_code = country_code;
      obj.account_name = get_random_text(account_name_min, account_name_max);
      var account_number = '';
      var swift_code = '';
      if (country_code === 'US') {
        account_number = get_random_text(us_account_number_min, us_account_number_max);
      }
      if (country_code === 'AU') {
        account_number = get_random_text(au_account_number_min, au_account_number_max)
      }
      if (country_code === 'CN') {
        account_number = get_random_text(cn_account_number_min, cn_account_number_max)
      }
      obj.account_number = account_number;
      var swift = [];
      swift.push(get_random_text(swift_pre, swift_pre) + country_code + get_random_text(swift_suf1, swift_suf1));
      swift.push(get_random_text(swift_pre, swift_pre) + country_code + get_random_text(swift_suf2, swift_suf2));
      swift_code = swift[Math.floor(Math.random() * swift.length)];
      obj.swift_code = swift_code;
      obj.aba = get_random_text(aba, aba);
      obj.bsb = get_random_text(bsb, bsb);
      var testname = "success_" + String(i);
      tests[testname] = {
        'enabled': 'yes',
        'input': obj,
        'output': {
          "ret_code": '200',
          'success': 'Bank details saved'
        }
      };
      i++;
    })
  })
  /*
   * add 1: no swift code when it's LOCAL
   */
  var clone;
  clone = Object.assign({}, template);
  clone.payment_method = "LOCAL";
  delete clone.swift_code
  var testname = "success_remove_swift";
  tests[testname] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '200',
      'success': 'Bank details saved'
    }
  };


  /*
   * add 2: remove bsb when it's not AU
   */
  clone = Object.assign({}, template);
  clone.bank_country_code = "US";
  delete clone.bsb
  testname = "success_remove_bsb";
  tests[testname] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '200',
      'success': 'Bank details saved'
    }
  };

  /*
   * add 3: remove aba when it's not US
   */
  clone = Object.assign({}, template);
  clone.bank_country_code = "AU";
  clone.account_number = "asdfqwer";
  clone.swift_code = "asdfAUer"; //need to meet requirements
  delete clone.aba
  testname = "success_remove_aba";
  tests[testname] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '200',
      'success': 'Bank details saved'
    }
  };

  /*
   * add 4: remove aba & bsb when it's CN, and local -> remove swift code
   */
  clone = Object.assign({}, template);
  clone.bank_country_code = "CN";
  clone.payment_method = "LOCAL";
  clone.account_number = "asdfqwer"; //need to meet requirements
  delete clone.swift_code
  delete clone.aba
  delete clone.bsb
  testname = "success_remove_swift_code_bsb_aba";
  tests[testname] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '200',
      'success': 'Bank details saved'
    }
  };
}

/*
 * create negative tests
 */
if (program.negative) {

  /*
   * for payment_method : 1. doesn't exist 2. invalid value
   */
  var clone;
  clone = Object.assign({}, template);
  delete clone.payment_method
  tests["error_payment_method_1"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': '\'payment_method\' field required, the value should be either \'LOCAL\' or \'SWIFT\''
    }
  };
  clone = Object.assign({}, template);
  clone.payment_method = "jdjdj";
  tests["error_payment_method_2"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': '\'payment_method\' field required, the value should be either \'LOCAL\' or \'SWIFT\''
    }
  };


  /*
   * for country_code : 1. doesn't exist 2. invalid value
   */
  clone = Object.assign({}, template);
  delete clone.bank_country_code
  tests["error_country_code_1"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': '\'bank_country_code\' is required, and should be one of \'US\', \'AU\', or \'CN\''
    }
  };
  clone = Object.assign({}, template);
  clone.bank_country_code = "error";
  tests["error_country_code_2"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': '\'bank_country_code\' is required, and should be one of \'US\', \'AU\', or \'CN\''
    }
  };

  /*
   * for account name : 1. doesn't exist 2. invalid value
   */
  clone = Object.assign({}, template);
  delete clone.account_name
  tests["error_account_name_1"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': '\'account_name\' is required'
    }
  };
  clone = Object.assign({}, template);
  clone.account_name = "e";
  tests["error_account_name_2"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': 'Length of account_name should be between 2 and 10'
    }
  };
  clone = Object.assign({}, template);
  clone.account_name = "errorerror1";
  tests["error_account_name_3"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': 'Length of account_name should be between 2 and 10'
    }
  };

  /*
   * for account number  : 1. doesn't exist 2. invalid value for different country
   */

  clone = Object.assign({}, template);
  delete clone.account_number
  tests["error_account_number_1"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': '\'account_number\' is required'
    }
  };

  clone = Object.assign({}, template);
  clone.bank_country_code = "US";
  clone.account_number = ""; /*length <1*/
  tests["error_account_number_2"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': 'Length of account_number should be between 1 and 17 when bank_country_code is \'US\''
    }
  };
  clone = Object.assign({}, template);
  clone.bank_country_code = "US";
  clone.account_number = "1234567890123456789"; /*length > 17 */
  tests["error_account_number_3"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': 'Length of account_number should be between 1 and 17 when bank_country_code is \'US\''
    }
  };

  clone = Object.assign({}, template);
  clone.bank_country_code = "AU";
  clone.account_number = "sdsd"; /*length < 6*/
  tests["error_account_number_4"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': 'Length of account_number should be between 6 and 9 when bank_country_code is \'AU\''
    }
  };
  clone = Object.assign({}, template);
  clone.bank_country_code = "AU";
  clone.account_number = "1234567890a"; /*length > 9*/
  tests["error_account_number_5"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': 'Length of account_number should be between 6 and 9 when bank_country_code is \'AU\''
    }
  };

  clone = Object.assign({}, template);
  clone.bank_country_code = "CN";
  clone.account_number = "sdsd2"; /*length < 8*/
  tests["error_account_number_6"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': 'Length of account_number should be between 8 and 20 when bank_country_code is \'CN\''
    }
  };
  clone = Object.assign({}, template);
  clone.bank_country_code = "CN";
  clone.account_number = "1234567890a1234567890"; /*length > 20*/
  tests["error_account_number_7"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': 'Length of account_number should be between 8 and 20 when bank_country_code is \'CN\''
    }
  };


  /*
   * for swift_code : 1. doesn't exist when payment_method is SWFIT 2. invalid value
   */
  clone = Object.assign({}, template);
  delete clone.swift_code
  tests["error_swift_code_1"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': '\'swift_code\' is required when payment method is \'SWIFT\''
    }
  };

  clone = Object.assign({}, template);
  clone.swift_code = "adsasdfd"; /* not match */
  tests["error_swift_code_2"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': 'The swift code is not valid for the given bank country code: US'
    }
  };

  clone = Object.assign({}, template);
  clone.swift_code = "adsa12fdabc"; /* not match */
  tests["error_swift_code_3"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': 'The swift code is not valid for the given bank country code: US'
    }
  };

  clone = Object.assign({}, template);
  clone.swift_code = "adsaUSfdabc1"; /* length is not 8 or 11 */
  tests["error_swift_code_4"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': 'Length of \'swift_code\' should be either 8 or 11'
    }
  };

  clone = Object.assign({}, template);
  clone.swift_code = "adsaUS"; /* length is not 8 or 11 */
  tests["error_swift_code_5"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': 'Length of \'swift_code\' should be either 8 or 11'
    }
  };
  clone = Object.assign({}, template);
  clone.swift_code = "adsaUS123"; /* length is not 8 or 11 */
  tests["error_swift_code_6"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': 'Length of \'swift_code\' should be either 8 or 11'
    }
  };
  /*
   * for bsb  : 1. doesn't exist when bank country is AU  2. invalid value
   */

  clone = Object.assign({}, template);
  clone.bank_country_code = 'AU';
  delete clone.bsb;
  tests["error_bsb_1"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': ''
    }
  };

  clone = Object.assign({}, template);
  clone.bank_country_code = 'AU';
  clone.bsb = 'sd'; /*length is not 6*/
  tests["error_bsb_2"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': ''
    }
  };


  /*
   * for aba  : 1. doesn't exist when bank country is US  2. invalid value
   */

  clone = Object.assign({}, template);
  clone.bank_country_code = 'US';
  delete clone.aba;
  tests["error_aba_1"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': ''
    }
  };

  clone = Object.assign({}, template);
  clone.bank_country_code = 'US';
  clone.aba = 'sd3'; /*length is not 9*/
  tests["error_aba_2"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': 'Length of \'aba\' should be 9'
    }
  };

  /*
   * for case senstive  :
   */

  clone = Object.assign({}, template);
  var key, keys = Object.keys(clone);
  var n = keys.length;
  var newobj = {}
  while (n--) {
    key = keys[n];
    newobj[key.toUpperCase()] = clone[key];
  }
  tests["error_case_1"] = {
    'enabled': 'yes',
    'input': newobj,
    'output': {
      "ret_code": '400',
      'error': '\'payment_method\' field required, the value should be either \'LOCAL\' or \'SWIFT\''
    }
  };

  clone = Object.assign({}, template);
  for (var i in clone) {
    clone[i] = clone[i].toLowerCase();
  }
  tests["error_case_2"] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': '\'payment_method\' field required, the value should be either \'LOCAL\' or \'SWIFT\''
    }
  };
}

/*
 * print out the results and save to file
 */
console.log(JSON.stringify(tests))
