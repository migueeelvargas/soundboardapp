// get the modal
var modal = document.getElementById('addSbModal');

var editModal = document.getElementById("editModal")

// get the button that opens the modal
var btn = document.getElementById("addSbBtn");

// get the <span> element that closes the modal;
var span = document.getElementsByClassName("close")[0];

// get the <span> element that edits the soundboard;
var edit = document.getElementById("edit");

// When the user clicks on the button, open the modal
btn.onclick = function() {
	modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
	modal.style.display = "none";
}

edit.onclick = function() {

	if(editModal.style.display == "none")
		editModal.style.display = "block";
	else
		editModal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
}

// Play sounds on img click



function play() {
	document.getElementById('SbSound').play();
}