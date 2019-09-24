const BASE_URL = 'http://localhost:1337';
const token = localStorage.getItem('token');
if (!token) document.location.href = 'index.html';
axios.defaults.headers.common.Authorization = "bearer " + token;
let data = new Array;
let Employeedoc = new Array;
let EmployeeIndex;
let Locationdoc = new Array;
$(".dropdown-menu").on("click", "a", function (e) {
	e.preventDefault();
	const $this = $(this);
	const display = $this.parents().eq(1).siblings('button');
	display.text($this.text());
	display.val($this.data("id"))
});

function renderPage() {
	$("#userTable > tbody").empty()
	return $.each(data, (i, inv) => {
		appendToUsrTable(i, inv)
	})
}
$("#employee_form").on("click", "a", function (e) {
	e.preventDefault();
	const $this = $(this);
	const $text = $this.text();
	const $id = $this.data("id");
	const display = $(`#employee-${EmployeeIndex}`);
	display.text($text);
	display.val($id);
	Employeedoc = Employeedoc.filter(el => el.id !== $id);
	EmployeeIndex = EmployeeIndex - 1;
	renderEmployee()
});
const renderEmployee = () => {
	if (Employeedoc.length < 1) {
		return $('#employee_form > .row > ul').remove()
	};
	$('#employee_form > .row ').append(`
  <button name="employee-${EmployeeIndex}" id="employee-${EmployeeIndex}" style="background-color: white !important; color: grey" class="col-md-2 btn btn-primary dropdown-toggle" type="button"  data-toggle="dropdown" > 
  Employees <span class="caret"></span> </button> 
   <ul class="dropdown-menu"></ul>`);
	$('#employee_form > .row > ul > li').remove();
	$.each(Employeedoc, (i, value) => {
		$('#employee_form > .row > ul').append(`<li><a href="#" data-id="${value.id}">${value.name}</a></li>`)
	})
}
axios.get(BASE_URL + '/employees').then(snap => {
	Employeedoc.push(...snap.data)
	EmployeeIndex = snap.data.length;
	renderEmployee()
})
axios.get(BASE_URL + '/inventorygroups').then(snap => {
	$.each(snap.data, (index, value) => {
		$('#inventorygroup_form > ul ').append(`<li><a href="#" data-id="${value.id}">${value.name}</a></li>`)
	})
})
axios.get(BASE_URL + '/divisions').then(snap => {
	$.each(snap.data, (index, value) => {
		$('#division_form > ul ').append(`<li><a href="#" data-id="${value.id}">${value.name}</a></li>`)
	})
})
axios.get(BASE_URL + '/locations').then(snap => {
	Locationdoc.push(...snap.data)
	$.each(snap.data, (index, value) => {
		$('#location_form > ul ').append(`<li><a href="#" data-id="${value.id}">${value.name}</a></li>`)
	})
})
axios.get(BASE_URL + '/brands').then(snap => {
	$.each(snap.data, (index, value) => {
		$('#brand_form > ul ').append(`<li><a href="#" data-id="${value.id}">${value.name}</a></li>`)
	})
})
axios.get(BASE_URL + '/branches').then(snap => {
	$.each(snap.data, (index, value) => {
		$('#branch_form > ul ').append(`<li><a href="#" data-id="${value.id}">${value.name}</a></li>`)
	})
})
axios.get(BASE_URL + '/suppliers').then(snap => {
	$.each(snap.data, (index, value) => {
		$('#supplier_form > ul ').append(`<li><a href="#" data-id="${value.id}">${value.name}</a></li>`)
	})
})
axios.get(BASE_URL + '/inventories').then(snap => {
	data.push(...snap.data)
	renderPage()
})

function appendToUsrTable(i, snap) {
	let invno = ''
	let locationname = ''
	if (snap.inventorygroup) {
		invno += `${snap.inventorygroup.nomor}/`
	} else invno += '--/'
	if (snap.branch) {
		invno += `${snap.branch.code}/`
	} else invno += '--/'
	if (snap.location) locationname = snap.location.name
	invno += snap.inventory_number
	$("#userTable > tbody:last-child").append(`
          <tr>
              <td  name="inventory_number">${invno}</td>
              <td  name="name">${snap.name}</td>
              <td  name="qty">${snap.qty}</td>              
              <td  name="status">${snap.status}</td>
              <td  name="condition">${snap.condition}</td>              
              <td  name="location">${locationname}</td>
              <td align="center">
              <button class="btn btn-success form-control" id="${snap.id}" onClick="editInventory(this)" data-toggle="modal" data-target="#myModal")">EDIT</button>
              </td>              
          </tr>
      `)
}

