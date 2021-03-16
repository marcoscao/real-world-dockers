const config_values = require('./config_values');


// Express App Setup
const express = require('express');
const body_parser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(body_parser.json());


// Postgres Client Setup

const { Pool } = require('pg');

const pg_client = new Pool({
	user: config_values.pgUser,
	host: config_values.pgHost,
	port: config_values.pgPort,
	database: config_values.pgDatabase,
	password: config_values.pgPassword
});

pg_client.on('connect', ()=>{
	pg_client
		.query('CREATE TABLE IF NOT EXISTS values (number INT)')
		.catch((err) => console.log(err));
});


// Redis client setup

const redis = require('redis');

const redis_client = redis.createClient({
	host: config_values.redisHost,
	port: config_values.redisPort,
	retry_strategy: ()=> 1000
});

// Duplicated because is required by redis library when using to publish or listening
const redis_publisher = redis_client.duplicate();


// Express route handlers

app.get('/',(req,res) => {
	res.send('Hi');
});

app.get('/values/all', async (req,res) => {
	const values = await pg_client.query('SELECT * FROM values');
	res.send(values.rows);
});


app.get('/values/current', async (req,res) => {

	// Here not asyn ( promises ) because not supported on Redis
	redis_client.hgetall('values', (err,values) => {
		res.send(values);
	});
});


app.post('/values', async (req,res) => {
	const value = req.body.value;

	if(parseInt(value)>40) {
		return res.status(422).send('Value to high to be calculated');
	}

	redis_client.hset('values',value,'Nothing yet!');
	redis_publisher.publish('insert',value);

	pg_client.query('INSERT INTO values(number) VALUES($1)',[value]);

	res.send({working: true});
});

app.listen(5000, err => {
	console.log('Listening on port 5000');
});







