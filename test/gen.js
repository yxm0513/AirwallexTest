let program = require('commander');

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
let template = {
  "payment_method": "SWIFT",
  "bank_country_code": "US",
  "account_name": "John Smith",
  "account_number": "123",
  "swift_code": "ICBCUSBJ",
  "aba": "11122233A",
  "bsb": "111222"
};

let payment_method = ["SWIFT", "LOCAL"]
let bank_country_code = ["US", "AU", "CN"]
let account_name_min = 2
let account_name_max = 10
let us_account_number_min = 1
let us_account_number_max = 17
let au_account_number_min = 6
let au_account_number_max = 9
let cn_account_number_min = 8
let cn_account_number_max = 20
let swift_pre = 4
let swift_suf1 = 2
let swift_suf2 = 5
let bsb = 6
let aba = 9

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
  let text = "";
  //let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let possible = '@£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞ^{}\[]~|€ÆæßÉ!"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿äöñüàabctefghijklmnopqrstuvwxyz';
  l = get_random(min, max);
  for (let i = 0; i < l; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;

}
/*
 * create positive tests
 */
let tests = {}

if (program.postive) {
  let i = 1;
  payment_method.forEach(function(payment) {
    bank_country_code.forEach(function(country_code) {
      let obj = new Object();
      obj.payment_method = payment;
      obj.bank_country_code = country_code;
      obj.account_name = get_random_text(account_name_min, account_name_max);
      let account_number = '';
      let swift_code = '';
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
      let swift = [];
      swift.push(get_random_text(swift_pre, swift_pre) + country_code + get_random_text(swift_suf1, swift_suf1));
      swift.push(get_random_text(swift_pre, swift_pre) + country_code + get_random_text(swift_suf2, swift_suf2));
      swift_code = swift[Math.floor(Math.random() * swift.length)];
      obj.swift_code = swift_code;
      obj.aba = get_random_text(aba, aba);
      obj.bsb = get_random_text(bsb, bsb);
      let testname = "success_" + String(i);
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
  let clone;
  clone = Object.assign({}, template);
  clone.payment_method = "LOCAL";
  delete clone.swift_code
  let testname = "success_remove_swift_" + String(i++);
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
  testname = "success_remove_bsb_" + String(i++);
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
  testname = "success_remove_aba_" + String(i++);
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
  testname = "success_remove_swift_code_bsb_aba_" + String(i++);
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
  let clone;
  clone = Object.assign({}, template);
  delete clone.payment_method
  let i = 1;
  testname = "error_payment_method_" + String(i++);
  tests[testname] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': '\'payment_method\' field required, the value should be either \'LOCAL\' or \'SWIFT\''
    }
  };
  clone = Object.assign({}, template);
  clone.payment_method = "jdjdj";
  testname = "error_payment_method_" + String(i++);
  tests[testname] = {
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
  i = 1;
  testname = "error_country_code_" + String(i++);
  tests[testname] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': '\'bank_country_code\' is required, and should be one of \'US\', \'AU\', or \'CN\''
    }
  };
  clone = Object.assign({}, template);
  clone.bank_country_code = "error";
  testname = "error_country_code_" + String(i++);
  tests[testname] = {
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
  i = 1;
  testname = "error_account_name_" + String(i++);
  tests[testname] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': '\'account_name\' is required'
    }
  };
  clone = Object.assign({}, template);
  clone.account_name = "e";
  testname = "error_account_name_" + String(i++);
  tests[testname] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': 'Length of account_name should be between 2 and 10'
    }
  };
  clone = Object.assign({}, template);
  clone.account_name = "errorerror1";
  testname = "error_account_name_" + String(i++);
  tests[testname] = {
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
  i = 1;
  testname = "error_account_number_" + String(i++);
  tests[testname] = {
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
  testname = "error_account_number_" + String(i++);
  tests[testname] = {
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
  testname = "error_account_number_" + String(i++);
  tests[testname] = {
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
  testname = "error_account_number_" + String(i++);
  tests[testname] = {
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
  testname = "error_account_number_" + String(i++);
  tests[testname] = {
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
  testname = "error_account_number_" + String(i++);
  tests[testname] = {
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
  testname = "error_account_number_" + String(i++);
  tests[testname] = {
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
  i = 1;
  testname = "error_swift_code_" + String(i++);
  tests[testname] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': '\'swift_code\' is required when payment method is \'SWIFT\''
    }
  };

  clone = Object.assign({}, template);
  clone.swift_code = "adsasdfd"; /* not match */
  testname = "error_swift_code_" + String(i++);
  tests[testname] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': 'The swift code is not valid for the given bank country code: US'
    }
  };

  clone = Object.assign({}, template);
  clone.swift_code = "adsa12fdabc"; /* not match */
  testname = "error_swift_code_" + String(i++);
  tests[testname] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': 'The swift code is not valid for the given bank country code: US'
    }
  };

  clone = Object.assign({}, template);
  clone.swift_code = "adsaUSfdabc1"; /* length is not 8 or 11 */
  testname = "error_swift_code_" + String(i++);
  tests[testname] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': 'Length of \'swift_code\' should be either 8 or 11'
    }
  };

  clone = Object.assign({}, template);
  clone.swift_code = "adsaUS"; /* length is not 8 or 11 */
  testname = "error_swift_code_" + String(i++);
  tests[testname] = {
    'enabled': 'yes',
    'input': clone,
    'output': {
      "ret_code": '400',
      'error': 'Length of \'swift_code\' should be either 8 or 11'
    }
  };
  clone = Object.assign({}, template);
  clone.swift_code = "adsaUS123"; /* length is not 8 or 11 */
  testname = "error_swift_code_" + String(i++);
  tests[testname] = {
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
  i = 1;
  testname = "error_bsb_" + String(i++);
  tests[testname] = {
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
  testname = "error_bsb_" + String(i++);
  tests[testname] = {
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
  i = 1;
  testname = "error_aba_" + String(i++);
  tests[testname] = {
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
  testname = "error_aba_" + String(i++);
  tests[testname] = {
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
  let key, keys = Object.keys(clone);
  let n = keys.length;
  let newobj = {}
  while (n--) {
    key = keys[n];
    newobj[key.toUpperCase()] = clone[key];
  }
  i = 1;
  testname = "error_case_" + String(i++);
  tests[testname] = {
    'enabled': 'yes',
    'input': newobj,
    'output': {
      "ret_code": '400',
      'error': '\'payment_method\' field required, the value should be either \'LOCAL\' or \'SWIFT\''
    }
  };

  clone = Object.assign({}, template);
  for (let i in clone) {
    clone[i] = clone[i].toLowerCase();
  }
  testname = "error_case_" + String(i++);
  tests[testname] = {
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
