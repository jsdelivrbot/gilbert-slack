// var moment = require('moment');
var moment = require('moment-timezone');
// moment();
// moment().tz("America/New_York");
moment.tz("America/New_York")


module.exports = function(controller) {
  
  var clockedIn;
  var clockedOut;
  
  var currentlyClocked = false;
  
  controller.hears('menu', 'direct_message', function(bot, message) {

    bot.reply(message, {
          "attachments": [
                            {
                                "color": "#8cd5f0",
                                "callback_id": "user_selection",
                                "actions": [
                                    {
                                        "style": "primary",
                                        "type": "button",
                                        "value": "clockIn",
                                        "name": "clockIn",
                                        "text": "Clock In"
                                    },
                                    {
                                        "style": "default",
                                        "type": "button",
                                        "value": "generateReport",
                                        "name": "generateReport",
                                        "text": "Generate Report"
                                    },
                                    {
                                        "style": "danger",
                                        "type": "button",
                                        "value": "clockOut",
                                        "name": "clockOut",
                                        "text": "Clock Out"
                                    }
                                ],
                                "fields": [],
                                "text": "Select an option",
                                "title": "What would you like to do?",
                                "footer": "v0.1",
                                "fallback": "",
                                "title_link": ""
                            }
                          ],
      "text": 'Oh... It is I, Gilbert! Underpaid and very ove- nevermind... Allow me to keep track of your time!',
    });
    
});
  
controller.on('interactive_message_callback', function(bot, message) {
        
  
  if(message.callback_id === 'user_selection' && message.actions[0].value.match(/^clockIn$/)) {
    if(currentlyClocked === false) {
      clockedIn = moment().tz("America/New_York");
      
      currentlyClocked = true;
      bot.replyInteractive(message, {
        text: 'Oh! I have written down your time to start at: ' + clockedIn.format("HH:mm A") + '.',
      });
    } else {
        bot.replyInteractive(message, {
          text: 'You are already clocked in, bloody idiot!',
        });
      
    }
  }
  
    if(message.callback_id === 'user_selection' && message.actions[0].value.match(/^clockOut$/)) {
      if(currentlyClocked === true) {
        clockedOut = moment().tz("America/New_York");
        currentlyClocked = false;
        
        var duration = moment.duration(clockedOut.diff(clockedIn));
        var hours = parseInt(duration.asHours());
        var minutes = parseInt(duration.asMinutes())%60;
        
        var totalTimeWorked = hours + ' hour and '+ minutes+' minutes.';
  
        bot.replyInteractive(message, {
          text: 'You clocked out at: ' + clockedOut.format("HH:mm A") + "." + "You worked for a total of " + totalTimeWorked + " today.",
        });
      } else {
          bot.replyInteractive(message, {
            text: 'You\'re not currently clocked in!',
          });
      }
  }
  
    if(message.callback_id === 'user_selection' && message.actions[0].value.match(/^generateReport$/)) {
      bot.replyInteractive(message, {
        text: 'Generating report...bzzT.',
      });
      bot.say('fool!');
  }
});
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
}