function flashMessage(status, msg) {
	$(".flashMsg").remove();
	if (status) {
		$("#head").prepend(`
          <div id="msg" class="col-sm-12"><div class="flashMsg alert alert-success alert-dismissible fade in" role="alert"> <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true" class="glyphicon glyphicon-remove"></span></button> <strong>${msg}</strong></div></div>
      `);
		setTimeout(_ => $("#msg").remove(), 1500)
	} else {
		$("#head").prepend(`
          <div id="msg" class="col-sm-12"><div class="flashMsg alert alert-danger alert-dismissible fade in" role="alert"> <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button> <strong>${msg}</strong></div></div>
      `);
		setTimeout(_ => $("#msg").remove(), 1500)
	}
}

function editInventory(el) {
	const invID = el.id;
	let Index;
	let localdata;
	data.map((jq, index) => {
		if (jq.id == invID) {
			localdata = jq
			Index = index
		}
	})[0]
	$(".modal-body").empty().append(`
  <form id="form-${invID}">      
      
      <label for="name">Name</label>
      <input class="form-control" type="text" name="name" value="${localdata.name}"/>

      <label for="qty">QTY</label>
      <input class="form-control" type="number" name="qty" value="${localdata.qty}"/>
      
      <label for="status">Status</label>
      <input class="form-control" onchange="elEnum(this,'status')" type="text" value="${localdata.status}"/>

      <label for="condition">Condition</label>
      <input class="form-control" type="text" name="condition" value="${localdata.condition}"/>
            
      <label for="locationedit-${invID}">Location</label>
      <div class="form-group dropdown" id="locationedit">
      <button style="text-indent:-50%;background-color: white !important; color: grey"
          class="form-control btn btn-primary  dropdown-toggle" type="button" name="location"
          data-toggle="dropdown" id="locationedit-${invID}"
          value="${localdata.location.id}"
          >
          ${localdata.location.name}
          <span class="caret"></span>
      </button>
      <ul class="dropdown-menu">
      ${Locationdoc.map(snap => {
    return ` < li > < a href = "#"
		onclick = "Memantapkan(this)"
		data - parent = "${invID}"
		data - id = "${snap.id}" > ` + snap.name + '</a></li>'
  })}            
      </ul>
  </div>


  </form>
`);
	$(".modal-footer").empty().append(`
        <form>
            <button type="button" type="submit" class="btn btn-primary" data-index="${Index}" onClick="updateUser(this)" data-id="${invID}">Save changes</button>
            <button type="button" class="btn btn-default" data-dismiss="modal" id="closeedit">Close</button>
        </form>
    `)
}

function updateUser(el) {
	const Target = $(el).data("id");
	const Index = $(el).data("index");
	const Datums = $(`#form-${Target}`)['0']
	let stateData = new Object;
	for (let el of Datums) {
		stateData[el.name] = el.value
	}
	axios.put(`${BASE_URL}/inventories/${Target}`, stateData).then(snap => {
		flashMessage(!0, "data berhasil diupdate")
		$('#closeedit').trigger("click")
		data[Index] = snap.data
		renderPage()
	}).catch(snap => {
		flashMessage(!1, "data gagal diupdate, cek koneksi internet anda")
		$('#closeedit').trigger("click")
	})
}
$("#mainForm").submit(async e => {
	e.preventDefault();
	const invNo = await axios.get(BASE_URL + '/inventories/count').then(s => s.data)
	const Target = e.target
	let stateData = {
		inventory_number: invNo + 1
	}
	let employeeDoc = new Array;
	for (let i = 0; i < Target.length - 1; i++) {
		const currentValue = Target[i].value;
		const fixValue = isNaN(Target[i].value) ? Target[i].value : Number(currentValue);
		if (Target[i].name.includes('employee')) {
			if (Target[i].value) employeeDoc.push(Target[i].value)
		} else {
			stateData[Target[i].name] = fixValue
		}
	}
	stateData.employees = employeeDoc;
	axios.post(BASE_URL + '/inventories', stateData).then(res => {
		flashMessage(!0, "data berhasil disubmit")
		$('#mainForm').find('input').val('');
		appendToUsrTable(null, res.data)
	})
});

function
Memantapkan(el) {
	const thisTxt = $(el).text();
	const thisId = $(el).data("id");
	const parent = $(el).data("parent");
	const display = $(`#locationedit-${parent}`);
	display.text(thisTxt)
	display.val(thisId)
}

function elEnum(el, type) {
	const currentValue = $(el).val().toLowerCase()
	if (type == 'status') {
		if (currentValue !== 'buy' && currentValue !== 'grant') {
			alert('Status hanya : buy atau grant')
			$(el).val('')
		}
	} else {
		if (currentValue !== 'good' && currentValue !== 'bad') {
			alert('Condition hanya : good atau bad')
			$(el).val('')
		}
	}
}
$('#logout').click(e => {
	localStorage.setItem('token', '');
	document.location.href = 'index.html';
})
