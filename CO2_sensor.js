'use strict';

var CO2_lib = require('jsupm_mhz16');
// Define the connection string to connect to IoT Hub
var connectionString = 'HostName=AlegriIotHubDemo1.azure-devices.net;DeviceId=co2Sensor;SharedAccessKey=ZH77+qAOEgIrOwQ9ay4bEOxjg3nDuqS/PkxeUB/ttGs=';

var Protocol = require('azure-iot-device-http').Http;
var Client = require('azure-iot-device').Client;
var ConnectionString = require('azure-iot-device').ConnectionString;
var Message = require('azure-iot-device').Message;
var deviceId = ConnectionString.parse(connectionString).DeviceId;
var client = Client.fromConnectionString(connectionString, Protocol);
var outputStr = "";
var myInterval=null;

// Instantiate a MHZ16 serial CO2 sensor on uart 0.
// This example was tested on the Grove CO2 sensor module.
var myCO2_obj = new CO2_lib.MHZ16(0);

// Send device meta data 
var deviceMetaData = {
	'ObjectType': 'DeviceInfo', 
	'IsSimulatedDevice': 0, 
	'Version': '1.0', 
	'DeviceProperties': {
		'DeviceID': deviceId, 
		'HubEnabledState': 1, 
		'CreatedTime': '2016-05-30T20:28:55.5448990Z', 
		'DeviceState': 'normal', 
		'UpdatedTime': null, 
		'Manufacturer': 'Contoso Inc.', 
		'ModelNumber': 'MD-909', 
		'SerialNumber': 'SER9090', 
		'FirmwareVersion': '1.10', 
		'Platform': 'node.js', 
		'Processor': 'ARM', 
		'InstalledRAM': '64 MB', 
		'Latitude': 47.617025, 
		'Longitude': -122.191285
	}, 
	'Commands': [{
			'Name': 'SetTemperature', 
			'Parameters': [{
					'Name': 'Temperature', 
					'Type': 'double'
				}]
		}, 
		{
			'Name': 'SetCO2', 
			'Parameters': [{
					'Name': 'CO2', 
					'Type': 'double'
				}]
		}]
};

// Print message, clear memory when exiting
process.on('SIGINT', function () {
	clearInterval(myInterval);
	myCO2_obj = null;
	CO2_lib.cleanUp();
	CO2_lib = null;
	console.log("Exiting");
	process.exit(0);
});

client.open(function (err, result) {
	if (err) {
		console.log(err.toString());
	} else {
		
		//console.log('Sending device metadata:\n' + JSON.stringify(deviceMetaData));
		//client.sendEvent(new Message(JSON.stringify(deviceMetaData)), function (e) { console.log('Done:'+e)});
		
		// Receive messages from IoT Hub
		client.on('message', function (msg) {
			console.log('receive data: ' + msg.getData());
		});
		
		// make sure port is initialized properly.  9600 baud is the default.
		if (!myCO2_obj.setupTty(CO2_lib.int_B9600)) {
			console.log("Failed to setup tty port parameters");
			process.exit(0);
		}
		
		outputStr = "Make sure that the sensor has had " +
			"at least 3 minutes to warm up";
		console.log(outputStr);
		outputStr = "or you will not get valid results.";
		console.log(outputStr);
		outputStr = "The temperature reported is not the ambient temperature,";
		console.log(outputStr);
		outputStr = "but rather the temperature of the sensor elements.";
		console.log(outputStr);
		

		setTimeout(function () {
			myInterval = setInterval(function () { 
				if (!myCO2_obj.getData())
					console.log("Failed to retrieve data");
				else {
					outputStr = "CO2 concentration: " + myCO2_obj.getGas() +
		" PPM, " +
		"Temperature (in C): " + myCO2_obj.getTemperature();
					console.log(outputStr);
					// Create a message and send it to IoT Hub.
					var data = JSON.stringify({
						'DeviceID': deviceId, 
						'Temperature': myCO2_obj.getTemperature(), 
						'CO2': myCO2_obj.getGas(), 
						'ExternalTemperature': myCO2_obj.getTemperature(),
						'time':Date.now()
					});
					console.log('Sending device event data:\n' + data);
					client.sendEvent(new Message(data), function (e) { console.log('Done:' + e) });

				}}, 2000);
		}, 1000);
				
		// Receive error from IoT Hub
		client.on('error', function (err) {
			console.log('receive data: ' + err);
			clearTimeout(myInterval);
			client.close();
		});
	}
});