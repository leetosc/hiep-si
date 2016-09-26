// var update = document.getElementById('update');

// update.addEventListener('click', function() {
//   console.log("update button clicked");
//   fetch('update', {
//     method: 'put',
//     headers: {'Content-Type':'application/json'},
//     body: JSON.stringify({
//       "name":"testteam3",
//       "points":5
//     })
//   })
// })

function validateBHT() {
  // console.log("valdiating..");
  // TODO: validate full name (first last)

  if(document.BHTform.teamname.value == "none") {
    document.getElementById("errorText").innerHTML = '<font color="red">Please select your team</font>';
    return false;
  }
  if(document.BHTform.fullname.value == "") {
    document.getElementById("errorText").innerHTML = '<font color="red">Please enter your name</font>';
    return false;
  }
  if(isNaN(document.BHTform.prayer.value) || isNaN(document.BHTform.communion.value) || isNaN(document.BHTform.sacrifice.value) || isNaN(document.BHTform.apostolicwork.value) || isNaN(document.BHTform.mass.value) || isNaN(document.BHTform.adoration.value) || isNaN(document.BHTform.readbible.value)) {
    document.getElementById("errorText").innerHTML = '<font color="red">Please double check values</font>';
    return false;
  }

}

function clearErrorText(){
  document.getElementById("errorText").innerHTML = '';
}
