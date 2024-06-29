export const Queue = (function(){

    function Queue() {};

    Queue.prototype.running = false;

    Queue.prototype.queue = [];

    Queue.prototype.enqueue = function(callback: () => Promise<void>) { 
        var _this = this;
        //add callback to the queue
        this.queue.push(async () => {
            await callback();
            _this.next();
        });

        if(!this.running) {
            // if nothing is running, then start the engines!
            this.next();
        }

        return this; // for chaining fun!
    }

    Queue.prototype.next = function(){
        this.running = false;
        //get the first element off the queue
        var shift = this.queue.shift(); 
        if(shift) { 
            this.running = true;
            shift(); 
        }
    }

    return Queue;

})();
