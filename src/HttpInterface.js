const { BASE_URL, AUTH } = require('./Constants');
const https = require('https');
const {IncomingMessage} = require('http');
const Utils = require("./Utils");
class HttpInterface {
	debug;
	truncatedDebug;
	setDebug(bool){
		this.debug = bool;
	}
	setTruncatedDebug(bool){
		this.truncatedDebug = bool;
	}
	/**
	 * Sends a GET request to URL/endpoint
	 * @param {string} endpoint
	 * @returns {Promise<IncomingMessage>} Http Response
	 */
	sendRequest(endpoint){
		const url = BASE_URL + endpoint;
		const headers = 
			{
				'User-Agent':'Diccionario/2 CFNetwork/808.2.16 Darwin/16.3.0',
				'Content-Type':'application/x-www-form-urlencoded',
				'Authorization': AUTH
			};
		return new Promise((resolve, reject)=>{
			https.get(url, {headers: headers},  (res) => {
    		let body = '';

			if(res.statusCode != 200) reject('Llamada no disponible en este momento.');
    		// called when a data chunk is received.
    		res.on('data', (chunk) => {
				let data = chunk.toString().replace(/\n/g,'');
				data = data.replace(/\t/g, '');
				if(data.indexOf('json(') != -1){
					data = data.slice(5, -1);
				}if (data.indexOf('jsonp123(') != -1){
					data = data.slice(9,-1)
				}
				if(Array.isArray(data)) data = JSON.stringify(data);
				body += data;
    		});

    		// called when the complete response is received.
    		res.on('end', () => {
				if (body != body.replace(/<\/?[^>]+(>|$)/g, '')){
					body = Utils.get_definitions(body);
				}
				if(this.debug){
					console.log('fetch: GET ' + BASE_URL + endpoint);
					console.log('headers: ' + JSON.stringify(res.headers));
					console.log('body: ' + body);
					console.log('Status Code: ' + res.statusCode);
				}
				const response = res;
				Object.defineProperty(response, 'body', { value: JSON.parse(body), writable: false});
				resolve(response);
			});
			
			}).on("error", (err) => {
				console.log("Error: ", err.message);
				reject(error);
			});
		});
	}
}

module.exports = HttpInterface;