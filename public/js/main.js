var update = document.getElementById('update');

update.addEventListener('click', function() {
  console.log("update button clicked");
  fetch('update', {
    method: 'put',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      "name":"testteam3",
      "points":5
    })
  })
})
