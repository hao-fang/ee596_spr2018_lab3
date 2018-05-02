'use strict';

const Alexa = require('alexa-sdk');
const AWS = require('aws-sdk');

const tables = {
  ChatData: 'EE596Lab3ChatData',
  UserData: 'EE596Lab3UserData',
};

AWS.config.update({'region': 'us-east-1'});
let docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context, callback);
  //! Replace the appId with your Skill ID only if you
  //! want to validate that the request origated from your skill.
  alexa.appId = null;
  alexa.registerHandlers(handlers);
  alexa.execute();
};


// --------------- handlers ------------------

const handlers = {
  'NewSession': function () {
    // Called when the session starts
    console.log('NewSession requestId=' + this.event.request.requestId
      + ', sessionId=' + this.event.session['sessionId']);

    this.emit('LaunchRequest');
  },

  'LaunchRequest': function () {
    // Called when the user launches the skill without specifying what they want
    console.log('LaunchRequest requestId=' + this.event.request.requestId
      + ', sessionId=' + this.event.session['sessionId']);

    let cardTitle = 'Welcome';
    let speechOutput = 'Welcome to EE596 Lab 3.'
      + ' You can say anything and'
      + ' I\'ll tell you my language understanding results.';
    let repromptText = ' You can say <prosody rate="slow">stop</prosody> to exit the skill.';

    getUserData(this.event.session.user.userId)
      .then(numEndedSessions => {
        initializeAttributes(this.attributes, numEndedSessions);
      })
      .then(result => {
        saveSessionTurn(this.event, speechOutput, repromptText, this.attributes);
      })
      .then(result => {
        this.attributes.turnIdx += 1;
        this.response.speak(speechOutput)
          .listen(repromptText)
          .cardRenderer(cardTitle, speechOutput);
        this.emit(':responseReady');
      })
      .catch(err => {
        console.log(err);
        this.emit('_Exception');
      });

  },

  'SessionEndedRequest': function () {
    console.log('SessionEndedRequest requestId=' + this.event.request.requestId
      + ', sessionId=' + this.event.session['sessionId']);
    // add cleanup logic here

    let cardTitle = 'Goodbye';
    let speechOutput = 'It\'s been nice talking with you. Goodbye!';

    this.attributes.numEndedSessions += 1;
    Promise.all([
      saveSessionTurn(this.event, speechOutput, '_', this.attributes),
      saveUserData(this.event.session.user.userId, this.attributes.numEndedSessions)
    ]).then(results => {
        this.response.speak(speechOutput)
          .cardRenderer(cardTitle, speechOutput);
        this.emit(':responseReady');
      })
      .catch(err => {
        this.emit('_Exception');
      });
  },

  '_Exception': function () {
    this.response.speak('Something went wrong!');
    this.emit(':responseReady');
  },

  'AMAZON.StopIntent': function () {
    this.emit('SessionEndedRequest');
  },

  'Unhandled': function () {
    //! Intents without an registered handler
    console.log('Unhandled requestId=' + this.event.request.requestId
      + ', sessionId=' + this.event.session['sessionId']);

    let intent = this.event.request.intent;
    let numSlots;
    let cardTitle;
    let speechOutput;
    let repromptText = 'You can say "exit" to end the conversation.';

    //! Default response.
    cardTitle = 'Sorry :(';
    speechOutput = 'Sorry, I didn\'t recognize any intent.';

    //! Replaces the default response.
    if (intent) {
      //! Adds intent information.
      cardTitle = 'Recognized Intent: ';
      speechOutput = 'The recognized intent is ';
      if (intent.name) {
        cardTitle += intent.name;
        speechOutput += intent.name;
      } else {
        cardTitle += ' null';
        speechOutput += ' null';
      }
      //! Adds a period.
      speechOutput += ' .';
      //! Adds slot information.
      if (intent.slots) {
        numSlots = Object.keys(intent.slots).length;
        speechOutput += ' There are ' + numSlots;
        if (numSlots === 1) {
          speechOutput += ' recognized slot.';
        } else {
          speechOutput += ' recognized slots.';
        }
        for (let slotName in intent.slots) {
          if (intent.slots.hasOwnProperty(slotName)) {
            speechOutput += ' The value of slot';
            speechOutput += ' <prosody rate="slow">' + slotName + '</prosody>';
            if (intent.slots[slotName]) {
              speechOutput += ' is <break strength="strong"/> ';
              speechOutput += intent.slots[slotName].value;
            } else {
              speechOutput += ' unrecognized.';
            }
            speechOutput += ' <break strength="strong"/>';
          }
        }
      }
    }

    //! Builds the response.
    saveSessionTurn(this.event, speechOutput, repromptText, this.attributes)
      .then(result => {
        this.attributes.turnIdx += 1;
        this.response.speak(speechOutput)
          .listen(repromptText)
          .cardRenderer(cardTitle, speechOutput);
        this.emit(':responseReady');
      })
      .catch(err => {
        this.emit('_Exception');
      });
  }

};

// --------------- helpers ------------------
function initializeAttributes (attributes, numEndedSessions) {
  attributes.numEndedSessions = numEndedSessions;
  attributes.turnIdx = 0;
}

function saveSessionTurn(event, agentUtterance, agentReprompt, attributes) {
  let params;
  let intentName;

  if (event.request.intent) {
    intentName = event.request.intent.name;
  } else {
    intentName = '_';
  }

  params = {
    TableName: tables.ChatData,
    Item: {
      sessionId: event.session.sessionId,
      turnIdx: attributes.turnIdx,
      createdAt: new Date().toISOString(),
      userId: event.session.user.userId,
      intentName: intentName,
      agentUtterance: agentUtterance,
      agentReprompt: agentReprompt,
      sessionAttributes: JSON.stringify(attributes),
      cachedEventJsonStr: JSON.stringify(event)
    },
  };

  return new Promise(function (resolve, reject) {
    docClient.put(params,
      (err, data) => {
        if (err) {
          console.log(err);
          return reject(err);
        }

        return resolve(null);
      }
    );
  });
}

function saveUserData(userId, numEndedSessions) {
  let params;

  params = {
    TableName: tables.UserData,
    Item: {
      userId: userId,
      numEndedSessions: numEndedSessions,
    },
  };

  return new Promise(function (resolve, reject) {
    docClient.put(params,
      (err, data) => {
        if (err) {
          console.log(err);
          return reject(err);
        }

        return resolve(null);
      }
    );
  });
}

function getUserData(userId) {
  let params;

  params = {
    TableName: tables.UserData,
    Key: {
      userId: userId
    },
  };

  return new Promise(function (resolve, reject) {
    docClient.get(params,
      (err, data) => {
        if (err) {
          console.log(err);
          return reject(err);
        }

        if (Object.keys(data).length === 0) {
          //! first-time user
          return resolve(0);
        } else {
          return resolve(data.Item.numEndedSessions);
        }

      }
    );
  });
}
