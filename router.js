// libraries
const bodyParser = require('body-parser')

// middleware
// const google_jwt_check = require('./auth/google_jwt_check').google_jwt_check
const originCheck = require('./auth/originCheck').originCheck

// routes
const Test = require('./routes/test_routes')
const Typeform = require('./routes/typeform_routes')

// bodyParser attempts to parse any request into JSON format
const json_encoding = bodyParser.json({type:'*/*'})

module.exports = function(app){

	// routes
	app.get('/test', json_encoding, Test.test)

	app.post('/basic_typeform', [json_encoding], Typeform.basic_typeform)
	app.post('/advanced_typeform', [json_encoding], Typeform.advanced_typeform)
	app.post('/seeking_typeform', [json_encoding], Typeform.seeking_typeform)

	app.post('/check_form_completion', [json_encoding, originCheck], Typeform.check_form_completion)
	app.post('/update_answer', [json_encoding, originCheck], Typeform.update_answer)
}
