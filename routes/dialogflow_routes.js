const axios = require('axios')
const uuid = require('uuid')
const fetchAppropriateTagsForIntent = require('../api/dialogflow_matcher').fetchAppropriateTagsForIntent
const queryDynamoDBAnswersForTags = require('../DynamoDB/dialogflow_matching').queryDynamoDBAnswersForTags
const getAdIdFromSession = require('./Postgres/Queries/AdQueries').getAdIdFromSession
const saveSessionAndAdIds = require('./Postgres/Queries/AdQueries').saveSessionAndAdIds
const saveDialog = require('../DynamoDB/dialogflow_chat').saveDialog

exports.init_dialogflow = function(req, res, next) {
  console.log(req.body)
  console.log('--------- init_dialogflow')
  const ad_id = req.body.ad_id
  const session_id = uuid.v4()
  const params = {
    'event': {
      'name': 'renthero-init',
      'data': {
        'ad_id': ad_id
      }
    },
    'timezone':'America/New_York',
    'lang':'en',
    'sessionId': session_id
  }
  const headers = {
    headers: {
      Authorization: 'Bearer 4afa72ac700648908ae87130f11e0a9e'
    }
  }
  saveSessionAndAdIds(session_id, ad_id)
    .then((data) => {
      return axios.post(`https://api.dialogflow.com/api/query?v=20150910`, params, headers)
    })
    .then((data) => {
      // once we have the response, only then do we dispatch an action to Redux
      // console.log(data.data)
      res.json({
        message: data.data.result.fulfillment.speech,
        session_id: session_id
      })
    })
    .catch((err) => {
      // console.log(err)
      res.json({
        message: 'Uh oh! Something wrong happened',
        session_id: session_id
      })
    })
}

exports.send_message = function(req, res, next) {
  console.log(req.body)
  const params = {
    "contexts": [],
    "lang": "en",
    "query": req.body.message,
    "sessionId": req.body.session_id,
    "timezone": "America/New_York"
  }
  const headers = {
    headers: {
      Authorization: 'Bearer 4afa72ac700648908ae87130f11e0a9e'
    }
  }
  let reply = ''
  axios.post(`https://api.dialogflow.com/api/query?v=20150910`, params, headers)
      .then((data) => {
        // once we have the response, only then do we dispatch an action to Redux
        console.log(data.data)
        reply = data.data.result.fulfillment.speech
        return saveDialog(req.body.message, req.body.sessionId, req.body.sessionId)
      })
      .then((data) => {
        res.json({
          message: reply
        })
      })
      .catch((err) => {
        console.log(err)
        console.log(err.response.data)
        res.status(500).send(err)
      })
}

exports.dialogflow_fulfillment_renthero = function(req, res, next) {
  console.log(req.body)
  console.log(req.body.queryResult.fulfillmentMessages[0].text.text)
  const sessionID = req.body.session.slice(req.body.session.indexOf('/sessions/') + '/sessions/'.length)
  let ad_id = ''
  let reply = ''
  if (req.body.queryResult.intent) {
    const intentID = req.body.queryResult.intent.name
    const intentName = req.body.queryResult.intent.displayName
    getAdIdFromSession(sessionID)
      .then((id) => {
        ad_id = id
        return fetchAppropriateTagsForIntent(intentID, intentName)
      })
      .then((tags) => {
        return queryDynamoDBAnswersForTags(tags, ad_id)
      })
      .then((matchedAnswer) => {
        reply = matchedAnswer
        // console.log(matchedAnswer)
        return saveDialog(matchedAnswer, sessionID, intentID)
      })
      .then((data) => {
        res.json({
          "fulfillmentText": reply,
          "fulfillmentMessages": [],
          "outputContexts": []
        })
      })
      .catch((err) => {
        res.json({
          "fulfillmentText": 'Ouch, this question somehow gave me a headache! :( Maybe try again later',
          "fulfillmentMessages": [],
          "outputContexts": []
        })
      })
  } else {
    getAdIdFromSession(sessionID)
      .then((id) => {
        ad_id = id
        // console.log(matchedAnswer)
        const message = req.body.queryResult.fulfillmentText ? req.body.queryResult.fulfillmentText : req.body.queryResult.fulfillmentMessages[0].text.text
        return saveDialog(message, sessionID, req.body.queryResult.action)
      })
      .then((data) => {
        res.json({
          "fulfillmentText": req.body.queryResult.fulfillmentText,
          "fulfillmentMessages": req.body.queryResult.fulfillmentMessages,
          "outputContexts": []
        })
      })
      .catch((err) => {
        res.json({
          "fulfillmentText": 'Ouch, this question somehow gave me a headache! :( Maybe try again later',
          "fulfillmentMessages": [],
          "outputContexts": []
        })
      })
  }
}

/*

curl \
-H "Authorization: Bearer 4d95f830bb794321a5610ca6fec9f765" \
"https://api.dialogflow.com/v1/query?v=20150910&e=renthero-init"

curl \
-X POST -H "Content-Type: application/json; charset=utf-8" \
-H "Authorization: Bearer 4d95f830bb794321a5610ca6fec9f765" \
"https://api.dialogflow.com/api/query?v=20150910" \
--data "{
'event':{'name': 'renthero-init', 'data': {'ad_id': 'b1b6604e-4142-4903-a391-3850a9a9a465'}},
'timezone':'America/New_York',
'lang':'en',
'sessionId':'3563456-467456dfsg-sdfgsdfg'}"

projects/additionalsuiteinfo/agent/sessions/1321321
*/
