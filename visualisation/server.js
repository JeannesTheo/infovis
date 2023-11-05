
const express = require('express')
const app = express()
const port = 3000

// Cette ligne indique le répertoire qui contient
// les fichiers statiques: html, css, js, images etc.
app.use(express.static('public'))

app.get('/spiral_plot/', (req, res) => {
  res.render('index')
})

app.listen(port, () => {
  console.log(`Visualisation App listening at http://localhost:${port}`)
})
