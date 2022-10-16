document.addEventListener('DOMContentLoaded', function(){
    fetch('http://localhost:5000/getAll')
    .then(response => response.json())
    .then(data => loadHTMLTable(data['data']) );
});

function loadHTMLTable(data){
    // console.log(data);
    const table = document.querySelector('table tbody');
    let tableHtml = "";
    if(data.length === 0){
        // console.log(table);
        table.innerHTML = "<tr><td class='no-data' colspan='5'>No Data</td></tr>";
        return;
    }

    data.forEach(({id,name,date},index) => {
        tableHtml += "<tr class='item'>";
        tableHtml += `<td class="key">${index+1}</td>`;
        tableHtml += `<td>${name}</td>`;
        tableHtml += `<td>${new Date(date).toLocaleString()}</td>`;
        tableHtml += `<td><button class="delete-row-btn" data-id="${id}" >Delete</button></td>`;
        tableHtml += `<td><button class="edit-row-btn" data-id="${id}" >Edit</button></td>`;
        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
}

const addBtn = document.querySelector("#add-name-btn");
addBtn.onclick = saveNewName;

const nameInput = document.querySelector("#name-input");
nameInput.addEventListener('keypress', saveNewName);

function saveNewName(event) {
    if(event.key && event.key != "Enter"){
        return ;
    }
    const name = nameInput.value;
    nameInput.value = "";

    if(!name){
        alert("Enter a name first");
        console.trace();
        return;
    }

    fetch('http://localhost:5000/insert', {
        headers: {
            'Content-type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({name:name})
    })
    .then(response => response.json())
    .then(data => insertRowIntoTable(data['data']));
}

function insertRowIntoTable(data) {
    const table = document.querySelector('table tbody');
    const hasTableData = table.querySelector('.no-data');

    let tableHtml = "";

    if(data){
        const index = document.querySelectorAll('table tbody tr.item').length;
        const {id,name,date} = data;

        tableHtml += `<td>${index + 1 }</td>`;
        tableHtml += `<td>${name}</td>`;
        tableHtml += `<td>${new Date(date).toLocaleString()}</td>`;
        tableHtml += `<td><button class="delete-row-btn" data-id="${id}">Delete</button></td>`;
        tableHtml += `<td><button class="edit-row-btn" data-id="${id}">Edit</button></td>`;
    
        if(hasTableData){
            table.innerHTML = innerHTML;
        } else {
            const newRow = table.insertRow();
            newRow.innerHTML = tableHtml;
        }
    }
}

document.querySelector('table tbody').addEventListener('click', function(event) {
    if(event.target.className === "delete-row-btn"){
        const response = deleteRowById(event.target.dataset.id);
        // console.log('==============', response);
        response.then(data => console.log('my data', data))
        response.then(data => {
            // console.log('data', data);
            if(data.success){
                const rowItem = event.target.closest('.item');
                let next = rowItem.nextElementSibling;
                while (next){
                    let element = next.querySelector('.key');
                    element.innerHTML = parseInt(element.innerHTML,10) - 1;
                    next = next.nextElementSibling;
                }
                rowItem.remove();
            }
        });
    }
});

async function deleteRowById(id){
    return await fetch('http://localhost:5000/delete/' + id, {
        method:'DELETE'
    })
    .then(response => response.json())
    .then(data => {return data;});

    // return response;
}
