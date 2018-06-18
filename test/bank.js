let chai = require('chai');
let chaiHttp = require('chai-http');
let log = require('mocha-logger');

let assert = require('assert');
let should = chai.should();
let server = 'http://preview.airwallex.com:30001';

chai.use(chaiHttp);

/*
 * get tests
 */
const fs = require('fs');
const path = require("path");
const data = fs.readFileSync(path.resolve(__dirname, 'test.json'), 'utf8');
const tests = JSON.parse(data);


/*
 * run test one by one
 */
describe('post /bank', () => {
  Object.keys(tests).forEach(key => {
    if (tests[key].enabled.toUpperCase() !== 'YES') {
      return;
    }
    it('should post bank ' + key, (done) => {
      chai.request(server).post('/bank').set('content-type', 'application/json').send(tests[key].input).end((err, res) => {
        //log.log(JSON.stringify(tests[key].input));
        //log.log(JSON.stringify(tests[key].output) + ' vs ' + JSON.stringify(res.body));
        should.not.exist(err);
        res.should.be.json;
        res.should.have.status(tests[key].output.ret_code);
        res.body.should.be.a('object');
        if (tests[key].output.hasOwnProperty("success")) {
          res.body.should.have.property('success');
          res.body.success.should.equal(tests[key].output.success);
        }
        if (tests[key].output.hasOwnProperty("error")) {
          res.body.should.have.property('error');
          res.body.error.should.equal(tests[key].output.error);
        }
        done();
      });
    });
  });
});
