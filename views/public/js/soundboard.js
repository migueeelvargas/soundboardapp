// get the modal
var modal = document.getElementById('addSoundModal');
// var editSoundModal = document.getElementsByClass('editModal');

// get the button that opens the modal
var btn = document.getElementById("addSoundBtn");
var editSoundBtn = document.getElementById("editSoundBtn");

// get the <span> element that closes the modal;
var span = document.getElementsByClassName("close")[0];
var editSpan = document.getElementById("editClose");

// When the user clicks on the button, open the modal
btn.onclick = function() {
	modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
	modal.style.display = "none";
}

var modalEdit = document.getElementById('editM');
var spanEdit = document.getElementById('editClose');

spanEdit.onclick = function() {
	modalEdit.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
}

function play() {
	document.getElementById('sbSound').play();
}

function playAudio() {
	var audio = document.getElementById('sbSound').getAttribute('data-src');
	var source = audio.getAttribute('data-src');
	audio.src = source;
	audio.play();
}

// DELETE button.
function deleteBoard(sbid) {
	$.ajax({
	  url: '/app/soundboard/' + sbid,
	  method: 'DELETE'
	})
  .done(function( data ) {
    window.location = '/app';
  });
}

// DELETE sound button.
function deleteSound(soundid) {
	$.ajax({
	  url: '/app/sound/' + soundid,
	  method: 'DELETE',
	  success: function(data) {
	  	window.location=data;
	  },
	  error: function(err) {
	  	console.log(err);
	  }
	});
}

function showModal(soundid, name, num) {
	
	var span = document.getElementsByClassName('editModal');
	
	span[num].style.display = "block";
}

function editSound(soundid) {

	console.log("edit clicked");
	var data = $('#editSoundName').val();
	console.log(data);

	// $.ajax({
	//   url: '/app/sound/' + soundid,
	//   method: 'PUT',
	//   data: {
	//   	name: data
	//   },
	//   success: function(data) {
	//   	window.location=data;
	//   },
	//   error: function(err) {
	//   	console.log(err);
	//   }
	// });
}