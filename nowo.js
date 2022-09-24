(function(){
	print('nowo start');
	var exports = {};
	var eventName = 'usr.nowo.timeout';
	var i = 0;
	var isRev = false;
    var requireResend = false;
	
	function cleanup(){
		print("cleanup");
		i = 0;
		isRev = false;
		requireResend = false;
		PubSub.unsubscribe(eventName);
		PubSub.unsubscribe('vehicle.gear.reverse');
		PubSub.unsubscribe('vehicle.gear.forward');
		PubSub.unsubscribe('vehicle.gear.neutral');
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
	PubSub.subscribe('vehicle.off', function(){
		cleanup();
	});

	PubSub.subscribe('vehicle.on', function(){
		print('vehicle.on');
		PubSub.subscribe('vehicle.gear.reverse', function(){
			print('reverse');
			isRev = true;
		});
		PubSub.subscribe('vehicle.gear.neutral', function(){
			print('neutral');
			resendCommand();
		});
		PubSub.subscribe('vehicle.gear.forward', function(){
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
	});
	exports.hideOk = sendCommand;
	return exports;
})();