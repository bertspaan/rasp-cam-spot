const spotify = require('spotify')

const queryTypes = ['artist', 'album'];

spotify.search({ type: queryTypes.join(','), query: 'new order', limit: 1 }, (err, data) => {
  if ( err ) {
    console.log('Error occurred: ' + err)
    return
  }
 
  console.log('found stuff!')

  queryTypes.forEach((item) => {
    console.log('---------------------------------------------------')
    console.log(item, data[item + 's'].items[0])
  })

})