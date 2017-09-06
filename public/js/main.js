"use strict";

// Global var to hold data returned from JSON package
var data;
var isHPdata = false;

// Load after document is finished loading
$(document).ready(function() {
  var xmlhttp = new XMLHttpRequest();
  var url = "data.txt";

  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {

      // check for valid json text
      if ( validJSON(this.responseText) ) {
        data = JSON.parse(this.responseText);
      } 
      // if not, alert user of bad json text
      else {
        alert("Data file is not valid JSON text.")
      }

      // If everything checks out, load Soundboard
      createSoundboard(data, 0, 'full');
    }
    // Check if the URL to json file is working, alert user if bad
    else if (this.status == 404) {
      alert(this.status + ': ' + url + ' ' + this.statusText);
    }
    // Return any internal error and alert user, if any.
    else if (this.status == 500) {
      alert (this.status + ': ' + this.statusText);
    }
  };

  xmlhttp.open("GET", url, true);
  xmlhttp.send();
});

// Helper function used to check for valid JSON text
function validJSON(text) {
  try {
    JSON.parse(text);
  }
  catch (e) {
    return false;
  }
  return true;
}

// Function used to switch the data themes.
function switchTheme(css_theme) {
  var numLinkI, strLinkTag;

  var objLinkTag = document.getElementsByTagName("link");
  // Loop through link tags to find active matching stylesheet and disable the others  
  for (numLinkI=0; numLinkI<objLinkTag.length; numLinkI++){
    if(objLinkTag[numLinkI].rel.indexOf("stylesheet") != -1 && objLinkTag[numLinkI].title) {

      objLinkTag[numLinkI].disabled = true;
    }
        
    if(objLinkTag[numLinkI].title == css_theme) {
      objLinkTag[numLinkI].disabled = false;
    }
  }
}
// Function used to create the soundboard.
function createSoundboard(config, theme, compORrich) {
  // Clear all previous HTML, if any.
  $('#soundBoard').empty();

  // Insert header name based on data displaying
  document.getElementsByTagName("h1")[0].innerHTML = config[theme].boardName;

  var numI;
  const strWAV = "audio/wav";
  const strMP3 = "audio/mpeg";
  const substrWAV = "wav";
  const substrMP3 = "mp3";
  const conImgDir = "../img/" 
  const conSoundDir = "../sounds/"

  // Loop through the config file to dynamically create sound and image pairs
  for(numI = 0; numI < 12; numI++) {
    if(compORrich === 'full'){
      var objDiv = $("<div></div>")
        .addClass("col-md-4 col-sm-6 soundThumb")

      var objImg = $("<img />")
        .attr("src", conImgDir+config[theme].imgs[numI])
        .attr("height", "150")
        .attr("width", "150")
        .attr("alt", config[theme].names[numI])
    }
    
    var objH3 = $("<h3></h3>")
      .text(config[theme].names[numI])
      
    var objAudioCont = $("<audio controls></audio>")
    var objSound = $("<source />")
      .attr("src", conSoundDir+config[theme].sounds[numI])
      
    if (config[theme].sounds[numI].indexOf(substrWAV) !== -1){
      objSound.attr("type", strWAV)
    }
      
    else if (config[theme].sounds[numI].indexOf(substrMP3) !== -1){
      objSound.attr("type", strMP3)
    }
      
    else {
      console.log("Error: this sound doesn't exist.");
    }
    // Add newly created elements to the soundboard
    $(objAudioCont).append(objSound)
    
    if(compORrich === 'full'){
      $(objDiv).append(objImg);
      $(objDiv).append(objH3);
      $(objDiv).append(objAudioCont);
      $('#soundBoard').append(objDiv);
    }
      
    else if (compORrich === 'compact'){
      var objImg = $("<img />")
        .attr("src", conImgDir+config[theme].imgs[numI])
        .attr("height", "50")
        .attr("width", "50")
        .attr("alt", config[theme].names[numI])

      var objDiv = $("<div></div>")
        .addClass("col-md-8 col-md-offset-2 col-sm-6 col-sm-offset-3 soundThumb-listview")
      $(objDiv).append(objImg)
      $(objDiv).append(objH3)
      $(objDiv).append(objAudioCont)
      $('#soundBoard').append(objDiv);
    }
  }
}
