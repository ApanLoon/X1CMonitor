JSMpeg.Source.WebSocket = (function(){ "use strict";

var WSSource = function(url, options) {
	this.url = url;
	this.options = options;
	this.socket = null;
	this.streaming = true;

	this.callbacks = {connect: [], data: []};
	this.destination = null;

	this.reconnectInterval = options.reconnectInterval !== undefined
		? options.reconnectInterval
		: 5;
	this.shouldAttemptReconnect = !!this.reconnectInterval;

	// Keep alive mechanism to let server detect when we stop watching
	this.keepAliveInterval = options.keepAliveInterval !== undefined
		? options.keepAliveInterval
		: 5;
	this.shouldKeepAlive = !!this.keepAliveInterval;
	this.keepAliveMessage = options.keepAliveMessage !== undefined
		? options.keepAliveMessage
		: { Type: "KeepAlive" };
	this.keepAliveIntervalId = 0;

	this.completed = false;
	this.established = false;
	this.progress = 0;

	this.reconnectTimeoutId = 0;

	this.onEstablishedCallback = options.onSourceEstablished;
	this.onCompletedCallback = options.onSourceCompleted; // Never used
};

WSSource.prototype.connect = function(destination) {
	this.destination = destination;
};

WSSource.prototype.destroy = function() {
	clearTimeout(this.reconnectTimeoutId);
	this.shouldAttemptReconnect = false;
	this.socket.close();
};

WSSource.prototype.start = function() {
	this.shouldAttemptReconnect = !!this.reconnectInterval;
	this.progress = 0;
	this.established = false;
	
	if (this.options.protocols) {
		this.socket = new WebSocket(this.url, this.options.protocols);
	} 
	else {
		this.socket = new WebSocket(this.url);
	}
	this.socket.binaryType = 'arraybuffer';
	this.socket.onmessage = this.onMessage.bind(this);
	this.socket.onopen = this.onOpen.bind(this);
	this.socket.onerror = this.onClose.bind(this);
	this.socket.onclose = this.onClose.bind(this);
};

WSSource.prototype.resume = function(secondsHeadroom) {
	// Nothing to do here
};

WSSource.prototype.onOpen = function() {
	this.progress = 1;

	if (this.shouldKeepAlive) {
		clearInterval(this.keepAliveIntervalId);
		this.keepAliveIntervalId = setInterval(function(){
			this.socket.send(JSON.stringify(this.keepAliveMessage));	
		}.bind(this), this.keepAliveInterval*1000);
	}
};

WSSource.prototype.onClose = function() {
	if (this.shouldKeepAlive) {
		clearInterval(this.keepAliveIntervalId);
	}

	if (this.shouldAttemptReconnect) {
		clearTimeout(this.reconnectTimeoutId);
		this.reconnectTimeoutId = setTimeout(function(){
			this.start();	
		}.bind(this), this.reconnectInterval*1000);
	}
};

WSSource.prototype.onMessage = function(ev) {
	var isFirstChunk = !this.established;
	this.established = true;

	if (isFirstChunk && this.onEstablishedCallback) {
		this.onEstablishedCallback(this);
	}

	if (this.destination) {
		this.destination.write(ev.data);
	}
};

return WSSource;

})();

