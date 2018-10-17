controller.hears('menu', 'direct_message', function(bot, message) {

   bot.startConversation(message, function(err, convo) {

    convo.ask({
        "attachments": [
                            {
                                "color": "#8cd5f0",
                                "callback_id": "timekeeping",
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
                        ]
    },[
        {
            pattern: "clockIn",
            callback: function(reply, convo) {
                var now = moment().tz("America/New_York").format('LT');
                convo.say('Oh! Kind person, I have written down your time to start at: ' + now + '.');
                convo.next();

            }
        },
        {
            pattern: "clockOut",
            callback: function(reply, convo) {
                convo.say('Too bad');
                convo.next();
            }
        },
        {
            default: true,
            callback: function(reply, convo) {
                // do nothing
            }
        }
    ]);
});
});
