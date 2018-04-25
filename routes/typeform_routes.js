const process_basic_form = require('../api/landlord_basic_form/landlord_basic_form').process_basic_form
const process_advanced_form = require('../api/landlord_advanced_form/landlord_advanced_form').process_advanced_form
const process_seeking_form = require('../api/landlord_seeking_form/landlord_seeking_form').process_seeking_form
const saveGroupedTypeFormDataToDynamoDB = require('../DynamoDB/typeform_saving').saveGroupedTypeFormDataToDynamoDB

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
  process_basic_form(req.body)
    .then((grouped) => {
      return saveGroupedTypeFormDataToDynamoDB(grouped, ad_id, landlord_id)
    })
    .then((data) => {
      res.status(200).send(data)
    })
    .catch((err) => {
      console.log(err)
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
  process_advanced_form(req.body)
    .then((grouped) => {
      return saveGroupedTypeFormDataToDynamoDB(grouped, ad_id, landlord_id)
    })
    .then((data) => {
      res.status(200).send(data)
    })
    .catch((err) => {
      console.log(err)
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
  process_seeking_form(req.body)
    .then((grouped) => {
      return saveGroupedTypeFormDataToDynamoDB(grouped, ad_id, landlord_id)
    })
    .then((data) => {
      res.status(200).send(data)
    })
    .catch((err) => {
      console.log(err)
    })
}
