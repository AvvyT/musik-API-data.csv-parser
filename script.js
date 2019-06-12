const express = require("express");
const app = express();
const csv = require("csv-parse");
const fs = require("fs");

let results = [];

app.use(express.json()); // Sparar datan i req.body

// ** logik i GET / routen för pagination och filtrering
app.get('/songs', (req, res) => {
    fs
        .createReadStream('data.csv')
        .pipe(csv({ columns: true }))
        .on('data', (row) => {
            console.log(row);
            results.push(row);
        })
        .on('end', () => {
            console.log(results);
            const qs = req.query;
            let page = parseInt(qs.page);
            let size = parseInt(qs.size);
            let search = qs.search; // väljer att query string ska heta search


            if (!page) page = 1;
            if (!size) size = 20;
            // --*filtrering*--
            if (search) {
                results = results.filter(x => x.artist.toLowerCase() === search.toLowerCase() ||
                    x.song_title.toLowerCase() === search.toLowerCase());
            }
            // testa i webben =>http://localhost:3001/songs?page=1&size=50&search=Look Alive
            // **frön första sida visa max 50 st av Look Alive
            let songs = results.slice((page - 1) * size, page * size);

            res.status(200).send({ results: songs });
        })
        .on("error", function (error) {
            console.log(error)
        });
    // testa i webben =>http://localhost:3001/songs?page=2  //* query = '?'
    // testa i webben =>http://localhost:3001/songs?page=2&size=30 //*ex:sida 2 o 30 per sida
});

// ** Hämta alla låtar av en artist.
app.get('/artist/:name', function (req, res) {
    fs
        .createReadStream('data.csv')
        .pipe(csv({ columns: true }))
        .on('data', (row) => {
            console.log(row);
            results.push(row);
        })
        .on('end', () => {
            console.log(results);
            let name = req.params.name;
            console.log(name);
            // filter => all elements that pass the test
            const songs = results.filter(x => x.artist === name);

            res.status(200).send(songs);
        })
        .on("error", function (error) {
            console.log(error)
        });
    // testa i webben =>http://localhost:3001/artist/Drake
});

// ** Hämta en låt efter dess ID
app.get('/song/:id', (req, res) => {
    fs
        .createReadStream('data.csv')
        .pipe(csv({ columns: true }))
        .on('data', (row) => {
            console.log(row);
            results.push(row);
        })
        .on('end', () => {
            console.log(results);
            const id = req.params.id;

            console.log(id);
            const song = results.find(x => x.id === id);
            if (song) {
                res.status(200).send(song);
            } else {
                res.status(400).end();
            }
        })
        .on("error", function (error) {
            console.log(error)
        });
    // testa i webben =>/song/389
});


app.listen(3001, function () {
    console.log('listening-requests on port', 3001);
});