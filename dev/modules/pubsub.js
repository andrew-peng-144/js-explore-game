var PubSub = {

    enable: function (target) {

        var n, max;

        target.subscribe = function (event, callback) {
            this.subscribers = this.subscribers || {};
            this.subscribers[event] = this.subscribers[event] || [];
            this.subscribers[event].push(callback);
        };

        /**
         * Remaining arguments are args of the callback
         */
        target.publish = function (event) {
            if (this.subscribers && this.subscribers[event]) {
                var subs = this.subscribers[event],
                    args = [].slice.call(arguments, 1),
                    n, max;
                for (n = 0, max = subs.length; n < max; n++)
                    subs[n].apply(target, args);
            }
        }

    }

}
export { PubSub }; 