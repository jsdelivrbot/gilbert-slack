var env = require('node-env-file');
env(__dirname + '/.env');


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

  switch(message.command) {  
    case "/clockin":
      bot.replyPrivate(message, "testing clockIN feature");
      break;
      
    case "/clockout":
      bot.replyPrivate(message, 'test clockOUT feature');
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

/*

Botkit Studio Skill module to enhance the "menu" script

*/


module.exports = function(controller) {
    // define a before hook
    // you may define multiple before hooks. they will run in the order they are defined.
    // See: https://botkit.ai/docs/readme-studio.html#controllerstudiobefore
    controller.studio.before('menu', function(convo, next) {

        // do some preparation before the conversation starts...
        // for example, set variables to be used in the message templates
        // convo.setVar('foo','bar');

        console.log('BEFORE: menu');
        // don't forget to call next, or your conversation will never continue.
        next();

    });

    /* Validators */
    // Fire a function whenever a variable is set because of user input
    // See: https://botkit.ai/docs/readme-studio.html#controllerstudiovalidate
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    // Validate user input: question_1
    controller.studio.validate('menu','question_1', function(convo, next) {

        var value = convo.extractResponse('question_1');

        // test or validate value somehow
        // can call convo.gotoThread() to change direction of conversation

        console.log('VALIDATE: menu VARIABLE: question_1');

        // always call next!
        next();

    });

    // Validate user input: question_2
    controller.studio.validate('menu','question_2', function(convo, next) {

        var value = convo.extractResponse('question_2');

        // test or validate value somehow
        // can call convo.gotoThread() to change direction of conversation

        console.log('VALIDATE: menu VARIABLE: question_2');

        // always call next!
        next();

    });

    // Validate user input: question_3
    controller.studio.validate('menu','question_3', function(convo, next) {

        var value = convo.extractResponse('question_3');

        // test or validate value somehow
        // can call convo.gotoThread() to change direction of conversation

        console.log('VALIDATE: menu VARIABLE: question_3');

        // always call next!
        next();

    });

    /* Thread Hooks */
    // Hook functions in-between threads with beforeThread
    // See: https://botkit.ai/docs/readme-studio.html#controllerstudiobeforethread
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    // Before the default thread starts, run this:
    controller.studio.beforeThread('menu','default', function(convo, next) {

        /// do something fun and useful
        // convo.setVar('name','value');

        console.log('In the script *menu*, about to start the thread *default*');

        // always call next!
        next();
    });

    // Before the on_timeout thread starts, run this:
    controller.studio.beforeThread('menu','on_timeout', function(convo, next) {

        /// do something fun and useful
        // convo.setVar('name','value');

        console.log('In the script *menu*, about to start the thread *on_timeout*');

        // always call next!
        next();
    });


    // define an after hook
    // you may define multiple after hooks. they will run in the order they are defined.
    // See: https://botkit.ai/docs/readme-studio.html#controllerstudioafter
    controller.studio.after('menu', function(convo, next) {

        console.log('AFTER: menu');

        // handle the outcome of the convo
        if (convo.successful()) {

            var responses = convo.extractResponses();
            // do something with the responses

        }

        // don't forget to call next, or your conversation will never properly complete.
        next();
    });
}



// function usage_tip() {
//     console.log('~~~~~~~~~~');
//     console.log('Botkit Starter Kit');
//     console.log('Execute your bot application like this:');
//     console.log('clientId=<MY SLACK CLIENT ID> clientSecret=<MY CLIENT SECRET> PORT=3000 studio_token=<MY BOTKIT STUDIO TOKEN> node bot.js');
//     console.log('Get Slack app credentials here: https://api.slack.com/apps')
//     console.log('Get a Botkit Studio token here: https://studio.botkit.ai/')
//     console.log('~~~~~~~~~~');
// }
