/// <reference path="typings/node.d.ts" />
import Cylon = require("cylon");
export module Monitor {
 export class LCD {

     constructor(){
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
    }
}