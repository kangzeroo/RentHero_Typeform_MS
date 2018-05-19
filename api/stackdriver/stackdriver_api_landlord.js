// Imports the Google Cloud client library
const moment = require('moment')
const Logging = require('@google-cloud/logging')
const path = require('path')
const uuid = require('uuid')
const pathToGoogleConfig = path.join(__dirname, '..', '..', 'credentials', process.env.NODE_ENV, 'cloud_logging_config_landlord.json')
const PROJECT_ID = require(`../../credentials/${process.env.NODE_ENV}/cloud_logging_profile_landlord`).PROJECT_ID
// Creates a client
const logging = new Logging({
  projectId: PROJECT_ID,
  keyFilename: pathToGoogleConfig
})

exports.logTypeformMilestone = (ad_id, landlord_id, message, payload, stacktrace) => {
  // The name of the log to write to
  const logName = `typeform-saving`
  // Selects the log to write to
  const log = logging.log(logName)
  const created_at = moment().toISOString()

  // The data to write to the log
  const json = {
    ad_id: ad_id,
    landlord_id: landlord_id,
    message: message,
    payload: payload,
    stacktrace: stacktrace,
    timestamp: created_at
  }
  // The metadata associated with the entry
  const metadata = {
    resource: {
      type: 'api'
    },
    severity: 0,
    labels: {
      ad_id: ad_id,
      landlord_id: landlord_id,
      event_type: 'milestone'
    }
  }
  // Prepares a log entry
  return log.entry(metadata, json)
}

exports.logTypeformError = (ad_id, landlord_id, message, payload, stacktrace, severity) => {
  // The name of the log to write to
  const logName = `session-progress`
  // Selects the log to write to
  const log = logging.log(logName)
  const created_at = moment().toISOString()

  // The data to write to the log
  const json = {
    ad_id: ad_id,
    landlord_id: landlord_id,
    message: message,
    payload: payload,
    stacktrace: stacktrace,
    timestamp: created_at
  }
  // The metadata associated with the entry
  const metadata = {
    resource: {
      type: 'api'
    },
    severity: severity,
    labels: {
      ad_id: ad_id,
      landlord_id: landlord_id,
      event_type: 'error'
    }
  }
  // Prepares a log entry
  return log.entry(metadata, json)
}

exports.saveTypeformProgress = (entries) => {
  // The name of the log to write to
  const logName = `session-progress`
  // Selects the log to write to
  const log = logging.log(logName)
  // Writes the log entry
  log.write(entries)
    .then(() => {
      console.log(`Logged some session progress!`)
    })
    .catch(err => {
      console.log(err)
    })
}
