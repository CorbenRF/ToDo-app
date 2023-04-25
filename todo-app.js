(function() {
  window.savedState = [];
  let listArr = []

  function createAppTitle(title) {
    let appTitle = document.createElement('h2');
    appTitle.innerHTML = title;
    return appTitle;
  }

  function createTodoItemForm() {
    let form = document.createElement('form');
    let input = document.createElement('input');
    let buttonWrapper = document.createElement('div');
    let button = document.createElement('button');

    form.classList.add('input-group', 'mb-3');
    input.classList.add('form-control');
    input.placeholder = 'Введите значение нового дела';
    buttonWrapper.classList.add('input-group-apppend');
    button.classList.add('btn', 'btn-primary', 'ml-1');
    button.textContent = 'Добавить дело';

    buttonWrapper.append(button);
    form.append(input);
    form.append(buttonWrapper);

    return {
      form,
      input,
      button,
    };

  }

  function createTodoList() {
    let list = document.createElement('ul');
    list.classList.add('list-group');
    return list;
  }

  function createTodoItem(obj, title = '') {
    let item = document.createElement('li');
    let buttonGroup = document.createElement('div');
    let doneButton = document.createElement('button');
    let deleteButton = document.createElement('button');
    let text = obj.name;
    let state = obj.done;
    let id = obj.id;

    item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
    item.textContent = obj.name;

    buttonGroup.classList.add('btn-group', 'btn-group-sm');
    doneButton.classList.add('btn', 'btn-success');
    doneButton.textContent = 'Готово';
    deleteButton.classList.add('btn', 'btn-danger');
    deleteButton.textContent = 'Удалить';

    if (obj.done){
      item.classList.add('list-group-item-success');
      listArr.find(((val)=>val.id === obj.id)).done = state;
      localStorage.setItem(title, JSON.stringify(listArr));
    }


    doneButton.addEventListener('click', function(){
      state = !obj.done
    item.classList.toggle('list-group-item-success', state);
    listArr.find(((val)=>val.id === obj.id)).done = state;

    fetch(`http://localhost:3000/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({done: state}),
      headers: {
        'Content-Type': 'application/json',
      }
    })

    localStorage.setItem(title, JSON.stringify(listArr));
    });

    deleteButton.addEventListener('click', function() {
      if (confirm('Вы уверены?')) {
        for (let i=0; i<listArr.length; i++){
          if(listArr[i].id==obj.id){
            console.log('Element to delete', listArr[i]);
            listArr.splice(i,1);
            console.log('After delete:', listArr);
            break;
          }
        }
        localStorage.setItem(title, JSON.stringify(listArr));
        console.log(listArr);
       item.remove();
       fetch(`http://localhost:3000/api/todos/${id}`, {
      method: 'DELETE',
    })
      }
    });



    buttonGroup.append(doneButton);
    buttonGroup.append(deleteButton);
    item.append(buttonGroup);

    return {
      item,
      doneButton,
      deleteButton,
      text,
      state,
      id,
    }
  };

  function getNewId(arr){
    let max = 0;
    for(let i=0; i<arr.length; i++){
      if (arr[i].id>max){
        max = arr[i].id
      }
    }
    return max +1
  }

  async function createTodoApp(container, title = 'Список дел', listDone = []) {

    let todoAppTitle = createAppTitle(title);
    let todoItemForm = createTodoItemForm();
    let todoList = createTodoList();

    // let todoItems = [createTodoItem('Сходить за хлебом'), createTodoItem('Купить молоко')];
    // let button = document.querySelector('button');

    //button disabled upon loading page
    todoItemForm.button.disabled = true;
    console.log('Loading database from server:', listDone)
    if(listDone !== []){
      for(let q of listDone){
        if(q.owner === title){
          let newItem = {
            // id:getNewId(listArr),
            id: q.id,
            name: q.name,
            done: q.done,
            owner: title,
          }
          listArr.push(newItem)
          let todoItemElement = createTodoItem(newItem, newItem.owner);
      todoList.append(todoItemElement.item);
      console.log(listArr);
        }

    }
    localStorage.setItem(title, JSON.stringify(listArr));
  }


      container.append(todoAppTitle);
    container.append(todoItemForm.form);
      container.append(todoList);

    // todoList.append(todoItems[0].item);
    // todoList.append(todoItems[1].item);


    todoItemForm.form.addEventListener('submit', async function(e) {
      //Prevents standard browser behavior - page reload upon form submission
      e.preventDefault();

      // Ignoring creating empty item

      if (!todoItemForm.input.value) {
        return;
      }

      const response = await fetch('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify({
          // id:getNewId(listArr),
          name: todoItemForm.input.value.trim(),
          owner: title,
          done: false,
        }),
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const todoItem = await response.json()

      let newItem = {
        id:getNewId(listArr),
        name: todoItemForm.input.value,
        done: false
      }
      listArr.push(newItem);
      localStorage.setItem(title, JSON.stringify(listArr));
      let todoItemElement = createTodoItem(todoItem, todoItem.owner);
    todoList.append(todoItemElement.item);


    //resetting input field so we dont have to erase it manually
    todoItemForm.input.value = '';
    todoItemForm.button.disabled=true;

      // savedState.push({name: todoItem.text, done: todoItem.state});
      // console.log('Before saving', savedState)
      localStorage.setItem(title, JSON.stringify(listArr));
    });

  }

window.createTodoApp = createTodoApp;

})();
