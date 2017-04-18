const argv = require('minimist')(process.argv.slice(2))
const chalk = require('chalk')
const spotify = require('spotify')

const queryTypes = ['artist', 'album'];

if (!argv._.length) {
  console.error(chalk.red(`Please specify a query!`))
  process.exit(1)
}

spotify.search({ type: queryTypes.join(','), query: argv._[0], limit: 1 }, (err, data) => {
  if ( err ) {
    console.log('Error occurred: ' + err)
    return
  }
 
  console.log('')
  queryTypes.forEach((item) => {
    var first = data[item + 's'].items[0]
    console.log(chalk.red(item), first.name, chalk.green(first.uri))
  })
  console.log('')

})