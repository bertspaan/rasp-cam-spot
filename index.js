const fs = require('fs')
const path = require('path')
const argv = require('minimist')(process.argv.slice(2))
const vision = require('@google-cloud/vision')
const chalk = require('chalk')
const got = require('got')

const KEY_FILENAME = path.join(__dirname, 'credentials', 'google.key.json')


if (!fs.existsSync(KEY_FILENAME)) {
  console.error(chalk.red(`Please put your Google Vision API credentials in ${KEY_FILENAME}`))
  process.exit(1)
}

if (!argv._.length) {
  console.error(chalk.red(`Please specify the location of an image file!`))
}

const visionClient = vision({
  projectId: 'rasp-cam-spot',
  keyFilename: KEY_FILENAME
})

const types = [
  'similar'
]

visionClient.detect(argv._[0], types, function(err, detections, apiResponse) {
  if (err) {
    console.error(err.message)
    return
  }

  const webResponses = apiResponse.responses
    .filter((response) => response.webDetection)

  if (webResponses.length) {
    const printEntity = (entity) => entity.description

    const webDetection = webResponses[0].webDetection
    const firstEntity = webDetection.webEntities[0]
    console.log(printEntity(firstEntity))

    webDetection.webEntities
      .slice(1, 5)
      .map(printEntity)
      .map((entity) => console.log(chalk.gray(entity)))

    const album = webDetection.webEntities[0].description
    got(`http://localhost:7337/search?q=${album}`, {
      json: true
    })
      .then((response) => {
        console.log(response.body)
      })
      .catch((err) => {
        console.error(err)
      })
  }
})
