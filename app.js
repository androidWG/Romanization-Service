//Romanization System 1.0 by AndroidWG (Samuel Rodrigues)
//Made for SmartLyrics app

var express = require("express");
var port = process.env.PORT;
var app = express(); app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

var bodyParser = require("body-parser");
app.use(bodyParser.text()); 

const Kuroshiro = require('kuroshiro');
const KuroshiroAnalyzer = require('kuroshiro-analyzer-kuromoji');

//the only part that matters
//Parameters:
//[text]-text to convert
//[to]-convert to one of these: hiragana, katakana, romaji
//[mode]-using one of these modes: normal, spaced, okurigana, furigana
//[romajiSystem]-using one of these systems: nippon, passport, hepburn
app.post("/convert", async (request, response, next) => {
    try {
        console.log(`Recived convert request from ${request.ip}`);
        
        const kuroshiro = new Kuroshiro();
        await kuroshiro.init(new KuroshiroAnalyzer({ dictPath: 'node_modules/kuromoji/dict' }));

        console.log(`Parameters: ${request.params}`);
        const to = request.query.to;
        const mode = request.query.mode;
        //will use hepburn if param doesn't exist
        const romajiSystem = (request.query.romajiSystem == null) ? "hepburn" : request.query.romajiSystem;
        //change line separator
        const lineSeparator = (request.query.useHTML == "true") ? "<br>" : "\n";

        const text = request.body;
        console.log("Parsed request body");

        console.log(`Original text: ${text}`);

        //split to convert line by line
        const lines = text.split(lineSeparator)

        const convertedlines = await Promise.all(lines
            .map(async line => {
                if (Kuroshiro.Util.hasJapanese(line)){
                    return await kuroshiro.convert(line, { to: to, mode: mode, romajiSystem: romajiSystem});
                } else {
                    return line;
                }
            }))
            
        const converted = convertedlines.join(lineSeparator);
        console.log(`Comverted output: ${converted}`);
        response.send(converted);
    }
    catch (e) {
        next(e);
    }
});

//simple page to show if the main URL is accessed
app.get('/', function (request, response) {
    response.sendFile(__dirname + '/views/index.html');
});