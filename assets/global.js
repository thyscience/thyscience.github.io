var dtLinks
var links_gistUrl = "https://gist.githubusercontent.com/thyhum/1272ba382810fb08e679dcd744a4e34c/raw/thyhome"

const urlSearchParams = new URLSearchParams(window.location.search)
const params = Object.fromEntries(urlSearchParams.entries())

function getPassword () {
  let password = localStorage.getItem("password")

  if (!password) {
    $("div#links").html("<input type='password' id='password''>")
    $("input#password").on("keyup", function (e) {
      if (e.keyCode === 13) {
        localStorage.setItem("password", $("input#password").val())
        location.reload()
      }
    })
    return false
  } else {
    return password
  }

}

function clearStorage (item = "password") {
  if (item === "linksJson") {
    localStorage.removeItem(item)
  } else {
    localStorage.clear()
  }
  location.reload()
}

function encryptData (response, password) {
  let key = forge.md.sha256.create().update(password).digest().data
  let iv = forge.md.md5.create().update(password).digest().data
  let cipher

  cipher = forge.cipher.createCipher("AES-CBC", key)
  cipher.start({ iv: iv })
  cipher.update(forge.util.createBuffer(response, "utf8"))
  cipher.finish()
  let outputHex = cipher.output.toHex()

  return outputHex
}

function decryptData (response, password) {
  let key = forge.md.sha256.create().update(password).digest().data
  let iv = forge.md.md5.create().update(password).digest().data
  let decipher = forge.cipher.createDecipher("AES-CBC", key)
  decipher.start({ iv: iv })
  decipher.update(forge.util.createBuffer(forge.util.hexToBytes(response)))
  decipher.finish()
  let decrypted = decipher.output.data

  return forge.util.decodeUtf8(decrypted)
}

function dtApplySearch (column, val) {
  val = $.fn.dataTable.util.escapeRegex(val)
  column.search(val ? `^${val}$` : "", true, false).draw()
  $(`<span>${val}</span>`).appendTo(
    $(column.footer()).empty().removeClass("SEARCH_SELECT"),
  )

  dtUpdateSearch(column.table())

}

function newUrl (columnName, columnCellVal) {
  let newUrl = `${window.location.search !== "" ? `${window.location.search}&` : "?"}${columnName}=${columnCellVal}`

  window.location = newUrl
}

function dtUpdateSearch (dt) {
  let rowCount = dt.rows().count()

  if (rowCount > 1) {
    dt.columns().every(function () {
      let column = this
      let footer = column.footer()
      let footerClassName = footer.className

      if (footerClassName.includes("SEARCH_SELECT")) {

        let select = $("<select class='dtSelect'><option value=\'\'></option></select>").appendTo($(footer).empty()).on("change", function () {
          let columnName = $(column.header()).text().toLowerCase()
          let columnCellVal = $(this).val()
          newUrl(columnName, columnCellVal)
        })

        column.column(column.index(), { search: "applied" }).data().unique().sort().each(function (d, j) {
          select.append(`<option value='${d}'>${d}</option>`)
        })

      } else if (footerClassName.includes("SEARCH_TEXT")) {
        $(`<input type='text' placeholder='Search ${column.header().textContent}'>`).appendTo($(footer).empty()).on("keyup change clear", function () {
          if (column.search() !== this.value) {
            column.search(this.value).draw()
          }
        })
      }
    })

  }

}

function dtLinks_populate (response) {
  let row
  let linkHref
  let linkExtra

  $.each(response, function (groupKey, groupVal) {
    $.each(groupVal, function (subgroupKey, subgroupVal) {
      if (subgroupKey !== "meta") {
        $.each(subgroupVal["links"], function (linkKey, linkVal) {
          linkHref = linkVal.href == null ? linkVal : linkVal.href

          if (linkVal.description == null) {
            linkExtra = ""
          } else {
            linkExtra = linkVal.description
          }

          row = [
            groupKey,
            subgroupKey,
            `<a href="${linkHref}" class="text-decoration-none">${linkKey}</a> ${linkExtra}`,
          ]
          dtLinks.row.add(row)
        })
      }
    })
  })
  dtLinks.draw()

  $.each(params, function (key, val) {
    dtApplySearch(dtLinks.column(`${key}:name`), val)
  })

  dtLinks.on("click", "td:nth-child(1), td:nth-child(2)", function () {
    let columnName = $(dtLinks.column(this).header()).text().toLowerCase()
    let columnCellVal = dtLinks.cell(this).data()
    newUrl(columnName, columnCellVal)
  })

  dtUpdateSearch(dtLinks)
}