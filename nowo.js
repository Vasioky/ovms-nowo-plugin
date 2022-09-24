(function(){
	print('nowo start');
	var exports = {};
	var eventName = 'usr.nowo.timeout';
	var i = 0;
	var isRev = false;
    var requireResend = false;
	var vgrEventId  = null;
	var vgnEventId = null;
	var vgfEbentId = null;

	function cleanup(){
		print("cleanup");
		i = 0;
		isRev = false;
		requireResend = false;
		PubSub.unsubscribe(eventName);
		PubSub.unsubscribe(vgrEventId);
		PubSub.unsubscribe(vgnEventId);
		PubSub.unsubscribe(vgfEbentId);
		vgfEbentId = null;
		vgnEbentId = null;
		vgrEbentId = null;
	}

	function sendCommand(){
		print('call: ' + i);
		if(i++<2){
			OvmsCommand.Exec('can can3 tx standard 0x681 0x04 20 40 0d a3 ff ff ff');
			OvmsEvents.Raise(eventName , 100);
		} else {
			cleanup();
		}
	}
    function resendCommand(){
		if(requireResend){
			print("resend: wait");
			for(var j=0; j++<20;);//need to wait 
			print("resend");
			sendCommand();
		}
	}

	function carOff(){
		cleanup();
	}

	function carOn(){
		print('vehicle.on');
		vgrEventId = PubSub.subscribe('vehicle.gear.reverse', function(){
			print('reverse');
			isRev = true;
		});
		vgnEventId = PubSub.subscribe('vehicle.gear.neutral', function(){
			print('neutral');
			resendCommand();
		});
		vgfEventId = PubSub.subscribe('vehicle.gear.forward', function(){
			print('forward');
			resendCommand();
		});

		PubSub.subscribe(eventName , function(){
			print("event: " + eventName);
			if(!isRev){
				print(eventName + ": send command");
				sendCommand();
			} else {
				print('requireResend: true');
				requireResend = true;
			}
		});
		
		// start timeout:
		OvmsEvents.Raise(eventName , 11000);
	}

	PubSub.subscribe('vehicle.off', carOff);

	PubSub.subscribe('vehicle.on', carOn);

	exports.hideOk = sendCommand;
	exports.carOff = carOff;
	exports.carOn = carOn;
	return exports;
})();