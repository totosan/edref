"use strict";
/// <reference path="typings/node.d.ts" />
var Cylon = require("cylon-intel-iot");
var Monitor;
(function (Monitor) {
    var LCD = (function () {
        function LCD() {
            Cylon.robot({
                connections: {
                    arduino: { adaptor: 'firmata', port: '/dev/ttyACM0' }
                },
                devices: {
                    lcd: { driver: 'lcd' }
                },
                work: function (my) {
                    my.lcd.on('start', function () {
                        my.lcd.print("Hello!");
                    });
                }
            }).Start();
        }
        return LCD;
    }());
    Monitor.LCD = LCD;
})(Monitor = exports.Monitor || (exports.Monitor = {}));
//# sourceMappingURL=LCD_Monitor.js.map