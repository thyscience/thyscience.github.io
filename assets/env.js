// ENV: ThyX

function envMain () {
  let password = getPassword()
  let linksJson

  if (password) {
    linksJson = localStorage.getItem("linksJson")

    if (!linksJson) {
      $.get(links_gistUrl).then(function (response) {
        linksJson = decryptData(response, password)
        localStorage.setItem("linksJson", linksJson)
        location.reload()
      })
    } else {
      dtLinks_populate(JSON.parse(linksJson))
      $("div#cpanel").show()
    }
  }

}