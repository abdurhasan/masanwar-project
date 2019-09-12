// const userData = JSON.parse(localStorage.getItem('user'));
const BASE_URL = 'http://localhost:1337';
const token = localStorage.getItem('token');
const Authorization = { headers: { 'Authorization': "bearer " + token } };

let data = new Array;
let Employeedoc = new Array;
let EmployeeIndex;

$(".dropdown-menu").on("click", "a", function (e) {
  e.preventDefault();
  const $this = $(this);
  const display = $this.parents().eq(1).siblings('button');
  display.text($this.text());

  display.val($this.data("id"));

});

$("#employee_form").on("click", "a", function (e) {
  e.preventDefault();
  const $this = $(this);
  const $text = $this.text();
  const $id = $this.data("id");  
  const display = $(`#employee-${EmployeeIndex}`);
  
  display.text($text);
  display.val($id);
  Employeedoc = Employeedoc.filter(el=>el.id !== $id);
  EmployeeIndex = EmployeeIndex -1 ;
  renderEmployee()
});

const renderEmployee = () => {
  if(Employeedoc.length < 1) {
    return $('#employee_form > .row > ul').remove()
  };
  $('#employee_form > .row ').append(`
  <button name="employee-${EmployeeIndex}" id="employee-${EmployeeIndex}" style="background-color: white !important; color: grey" class="col-md-2 btn btn-primary dropdown-toggle" type="button"  id="employee" data-toggle="dropdown" > 
  Employees <span class="caret"></span> </button> 
   <ul class="dropdown-menu"></ul>`);

  $('#employee_form > .row > ul > li').remove();

  $.each(Employeedoc, (i, value) => {
    $('#employee_form > .row > ul').append(`<li><a href="#" data-id="${value.id}">${value.name}</a></li>`);
  });


}



$("form").submit(async e => {
  e.preventDefault();
  const invNo = await axios.get(BASE_URL + '/inventories/count', Authorization).then(s => s.data)
  const Target = e.target
  let stateData = {
    inventory_number: invNo + 1
  }

  let employeeDoc = new Array;

  for (let i = 0; i < Target.length - 1; i++) {
    const currentValue = Target[i].value;
    const fixValue = isNaN(Target[i].value) ? Target[i].value : Number(currentValue);

    if(Target[i].name.includes('employee')){      
      if(Target[i].value)employeeDoc.push(Target[i].value)      
    }else{
      stateData[Target[i].name] = fixValue;
    }

    
  }

  stateData['employees'] = employeeDoc;


  axios.post(BASE_URL+'/inventories',stateData,Authorization)    
    .then(snap=>{
        // console.log(snap)
      // appendToUsrTable(snap.data)
      // flashMessage(true,'Data berhasil ditambahkan')
    })
    // .catch(_=>flashMessage(false,'Gagal menambahkan data , cek kembali inputan anda'))
    

});




axios.get(BASE_URL + '/employees', Authorization)
  .then(snap => {
    Employeedoc.push(...snap.data)
    EmployeeIndex = snap.data.length;
    renderEmployee()
  })




axios.get(BASE_URL + '/inventorygroups', Authorization)
  .then(snap => {
    $.each(snap.data, (index, value) => {
      $('#inventorygroup_form > ul ').append(`<li><a href="#" data-id="${value.id}">${value.name}</a></li>`);
    });
  })

axios.get(BASE_URL + '/divisions', Authorization)
  .then(snap => {
    $.each(snap.data, (index, value) => {
      $('#division_form > ul ').append(`<li><a href="#" data-id="${value.id}">${value.name}</a></li>`);
    });
  })
axios.get(BASE_URL + '/locations', Authorization)
  .then(snap => {
    $.each(snap.data, (index, value) => {
      $('#location_form > ul ').append(`<li><a href="#" data-id="${value.id}">${value.name}</a></li>`);
    });
  })
axios.get(BASE_URL + '/brands', Authorization)
  .then(snap => {
    $.each(snap.data, (index, value) => {
      $('#brand_form > ul ').append(`<li><a href="#" data-id="${value.id}">${value.name}</a></li>`);
    });
  })
axios.get(BASE_URL + '/branches', Authorization)
  .then(snap => {
    $.each(snap.data, (index, value) => {

      $('#branch_form > ul ').append(`<li><a href="#" data-id="${value.id}">${value.name}</a></li>`);
    });
  })


