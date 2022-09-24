(function(){
	print('nowo start');
	var eventName = 'usr.nowo.timeout';
	var i = 0;
	var isRev = false;
    var requireResend = false;
	function cleanup(){
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
			if(requireResend){
				sendCommand();
			}
			isRev = false;
		});
		PubSub.subscribe('vehicle.gear.forward', function(){
			print('forward');
			if(requireResend){
				sendCommand();
			}
			isRev = false;
		});
		PubSub.subscribe(eventName , function(){
			if(!isRev){
				sendCommand();
			} else {
				requireResend = true;
			}
		});
		
		// start timeout:
		OvmsEvents.Raise(eventName , 11000);
	});
})();