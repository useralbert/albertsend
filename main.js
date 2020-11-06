//Load the required libraries
const express = require('express');
const hbs = require('express-handlebars');
const request = require('request');
const bodyParser = require('body-parser');

//Load application keys
const keys = require('./keys.json');

//Configure the PORT
const PORT = parseInt(process.argv[2] || process.env.APP_PORT || 3000);

//Create an instance of the application
const app = express();

//Configure handlebars
app.engine('hbs', hbs());
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
 
//Route
app.get('/getbooklist', (req, resp) => {
    const name = req.query.name;
          let cart = [];
    if (req.query.cart)                    //request by sending in string
        cart = JSON.parse(req.query.cart); //process to display in json

    resp.status(200)
    resp.type('text/html')
    resp.render('cart', { 
        name: name,
        cart: JSON.stringify(cart),        //not used. needed for Print
        layout: false
    })
})


app.post('/list', (req, resp) => {
    console.log('body: ', req.body)
    console.log('item0 = ', req.body.item0);
    console.log('item1 = ', req.body['item1']);

    resp.status(201);
    resp.type('text/html');
    resp.send(`Your list has been created`);
})


app.get('/weather', (req, resp) => {
    

    const params = {

        appid: keys.nyt.appid

    };

    request.get('https://developer.nytimes.com/docs/books-product/1/routes/reviews.json/get', 
        { qs: params },
        (err, _, body) => {
            if (err) {
                resp.status(400); resp.type('text/plain'); resp.send(err); return;
            }
            const result = JSON.parse(body);
            resp.status(200);
            resp.format({
                'text/html': () => {
                    resp.type('text/html');
                    resp.render('weather', {
                        layout: false,
                        city: cityName.toUpperCase(),
                        weather: result.weather,
                        temperature: result.main,
                        coord: result.coord,
                    })
                },
                'application/json': () => {
                    const respond = {
                        temperature: result.main,
                        coord: result.coord,
                        city: cityName,
                        weather: result.weather.map(v => {
                            return {
                                main: v.main,
                                description: v.description,
                                icon: `http://openweathermap.org/img/w/${v.icon
                            }.png`
                            }
                       })
                    }
                    resp.json(respond)
                },
                'default': () => {
                    resp.status(406);
                    resp.type('text/plain');
                    resp.send(`Cannot produce the requested representation: ${req.headers['accept']}`);
                }
            })
        }
    );
});

app.get(/.*/, express.static(__dirname + '/public'));

//Start the server
app.listen(PORT, () => {
    console.info(`Application started on port ${PORT} at ${new Date()}`);
});