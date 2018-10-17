var env = require('node-env-file');
env(__dirname + '/.env');
var moment = require('moment');
moment().format();
var moment = require('moment-timezone');
moment().tz("America/New_York").format();





if (!process.env.clientId || !process.env.clientSecret || !process.env.PORT) {
  // usage_tip();
  // process.exit(1);
}

var Botkit = require('botkit');
var debug = require('debug')('botkit:main');

var bot_options = {
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    // debug: true,
    scopes: ['bot'],
    studio_token: process.env.studio_token,
    studio_command_uri: process.env.studio_command_uri
};

// Use a mongo database if specified, otherwise store in a JSON file local to the app.
// Mongo is automatically configured when deploying to Heroku
if (process.env.MONGO_URI) {
    var mongoStorage = require('botkit-storage-mongo')({mongoUri: process.env.MONGO_URI});
    bot_options.storage = mongoStorage;
} else {
    bot_options.json_file_store = __dirname + '/.data/db/'; // store user data in a simple JSON format
}

// Create the Botkit controller, which controls all instances of the bot.
var controller = Botkit.slackbot(bot_options);

controller.startTicking();

// Set up an Express-powered webserver to expose oauth and webhook endpoints
var webserver = require(__dirname + '/components/express_webserver.js')(controller);

if (!process.env.clientId || !process.env.clientSecret) {

  // Load in some helpers that make running Botkit on Glitch.com better
  require(__dirname + '/components/plugin_glitch.js')(controller);

  webserver.get('/', function(req, res){
    res.render('installation', {
      studio_enabled: controller.config.studio_token ? true : false,
      domain: req.get('host'),
      protocol: req.protocol,
      glitch_domain:  process.env.PROJECT_DOMAIN,
      layout: 'layouts/default'
    });
  })

  var where_its_at = 'https://' + process.env.PROJECT_DOMAIN + '.glitch.me/';
  console.log('WARNING: This application is not fully configured to work with Slack. Please see instructions at ' + where_its_at);
}else {

  webserver.get('/', function(req, res){
    res.render('index', {
      domain: req.get('host'),
      protocol: req.protocol,
      glitch_domain:  process.env.PROJECT_DOMAIN,
      layout: 'layouts/default'
    });
  })
  // Set up a simple storage backend for keeping a record of customers
  // who sign up for the app via the oauth
  require(__dirname + '/components/user_registration.js')(controller);

  // Send an onboarding message when a new team joins
  require(__dirname + '/components/onboarding.js')(controller);

  // Load in some helpers that make running Botkit on Glitch.com better
  require(__dirname + '/components/plugin_glitch.js')(controller);

  // enable advanced botkit studio metrics
  require('botkit-studio-metrics')(controller);

  var normalizedPath = require("path").join(__dirname, "skills");
  require("fs").readdirSync(normalizedPath).forEach(function(file) {
    require("./skills/" + file)(controller);
  });

  // This captures and evaluates any message sent to the bot as a DM
  // or sent to the bot in the form "@bot message" and passes it to
  // Botkit Studio to evaluate for trigger words and patterns.
  // If a trigger is matched, the conversation will automatically fire!
  // You can tie into the execution of the script using the functions
  // controller.studio.before, controller.studio.after and controller.studio.validate
  if (process.env.studio_token) {
      controller.on('direct_message,direct_mention,mention', function(bot, message) {
          controller.studio.runTrigger(bot, message.text, message.user, message.channel, message).then(function(convo) {
              if (!convo) {
                  // no trigger was matched
                  // If you want your bot to respond to every message,
                  // define a 'fallback' script in Botkit Studio
                  // and uncomment the line below.
                  // controller.studio.run(bot, 'fallback', message.user, message.channel);
              } else {
                  // set variables here that are needed for EVERY script
                  // use controller.studio.before('script') to set variables specific to a script
                  convo.setVar('current_time', new Date());
              }
          }).catch(function(err) {
              bot.reply(message, 'I experienced an error with a request to Botkit Studio: ' + err);
              debug('Botkit Studio: ', err);
          });
      });
  } else {
      console.log('~~~~~~~~~~');
      console.log('NOTE: Botkit Studio functionality has not been enabled');
      console.log('To enable, pass in a studio_token parameter with a token from https://studio.botkit.ai/');
  }
}

// Timekeeping Controller & Logic
controller.on('slash_command',function(bot,message) {

  var clockedIn = new Boolean(0);

  switch(message.command) {
    case "/clockin":
        var now = moment().tz("America/New_York").format('LT');
        bot.replyPrivate(message, "Oh! Kind person, I have written down your time to start at: " + now + ".");
        clockedIn = true;
      break;

    case "/clockout":
      bot.replyPrivate(message, 'testing clockout feature');
      break;

    case "/timereport":
      bot.replyPrivate(message, 'generate CSV report');
      break;
  }

  if (message.text === "help") {
    bot.replyPrivate(message, "Hello, sir. Try typing 'help' for a more interactive help menu.");
    return;
  }
});


// controller.hears('menu', 'direct_message', function(bot, message) {
//     bot.reply(message, {
//         "attachments": [
//                             {
//                                 "color": "#8cd5f0",
//                                 "callback_id": "timekeeping",
//                                 "actions": [
//                                     {
//                                         "style": "primary",
//                                         "type": "button",
//                                         "value": "0",
//                                         "name": "button",
//                                         "text": "Clock In"
//                                     },
//                                     {
//                                         "style": "default",
//                                         "type": "button",
//                                         "value": "1",
//                                         "name": "button",
//                                         "text": "Generate Report"
//                                     },
//                                     {
//                                         "style": "danger",
//                                         "type": "button",
//                                         "value": "2",
//                                         "name": "button",
//                                         "text": "Clock Out"
//                                     }
//                                 ],
//                                 "fields": [],
//                                 "text": "Select an option",
//                                 "title": "What would you like to do?",
//                                 "footer": "v0.1",
//                                 "fallback": "",
//                                 "title_link": ""
//                             }
//                         ]
//     });
// });


// // receive an interactive message, and reply with a message that will replace the original
// controller.on('interactive_message_callback', function(bot, message) {

//     // check message.actions and message.callback_id to see what action to take...
//     var now = moment().tz("America/New_York").format('LT');

//     bot.replyInteractive(message, {

//         text: 'Oh! Kind person, I have written down your time to start at: ' + now + '.',
//         attachments: [
//             {
//                 title: 'My buttons',
//                 callback_id: '123',
//                 attachment_type: 'default',
//                 actions: [
//                     {
//                         "name":"yes",
//                         "text": "Yes!",
//                         "value": "yes",
//                         "type": "button",
//                     },
//                     {
//                        "text": "No!",
//                         "name": "no",
//                         "value": "delete",
//                         "style": "danger",
//                         "type": "button",
//                         "confirm": {
//                           "title": "Are you sure?",
//                           "text": "This will do something!",
//                           "ok_text": "Yes",
//                           "dismiss_text": "No"
//                         }
//                     }
//                 ]
//             }
//         ]
//     });

// });
