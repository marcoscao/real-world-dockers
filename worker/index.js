const config_values = require('./config_values');
const redis = require('redis');

const redis_client = redis.createClient({
	host: config_values.redisHost,
	port: config_values.redisPort,
	retry_strategy: ()=> 1000
});

// Duplicated because is required by redis library when using to publish or listening
const sub = redis_client.duplicate();


function fib(value)
{
	if(value<2) return 1;
	return fib(value-1) + fib(value-2);
}

// message is the user submitted value
// such message is inserted into hashed memory-db field 'values'
sub.on('message',(channel,message) => {
	redis_client.hset('values',message,fib(parseInt(message)));
});

sub.subscribe('insert');
