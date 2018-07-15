
var config = {
    apiKey: "AIzaSyCnMlalqdT9jXcZRca19HMlIBc26Xcpq30",
    authDomain: "trainscheduler-2bdfe.firebaseapp.com",
    databaseURL: "https://trainscheduler-2bdfe.firebaseio.com",
    projectId: "trainscheduler-2bdfe",
    storageBucket: "",
    messagingSenderId: "447650109893"
  };
  firebase.initializeApp(config);

  var database = firebase.database();



//   database functions

  let data = {
    fromTheForm: () => {
        $('body').on("click", ".add-train", () => {
            // prevent form from submitting
             event.preventDefault();

             // form field variables 
             trainName = $('#train-name').val().trim();
             trainDestination= $('#train-destination').val().trim();
             trainTime=$('#train-time').val().trim();
             trainFrequency=$('#train-frequency').val().trim();

            data.nextArrival();
            data.minutesAway();

            // clear  form
            $('.form-control').val("");

            databaseRef.pushTrain();
        });
    },

    // Time Calculations

    nextArrival: () => {
       // First Time 
       var trainTimeConverted = moment(trainTime, "hh:mm").subtract(1, 'years');
       // get Current Time
       var currentTime = moment();
       //difference between the times
       var diffTime = moment().diff(moment(trainTimeConverted), "minutes");
       // Time left
       var timeLeft = diffTime % trainFrequency;
       //minutes until Train
       var timeRemaining = trainFrequency - timeLeft;
       //Next Train
       nextTrain = moment().add(timeRemaining, 'minutes');
       nextTrain = moment(nextTrain).format('h:mm A');
   },

   minutesAway: () => {
       // First Time (pushed back 1 year to make sure it comes before current time)
       var trainTimeConverted = moment(trainTime, "hh:mm").subtract(1, 'years');
       //Current Time
       var currentTime = moment();
       //difference between the times
       var diffTime = moment().diff(moment(trainTimeConverted), "minutes");
       // Time apart (remainder)
       var timeLeft = diffTime % trainFrequency;
       //minutes until Train
       minutesAway = trainFrequency - timeLeft;
       minutesAway = moment().startOf('day').add(minutesAway, 'minutes').format('HH:mm');
       return moment(minutesAway).format('HH:mm');
   },
   convertFrequency: () => {
       trainFrequency = moment().startOf('day').add(trainFrequency, 'minutes').format('HH:mm');
   }

};

var databaseRef = {
	pushTrain: () => {
		database.ref().push({

			trainTime: trainTime,
		    trainDestination: trainDestination,
		    trainFrequency: trainFrequency,
		    trainName: trainName,
		    dateAdded: firebase.database.ServerValue.TIMESTAMP

		});

		databaseRef.pullChild();

	},
	pullChild: () => {
		var filter = database.ref().orderByChild("dateAdded").limitToLast(1)
		filter.once("child_added", function(child) {

			trainName = child.val().trainName
			trainDestination = child.val().trainDestination
			trainTime = child.val().trainTime
			trainFrequency = child.val().trainFrequency

			trainTable.updateTrainTable();
		});

	},

	databasePull: () => {

		database.ref().on("value", function(snapshot) {
				var trains = snapshot.val();
                console.log(trains)

				$('#train-table-body').empty();

				for (var index in trains){
					trainName = trains[index].trainName
					trainDestination = trains[index].trainDestination
					trainTime = trains[index].trainTime
					trainFrequency = trains[index].trainFrequency

					data.nextArrival();
					data.minutesAway();
					trainTable.updateTrainTable();
				};

		}, function(errorObject) {
      		console.log("Errors handled: " + errorObject.code);

		});
	}

}

$(document).ready(function(){

	data.fromTheForm();
	databaseRef.databasePull();
	setInterval(function() {databaseRef.databasePull()}, 60000);
	trainTable.updateCurrentTime();
	setInterval(function() {trainTable.updateCurrentTime()}, 1000);

});

// populate table
var trainTable = {
	updateTrainTable: () => {
		data.convertFrequency();
		$('#train-table-body').append(
			'<tr>'+
				'<td>' + trainName + '</td>' +
                '<td>' + trainDestination + '</td>' +
                '<td>' + trainFrequency + '</td>' +
				'<td>' + nextTrain + '</td>' +
				'<td>' + minutesAway + '</td>' +
			'</tr>'
			);
	},
	updateCurrentTime: () => {
		$('.currentTime').text(moment().format('h:mm:ss A'))
	}
};