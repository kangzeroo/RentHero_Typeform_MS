// libraries
const bodyParser = require('body-parser')

// middleware
// const google_jwt_check = require('./auth/google_jwt_check').google_jwt_check
// const origin_check = require('./auth/origin_check').origin_check

// routes
const Test = require('./routes/test_routes')
const Typeform = require('./routes/typeform_routes')
const DialogFlow = require('./routes/dialogflow_routes')

// bodyParser attempts to parse any request into JSON format
const json_encoding = bodyParser.json({type:'*/*'})

module.exports = function(app){

	// routes
	app.get('/test', json_encoding, Test.test)

	app.post('/basic_typeform', [json_encoding], Typeform.basic_typeform)
	app.post('/advanced_typeform', [json_encoding], Typeform.advanced_typeform)
	app.post('/seeking_typeform', [json_encoding], Typeform.seeking_typeform)

	app.post('/init_dialogflow', [json_encoding], DialogFlow.init_dialogflow)
	app.post('/send_message', [json_encoding], DialogFlow.send_message)
	app.post('/dialogflow_fulfillment_renthero', [json_encoding], DialogFlow.dialogflow_fulfillment_renthero)
}
