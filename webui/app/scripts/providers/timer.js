app.factory("timer", ["$timeout", function($timeout) {
    // I provide a simple wrapper around the core $timeout that allows for
    // the timer to be easily reset.
    function Timer(callback, duration, invokeApply) {
        // Store properties.
        this._callback = callback;
        this._duration = (duration || 0);
        this._invokeApply = (invokeApply !== false);

        // I hold the $timeout promise. This will only be non-null when the
        // timer is actively counting down to callback invocation.
        this._timer = null;
    };
    // Define the instance methods.
    Timer.prototype = {
        // Set constructor to help with instanceof operations.
        constructor: Timer,

        // I determine if the timer is currently counting down.
        isActive: function() {
            return (!!this._timer);
        },
        // I stop (if it is running) and then start the timer again.
        restart: function() {
            this.stop();
            this.start();
        },
        // I start the timer, which will invoke the callback upon timeout.
        start: function() {
            var self = this;

            // NOTE: Instead of passing the callback directly to the timeout,
            // we're going to wrap it in an anonymous function so we can set
            // the enable flag. We need to do this approach, rather than
            // binding to the .then() event since the .then() will initiate a
            // digest, which the user may not want.
            this._timer = $timeout(
                function handleTimeoutResolve() {
                    try {
                        if (self._callback) {
                            self._callback.call(null);
                        }
                    } finally {
                        self = self._timer = null;
                    }
                },
                this._duration,
                this._invokeApply
            );
        },
        // I stop the current timer, if it is running, which will prevent the
        // callback from being invoked.
        stop: function() {
            $timeout.cancel(this._timer);
            this._timer = false;
        },
        // I clean up the internal object references to help garbage
        // collection (hopefully).
        teardown: function() {
            this.stop();
            this._callback = null;
            this._duration = null;
            this._invokeApply = null;
            this._timer = null;
        }
    };
    // Create a factory that will call the constructor. This will simplify
    // the calling context.
    function timerFactory(callback, duration, invokeApply) {
        return (new Timer(callback, duration, invokeApply));
    }

    // Store the actual constructor as a factory property so that it is still
    // accessible if anyone wants to use it directly.
    timerFactory.Timer = Timer;

    // Set up some time-based constants to help readability of code.
    timerFactory.ONE_SECOND = (1 * 1000);
    timerFactory.TWO_SECONDS = (2 * 1000);
    timerFactory.THREE_SECONDS = (3 * 1000);
    timerFactory.FOUR_SECONDS = (4 * 1000);
    timerFactory.FIVE_SECONDS = (5 * 1000);
    return timerFactory;
}]);
