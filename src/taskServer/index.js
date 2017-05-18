var events = require("../events")();
var EventEmitter = require('events').EventEmitter;

module.exports = function(task, name){
	var t = {
		_task: undefined,
		_worker: undefined,
		_name: undefined,
		_events: events,
		_eventEmitter: new EventEmitter(),
	
		send: function(worker){
			t._worker = worker;
			t._worker.send({type: "task", task: t._task});

			t._worker.tasks.push(t);

			console.log(t._worker.name+" was assigned task "+t._task.uid+"... ");

			t._worker.on("message", function(message){
				if(message.type = "finished" && message.uid == t._task.uid){
					console.log(t._worker.name+" finished task "+t._task.uid+"... ");

					t.emit("finished", t._task.i);

					t._worker.tasks = t._worker.tasks.filter(function(task){
						return task != t;
					});
				}
			});
		},
		failed: function(type){
			if(!t._task.persistant || type == "error"){
				t._task.ttl--;
			}

			if(t._task.ttl > 0){
				t._events.emit(t._name, JSON.stringify(task));
			}
		}
	}

	t.on = function(name, callback){
		t._eventEmitter.on(name, callback);
	};

	t.emit = function(name, data){
		t._eventEmitter.emit(name, data);
	}

	t._task = task;
	t._name = name;

	return t;
}
