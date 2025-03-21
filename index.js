const express = require('express');
const chalk = require('chalk');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.enable("trust proxy");
app.set("json spaces", 2);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use('/', express.static(path.join(__dirname, '/')));
app.use('/', express.static(path.join(__dirname, 'pages')));
app.use('/src', express.static(path.join(__dirname, 'src')));


const settingsPath = path.join(__dirname, './endpoints.json');
const settings = JSON.parse(fs.readFileSync(settingsPath))
const setPath = path.join(__dirname, './settings.json');
const set = JSON.parse(fs.readFileSync(setPath))
global.apikey = set.apikey

app.use((req, res, next) => {
console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Request Route: ${req.path} `));
    const originalJson = res.json;
    res.json = function (data) {
        if (data && typeof data === 'object') {   
            const responseData = {
                status: data.status,
                creator: set.creator || "Created Using Skyzo",
                ...data
            };
            return originalJson.call(this, responseData);
        }
    };
    next();
});


let totalRoutes = 0
const apiFolder = path.join(__dirname, './src');
fs.readdirSync(apiFolder).forEach((file) => {
    const filePath = path.join(apiFolder, file);
            if (path.extname(file) === '.js') {
                require(filePath)(app);
                totalRoutes++;
                console.log(chalk.bgHex('#FFFF99').hex('#333').bold(` Memuat Route: ${path.basename(file)} `));
            }
});


console.log(chalk.bgHex('#90EE90').hex('#333').bold(' Load Complete! ✓ '));
console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Total Route : ${totalRoutes} `));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/index.html'));
});

app.listen(PORT, () => {
    console.log(chalk.bgHex('#90EE90').hex('#333').bold(` Server telah berjalan di `), `http://localhost:${PORT}/ `);
});

module.exports = app;