axios.get(BASE_URL + '/suppliers', Authorization)
  .then(snap => {

    $.each(snap.data, (index, value) => {

      $('#supplier_form > ul ').append(`<li><a href="#" data-id="${value.id}">${value.name}</a></li>`);
    });


  })

axios.get(BASE_URL + '/inventories', Authorization)
  .then(snap => {
    data.push(...snap.data)
    renderPage()
  })


const renderPage = _ => {
  $.each(data, (i, inv) => {
    appendToUsrTable(i, inv);
  });
}




function appendToUsrTable(i, snap) {
  let invno = ''  
  if(snap.inventorygroup.nomor) {invno += `${snap.inventorygroup.nomor}/`}else invno += '--/'
  if(snap.branch) {invno += `${snap.branch.code}/`}else invno += '--/'
  invno += snap.inventory_number
        
  $("#userTable > tbody:last-child").append(`
          <tr>
              <td  name="inventory_number">${invno}</td>
              '<td  name="name">${snap.name}</td>
              '<td  name="qty">${snap.qty}</td>              
              '<td  name="status">${snap.status}</td>
              '<td  name="condition">${snap.condition}</td>              
              '<td  name="location">${snap.location.name}</td>
              '<td align="center">
              <button class="btn btn-success form-control" id="${snap.id}" onClick="editInventory(this)" data-toggle="modal" data-target="#myModal")">EDIT</button>
              </td>              
          </tr>
      `);
}





function flashMessage(status,msg) {
  $(".flashMsg").remove();
  if(status){
    $("#head").prepend(`
          <div class="col-sm-12"><div class="flashMsg alert alert-success alert-dismissible fade in" role="alert"> <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true" class="glyphicon glyphicon-remove"></span></button> <strong>${msg}</strong></div></div>
      `);
  }else{
    $("#head").prepend(`
          <div class="col-sm-12"><div class="flashMsg alert alert-danger alert-dismissible fade in" role="alert"> <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button> <strong>${msg}</strong></div></div>
      `); 
  }
}


function editInventory(el) {
  const invID = el.id;
  const localdata = data.filter(jq => jq.id == invID)[0]
  $(".modal-body").empty().append(`
  <form id="updateUser" action="">      
      
      <label for="name">Name</label>
      <input class="form-control" type="text" name="name" value="${localdata.name}"/>

      <label for="qty">QTY</label>
      <input class="form-control" type="number" name="qty" value="${localdata.qty}"/>
      
      <label for="status">Status</label>
      <input class="form-control" type="text" name="status" value="${localdata.status}"/>

      <label for="condition">Condition</label>
      <input class="form-control" type="text" name="condition" value="${localdata.condition}"/>

      <label for="location">Location</label>
      <input class="form-control" type="text" name="location" value="${localdata.location.name}"/>


  </form>
`);


  $(".modal-footer").empty().append(`
                <form>
                    <button type="button" type="submit" class="btn btn-primary" onClick="updateUser()">Save changes</button>
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                </form>
            `);

}




// function updateUser(id) {
//   let msg = "User updated successfully!";
//   let user = {};
//   user.id = id;
//   data.forEach(function (user, i) {
//     if (user.id == id) {
//       $("#updateUser").children("input").each(function () {
//         let value = $(this).val();
//         let attr = $(this).attr("name");
//         if (attr == "name") {
//           user.name = value;
//         } else if (attr == "address") {
//           user.address = value;
//         } else if (attr == "age") {
//           user.age = value;
//         }
//       });
//       data.splice(i, 1);
//       data.splice(user.id - 1, 0, user);
//       $("#userTable #user-" + user.id).children(".userData").each(function () {
//         let attr = $(this).attr("name");
//         if (attr == "name") {
//           $(this).text(user.name);
//         } else if (attr == "address") {
//           $(this).text(user.address);
//         } else {
//           $(this).text(user.age);
//         }
//       });
//       $(".modal").modal("toggle");
//       flashMessage(msg);
//     }
//   });
// }














// function deleteUser(id) {
//   let action = confirm("Are you sure you want to delete this user?");
//   let msg = "User deleted successfully!";
//   data.forEach(function (user, i) {
//     if (user.id == id && action != false) {
//       data.splice(i, 1);
//       $("#userTable #user-" + user.id).remove();
//       flashMessage(msg);
//     }
//   });
// }