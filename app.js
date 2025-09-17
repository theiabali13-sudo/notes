const NotesObj = new Notes();
NotesObj.connect();
notesArea = document.getElementById("notes");
//   .then((db) => {
//     console.log("اتصلنا بنجاح ✅", db);
//   })
//   .catch((err) => {
//     console.error("فشل الاتصال ❌", err);
//   });
window.onload = getAllNotes;
reverseBtn.onclick = reverseOrder;
clearAllBtn.onclick = clearAllNotes;

async function clearAllNotes() {
  if (confirm("Are you shor")) {
    let request = await NotesObj.clear();
    request.onsuccess = () => {
      notesArea.innerHTML = "";
    };
  } else {
    return false;
  }
}
async function reverseOrder() {
  NotesObj.reverseOrder = !NotesObj.reverseOrder;
  getAllNotes();
}

document.addEventListener("submit", async (e) => {
  e.preventDefault();
  let form = e.target;
  if (form.classList.contains("add-note")) {
    addNote(form);
  } else if (form.classList.contains("update-note")) {
    let note = {
      id: parseInt(form.dataset.id),
      text: form.querySelector("textarea").value,
    };
    await updateNote(note);
  } else if (form.classList.contains("clearAll")) {
    clearAll();
  }
});

// async function updateNote(target) {
//   let updateRequest = await NotesObj.update(note);
//   updateRequest.onsuccess = getAllNotes;
// }
async function updateNote(note) {
  await NotesObj.update(note);
  getAllNotes();
}

async function addNote(target) {
  let textarea = target.querySelector("textarea");
  let newNote = textarea.value;
  await NotesObj.add({ text: newNote }); // يكفي await
  textarea.value = "";
  getAllNotes(); // تحديث القائمة
}

document.addEventListener("click", (e) => {
  let { target } = e;
  if (target && target.classList.contains("delete")) {
    let noteId = Number(target.dataset.id);
    deleteNote(noteId);
  } else if (target && target.classList.contains("edit")) {
    editNote(target);
  }
});
// document.addEventListener("click", (e) => {
//   let { target } = e;
//   if (target && target.classList.contains("delete")) {
//     let noteId = Number(target.dataset.id);
//     deleteNote(noteId);
//   }
// });

async function deleteNote(noteId) {
  await NotesObj.delete(noteId);
  getAllNotes(); // تحديث بعد الحذف
}
function editNote(note) {
  let noteContainer = document.getElementById("note-" + note.dataset.id);
  let oldText = noteContainer.querySelector(".text").innerText;
  let form = `<form class="update-note" data-id ="${note.dataset.id}">
  <textarea>${oldText}</textarea>
  <button class="btn" type="submit">تحديث</button>
</form>`;

  noteContainer.innerHTML = form;
}

async function getAllNotes() {
  let request = await NotesObj.all();
  let notesArray = [];

  request.onsuccess = (event) => {
    let cursor = event.target.result;
    if (cursor) {
      notesArray.push(cursor.value); // خزّن الملاحظة
      cursor.continue();
    } else {
      // خلصنا من الكيرسور
      notesArea.innerHTML = ""; // تفريغ قبل العرض
      displayNotes(notesArray);
    }
  };

  request.onerror = () => {
    console.error("فشل في قراءة البيانات");
  };
}

// async function getAllNotes() {
//   let request = await NotesObj.all();

//   request.onsuccess = () => {
//     let cursor = request.result;
//     if (cursor) {
//       console.log(cursor.value);
//       cursor.continue();
//     } else {
//       console.log("Done");
//     }
//   };

//   request.onerror = () => {
//     console.error("فشل في قراءة البيانات");
//   };
// }

function displayNotes(notes) {
  let ULElement = document.createElement("ul");
  for (let i = 0; i < notes.length; i++) {
    let LIElement = document.createElement("li");
    let note = notes[i];
    LIElement.className = "note";
    LIElement.id = "note-" + note.id;
    LIElement.innerHTML = `
      <div>
        <img src="imgs/edit.png" alt="" class="edit" data-id="${note.id}">
        <img src="imgs/delete.png" alt="" class="delete" data-id="${note.id}">
      </div>
      <div class="text">${note.text}</div>
    `;
    ULElement.append(LIElement);
  }
  notesArea.innerHTML = "";
  notesArea.append(ULElement);
}

async function clearAll() {
  await NotesObj.clear();
  getAllNotes();
}
// deleteNote(20);
// updateNote({ id: 30, text: "hi " });
// addNote();
// getAllNotes();
// clearAll();
