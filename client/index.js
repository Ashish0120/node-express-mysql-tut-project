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
        tableHtml += `<td><span class="item-text">${name}</span><input class="edit-input hide" type="text" value="${name}"></td>`;
        tableHtml += `<td>${new Date(date).toLocaleString()}</td>`;
        tableHtml += `<td><button class="delete-row-btn" data-id="${id}" >Delete</button></td>`;
        tableHtml += `<td class="edit-btn-td"><button class="edit-row-btn" data-id="${id}">Edit</button><button class="js-cancel hide">Cancel</button></td>`;
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

        tableHtml += `<td>${index+1}</td>`;
        tableHtml += `<td><span class="item-text">${name}</span><input class="edit-input hide" type="text" value="${name}"></td>`;
        tableHtml += `<td>${new Date(date).toLocaleString()}</td>`;
        tableHtml += `<td><button class="delete-row-btn" data-id="${id}">Delete</button></td>`;
        tableHtml += `<td class="edit-btn-td"><button class="edit-row-btn" data-id="${id}">Edit</button><button class="js-cancel hide">Cancel</button></td>`;
    
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
        // response.then(data => console.log('my data', data))
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
    } else if((event.target.classList.contains("edit-row-btn") && !event.target.classList.contains("js-save"))){
        const rowItem = event.target.closest('.item');
        let openEdit = (rowItem.closest('#table-body')).querySelector(".edit-row-btn.save");
        // console.log('openEdit',openEdit);
        if(openEdit){
            (openEdit.closest('td')).querySelector('.js-cancel').click();
        }
        let show = toggleEditSave(event.target);
        toggleEditInput(rowItem, show);
    } else if(event.target.classList.contains('js-cancel')) {
        const rowItem = event.target.closest('.item');
        let show = toggleEditSave(rowItem.querySelector('.edit-row-btn'));
        // const rowItem = event.target.closest('.item');
        toggleEditInput(rowItem, show);
    } else if (event.target.contains('js-save')){
        const response = editRowById(event.target.dataset.id);
        // console.log('==============', response);
        // response.then(data => console.log('my data', data))
        response.then(data => {
            // console.log('data', data);
            if(data.success){
                const rowItem = event.target.closest('.item');
                // let next = rowItem.nextElementSibling;
                // while (next){
                //     let element = next.querySelector('.key');
                //     element.innerHTML = parseInt(element.innerHTML,10) - 1;
                //     next = next.nextElementSibling;
                // }
                // rowItem.remove();
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

    // return response; testing 
}

async function editRowById(id){
    return await fetch('http://localhost:5000/delete/' + id, {
        method:'PUT'
    })
    .then(response => response.json())
    .then(data => {return data;});

    // return response;
}

function toggleEditInput(tr, show){
    if(show){
        tr.querySelector('.item-text').classList.add('hide');
        tr.querySelector('.edit-input').classList.remove('hide');
    } else {
        tr.querySelector('.item-text').classList.remove('hide');
        tr.querySelector('.edit-input').classList.add('hide');
    }
    toggleEditCancel(tr, show);
}

function toggleEditCancel(tr, show){
    // console.log(tr);
    // console.log(tr.querySelector('.js-cancel'));
    if(show){
        tr.querySelector('.js-cancel').classList.remove('hide');
    } else {
        tr.querySelector('.js-cancel').classList.add('hide');
    }
}

function clearEditInput(tr){
    tr.querySelector('.edit-input').value = "";
}

function toggleEditSave(element){
    if(element.classList.contains('save')){
        element.classList.remove('save');
        element.innerHTML = 'Edit';
        return false;
    } else {
        element.classList.add('save');
        element.innerHTML = 'Save';
        return true;
    }
}
