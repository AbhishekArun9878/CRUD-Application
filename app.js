const http = require("http");
const fs = require('fs');
const url = require('url');

let hospitalData = require('./hospital_details.json');

hospitalData.hospitals.sort((a, b) => a.id - b.id);

const server = http.createServer((req, res) => {
    const { pathname, query } = url.parse(req.url, true);

    switch (req.method) {
        case 'GET':
            if (pathname === '/hospitals') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(hospitalData, null, 2)); // Using indentation for better JSON formatting
            } else if (pathname.startsWith('/hospitals/') && query.id) {
                const hospitalId = parseInt(query.id, 10);
                const hospital = hospitalData.hospitals.find(h => h.id === hospitalId);

                if (hospital) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(hospital, null, 2));
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Hospital not found');
                }
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
            break;

        case 'POST':
            if (pathname === '/hospitals') {
                let body = '';

                req.on('data', (chunk) => {
                    body += chunk;
                });

                req.on('end', () => {
                    const newHospital = JSON.parse(body);
                    newHospital.id = Date.now(); 

                    hospitalData.hospitals.push(newHospital);

                    fs.writeFile('./hospital_details.json', JSON.stringify(hospitalData, null, 2), (error) => {
                        if (error) {
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('Internal Server Error');
                        } else {
                            res.writeHead(201, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(newHospital, null, 2));
                        }
                    });
                });
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
            break;

        case 'PUT':
            if (pathname.startsWith('/hospitals/') && query.id) {
                const hospitalId = parseInt(query.id, 10);

                let body = '';

                req.on('data', (chunk) => {
                    body += chunk;
                });

                req.on('end', () => {
                    const updatedHospital = JSON.parse(body);

                    const index = hospitalData.hospitals.findIndex(h => h.id === hospitalId);

                    if (index !== -1) {
       
                        updatedHospital.id = hospitalData.hospitals[index].id;
                        hospitalData.hospitals[index] = { ...hospitalData.hospitals[index], ...updatedHospital };

                        fs.writeFile('./hospital_details.json', JSON.stringify(hospitalData, null, 2), (error) => {
                            if (error) {
                                res.writeHead(500, { 'Content-Type': 'text/plain' });
                                res.end('Internal Server Error');
                            } else {
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify(hospitalData.hospitals[index], null, 2));
                            }
                        });
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('Hospital not found');
                    }
                });
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
            break;

        case 'DELETE':
            if (pathname.startsWith('/hospitals/') && query.id) {
                const hospitalId = parseInt(query.id, 10);

                const index = hospitalData.hospitals.findIndex(h => h.id === hospitalId);

                if (index !== -1) {
                    const deletedHospital = hospitalData.hospitals.splice(index, 1)[0];

                    fs.writeFile('./hospital_details.json', JSON.stringify(hospitalData, null, 2), (error) => {
                        if (error) {
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('Internal Server Error');
                        } else {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(deletedHospital, null, 2));
                        }
                    });
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Hospital not found');
                }
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
            break;

        default:
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            res.end('Method Not Allowed');
    }
});

const PORT = 5000;

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
