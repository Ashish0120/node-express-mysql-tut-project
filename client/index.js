document.addEventListener('DOMContentLoaded', function(){
    fetchAllData();
});

function fetchAllData(){
    fetch('http://localhost:5000/getAll')
    .then(response => response.json())
    .then(data => loadHTMLTable(data['data']) );
}

function loadHTMLTable(data){
    const table = document.querySelector('table tbody');
    let tableHtml = "";
    if(data.length === 0){
        table.innerHTML = "<tr><td class='no-data' colspan='5'>No Data</td></tr>";
        return;
    }

    data.forEach(({id,name,date},index) => {
        tableHtml += "<tr class='item'>";
        tableHtml += `<td class="key">${index+1}</td>`;
        tableHtml += `<td><span class="item-text">${name}</span><input class="edit-input hide" type="text" value="${name}" data-value="${name}" data-id="${id}"></td>`;
        tableHtml += `<td>${new Date(date).toLocaleString()}</td>`;
        tableHtml += `<td><button class="delete-row-btn" data-id="${id}" >Delete</button></td>`;
        tableHtml += `<td class="edit-btn-td"><button class="edit-row-btn" data-id="${id}">Edit</button><button class="js-cancel hide">Cancel</button></td>`;
        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
    attachEventsAfterDataLoad();
}

const searchBtn = document.querySelector("#search-btn");
searchBtn.onclick = searchByName;
const searchInput = document.querySelector("#search-input");
searchInput.addEventListener('keypress', searchByName);

function searchByName(event) {
    if(event.key && event.key != "Enter"){
        return ;
    }
    const name = searchInput.value;
    searchInput.value = "";

    if(!name){
        return;
    }

    fetch('http://localhost:5000/get/' + name)
    .then(response => response.json())
    .then(data => {
        loadHTMLTable(data['data']);
        toggleResetButton(true);
    });
}

document.querySelector("#reset-btn").onclick = function(event) {
    fetchAllData();
    toggleResetButton(false);
};

const addBtn = document.querySelector("#add-name-btn");
addBtn.onclick = saveNewName;

const nameInput = document.querySelector("#name-input");
nameInput.addEventListener('keypress', editRowById);

function saveNewName(event) {
    if(event.key && event.key != "Enter"){
        return ;
    }
    const name = nameInput.value;
    nameInput.value = "";

    if(!name){
        alert("Enter a name first");
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
        event.stopPropagation();
        const rowItem = event.target.closest('.item');
        let openEdit = (rowItem.closest('#table-body')).querySelector(".edit-row-btn.js-save");
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
    } else if (event.target.classList.contains('js-save')){
        updateName(event);
    }
});

function updateName(event){
    event.stopPropagation();
    const response = editRowById(event);
    response.then(data => {
        if(data && data.success){
            const rowItem = event.target.closest('.item');
            rowItem.querySelector(".item-text").innerHTML = data.name;
            rowItem.querySelector('.edit-input').dataset.value = data.name;

            toggleEditSave(rowItem.querySelector('.edit-row-btn'), false);
            toggleEditInput(rowItem, false);
        }
    });
}

function attachEventsAfterDataLoad(){
    const editInputs = document.querySelectorAll(".edit-input");
    editInputs.forEach(element => {
        element.addEventListener('keypress', updateName);
    });
}

async function editRowById(event){
    if(event.key && event.key != "Enter"){
        return ;
    }
    
    const id = event.target.dataset.id;
    const rowItem = event.target.closest('.item');
    const name = rowItem.querySelector('.edit-input').value;

    if(!name){
        alert("Enter a name first");
        console.trace();
        return;
    }

    if(!id || !name) return false;

    const response = await fetch('http://localhost:5000/update', {
        headers: {
            'Content-type': 'application/json'
        },
        method:'PATCH',
        body: JSON.stringify({
            id: id,
            name: name
        })
    })
    .then(response => response.json())
    .then(data => {return data;});

    return response;
}

async function deleteRowById(id){
    return await fetch('http://localhost:5000/delete/' + id, {
        method:'DELETE'
    })
    .then(response => response.json())
    .then(data => {return data;});
}

function toggleEditInput(tr, show){
    if(show){
        tr.querySelector('.item-text').classList.add('hide');
        let input = tr.querySelector('.edit-input');
        input.classList.remove('hide');
        input.setSelectionRange(input.value.length,input.value.length);
        input.focus();
    } else {
        tr.querySelector('.item-text').classList.remove('hide');
        tr.querySelector('.edit-input').classList.add('hide');
        tr.querySelector('.edit-row-btn').focus();
    }
    toggleEditCancel(tr, show);
}

function toggleEditCancel(tr, show){
    if(show){
        tr.querySelector('.js-cancel').classList.remove('hide');
    } else {
        tr.querySelector('.js-cancel').classList.add('hide');
        tr.querySelector('.edit-input').value = tr.querySelector('.edit-input').dataset.value;
    }
}

function clearEditInput(tr){
    tr.querySelector('.edit-input').value = "";
}

function toggleEditSave(element, forceClose){
    forceClose = forceClose ?? false;
    if(element.classList.contains('js-save') || forceClose){
        element.classList.remove('js-save');
        element.innerHTML = 'Edit';
        return false;
    } else {
        element.classList.add('js-save');
        element.innerHTML = 'Save';
        return true;
    }
}

function toggleResetButton(show){
    show = show ?? false;
    if(show){
        document.querySelector('#reset-btn').classList.remove('hide');
    } else {
        document.querySelector('#reset-btn').classList.add('hide');
        document.querySelector('#search-input').focus();
    }
}
