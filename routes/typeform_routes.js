const process_basic_form = require('../api/landlord_basic_form/landlord_basic_form').process_basic_form
const process_advanced_form = require('../api/landlord_advanced_form/landlord_advanced_form').process_advanced_form
const process_seeking_form = require('../api/landlord_seeking_form/landlord_seeking_form').process_seeking_form
const saveGroupedTypeFormDataToDynamoDB = require('../DynamoDB/typeform_saving').saveGroupedTypeFormDataToDynamoDB
const checkDynamoForAds = require('../DynamoDB/typeform_saving').checkDynamoForAds
const updateAnswer = require('../DynamoDB/typeform_saving').updateAnswer
const logTypeformMilestone = require('../api/stackdriver/stackdriver_api_landlord').logTypeformMilestone
const logTypeformError = require('../api/stackdriver/stackdriver_api_landlord').logTypeformError
const saveTypeformProgress = require('../api/stackdriver/stackdriver_api_landlord').saveTypeformProgress

exports.basic_typeform = function(req, res, next) {
  // fs.writeFile("./output/typeform_output.json", JSON.stringify(typeform), function(err) {
  //   if(err) {
  //       return console.log(err);
  //   }
  //   console.log("The file was saved!")
  //   res({
  //     message: 'success'
  //   })
  // })
  const ad_id = req.body.form_response.hidden.ad_id
  const landlord_id = req.body.form_response.hidden.identityid
  let progress = []
  progress.push(logTypeformMilestone(ad_id, landlord_id, 'POST/basic_typeform: Typeform answers are about to be saved!', req.body, new Error().stack))
  process_basic_form(req.body, ad_id, landlord_id)
    .then(({ grouped, logs }) => {
      logs.forEach((l) => progress.push(l))
      progress.push(logTypeformMilestone(ad_id, landlord_id, 'POST/basic_typeform: Typeform answers were formatted', grouped, new Error().stack))
      return saveGroupedTypeFormDataToDynamoDB(grouped, ad_id, landlord_id)
    })
    .then((data) => {
      progress.push(logTypeformMilestone(ad_id, landlord_id, 'POST/basic_typeform: Typeform answers were successfully saved', data, new Error().stack))
      saveTypeformProgress(progress)
      res.status(200).send('Successfully saved POST /basic_typeform')
    })
    .catch((err) => {
      console.log(err)
      progress.push(logTypeformError(ad_id, landlord_id, 'POST/basic_typeform: An error occurred.', err, new Error().stack), 500)
      saveTypeformProgress(progress)
      res.status(500).send('An error occurred at POST /basic_typeform')
    })
}

exports.advanced_typeform = function(req, res, next) {
  // fs.writeFile("./output/typeform_output.json", JSON.stringify(typeform), function(err) {
  //   if(err) {
  //       return console.log(err);
  //   }
  //   console.log("The file was saved!")
  //   res({
  //     message: 'success'
  //   })
  // })
  const ad_id = req.body.form_response.hidden.ad_id
  const landlord_id = req.body.form_response.hidden.identityid
  let progress = []
  progress.push(logTypeformMilestone(ad_id, landlord_id, 'POST/advanced_typeform: Typeform answers are about to be saved!', req.body, new Error().stack))
  process_advanced_form(req.body)
    .then(({ grouped, logs }) => {
      logs.forEach((l) => progress.push(l))
      progress.push(logTypeformMilestone(ad_id, landlord_id, 'POST/advanced_typeform: Typeform answers were formatted', grouped, new Error().stack))
      return saveGroupedTypeFormDataToDynamoDB(grouped, ad_id, landlord_id)
    })
    .then((data) => {
      progress.push(logTypeformMilestone(ad_id, landlord_id, 'POST/advanced_typeform: Typeform answers were successfully saved', data, new Error().stack))
      saveTypeformProgress(progress)
      res.status(200).send('Successfully saved POST /advanced_typeform')
    })
    .catch((err) => {
      console.log(err)
      progress.push(logTypeformError(ad_id, landlord_id, 'POST/advanced_typeform: An error occurred.', err, new Error().stack), 500)
      saveTypeformProgress(progress)
      res.status(500).send('An error occurred at POST /advanced_typeform')
    })
}

exports.seeking_typeform = function(req, res, next) {
  // fs.writeFile("./output/typeform_output.json", JSON.stringify(typeform), function(err) {
  //   if(err) {
  //       return console.log(err);
  //   }
  //   console.log("The file was saved!")
  //   res({
  //     message: 'success'
  //   })
  // })
  const ad_id = req.body.form_response.hidden.ad_id
  const landlord_id = req.body.form_response.hidden.identityid
  let progress = []
  progress.push(logTypeformMilestone(ad_id, landlord_id, 'POST/seeking_typeform: Typeform answers are about to be saved!', req.body, new Error().stack))
  process_seeking_form(req.body)
    .then(({ grouped, logs }) => {
      logs.forEach((l) => progress.push(l))
      progress.push(logTypeformMilestone(ad_id, landlord_id, 'POST/seeking_typeform: Typeform answers were formatted', grouped, new Error().stack))
      return saveGroupedTypeFormDataToDynamoDB(grouped, ad_id, landlord_id)
    })
    .then((data) => {
      progress.push(logTypeformMilestone(ad_id, landlord_id, 'POST/seeking_typeform: Typeform answers were successfully saved', data, new Error().stack))
      saveTypeformProgress(progress)
      res.status(200).send('Successfully saved POST /seeking_typeform')
    })
    .catch((err) => {
      console.log(err)
      progress.push(logTypeformError(ad_id, landlord_id, 'POST/seeking_typeform: An error occurred.', err, new Error().stack), 500)
      saveTypeformProgress(progress)
      res.status(500).send('An error occurred at POST /seeking_typeform')
    })
}

exports.check_form_completion = function(req, res, next) {
  const ad_id = req.body.ad_id
  checkDynamoForAds(ad_id)
    .then((data) => {
      res.json(data)
    })
    .catch((err) => {
      res.status(500).send(err)
    })
}

exports.update_answer = function(req, res, next) {
  const item = req.body.item
  updateAnswer(item)
    .then((data) => {
      res.json(data)
    }).catch((err) => {
      console.log(err)
      res.status(500).send(err)
    })
}
