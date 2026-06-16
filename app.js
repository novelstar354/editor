/* =====================================================
   WEB IDE
   APP.JS
   STEP 3-A
   ===================================================== */

let editor;

/* =====================================================
   FILE SYSTEM
   ===================================================== */

const files = [];

let activeFileId = null;

/* =====================================================
   DOM
   ===================================================== */

const tabsEl = document.getElementById("tabs");
const treeEl = document.getElementById("fileTree");

const fileNameEl =
document.getElementById("fileName");

const languageEl =
document.getElementById("language");

const positionEl =
document.getElementById("position");

const charCountEl =
document.getElementById("charCount");

/* =====================================================
   FILE TYPE DETECTION
   ===================================================== */

function detectLanguage(name){

    const ext =
    name.split(".").pop().toLowerCase();

    switch(ext){

        case "html":
            return "html";

        case "css":
            return "css";

        case "js":
            return "javascript";

        case "txt":
        default:
            return "plaintext";
    }
}

/* =====================================================
   FILE OBJECT
   ===================================================== */

function createFile(
    name="untitled.txt",
    content=""
){

    const file = {

        id:
        Date.now() +
        Math.random(),

        name,

        content,

        language:
        detectLanguage(name),

        model:null
    };

    files.push(file);

    createTab(file);

    createTreeItem(file);

    openFile(file.id);

    return file;
}

/* =====================================================
   TABS
   ===================================================== */

function createTab(file){

    const tab =
    document.createElement("div");

    tab.className = "tab";

    tab.dataset.id = file.id;

    tab.innerHTML = `
        <span>${file.name}</span>
        <span class="tab-close">×</span>
    `;

    tab.addEventListener("click",e=>{

        if(
            e.target.classList
            .contains("tab-close")
        ){
            closeTab(file.id);
            return;
        }

        openFile(file.id);
    });

    tabsEl.appendChild(tab);
}

/* =====================================================
   CLOSE TAB
   ===================================================== */

function closeTab(id){

    const index =
    files.findIndex(
        f => f.id === id
    );

    if(index === -1) return;

    const tab =
    tabsEl.querySelector(
        `[data-id="${id}"]`
    );

    if(tab) tab.remove();

    const tree =
    treeEl.querySelector(
        `[data-id="${id}"]`
    );

    if(tree) tree.remove();

    files.splice(index,1);

    if(activeFileId === id){

        if(files.length){

            openFile(
                files[0].id
            );

        }else{

            activeFileId = null;

            editor.setValue("");

            updateStatus();
        }
    }
}

/* =====================================================
   FILE TREE
   ===================================================== */

function createTreeItem(file){

    const li =
    document.createElement("li");

    li.textContent =
    file.name;

    li.dataset.id =
    file.id;

    li.addEventListener("click",()=>{

        openFile(file.id);

    });

    treeEl.appendChild(li);
}

/* =====================================================
   OPEN FILE
   ===================================================== */

function openFile(id){

    const file =
    files.find(
        f => f.id === id
    );

    if(!file) return;

    activeFileId = id;

    if(file.model){

        editor.setModel(
            file.model
        );

    }else{

        file.model =
        monaco.editor.createModel(
            file.content,
            file.language
        );

        editor.setModel(
            file.model
        );
    }

    updateActiveUI();

    updateStatus();
}

/* =====================================================
   ACTIVE UI
   ===================================================== */

function updateActiveUI(){

    document
    .querySelectorAll(".tab")
    .forEach(tab=>{

        tab.classList.remove(
            "active"
        );

        if(
            Number(tab.dataset.id)
            === activeFileId
        ){
            tab.classList.add(
                "active"
            );
        }
    });

    document
    .querySelectorAll("#fileTree li")
    .forEach(item=>{

        item.classList.remove(
            "active"
        );

        if(
            Number(item.dataset.id)
            === activeFileId
        ){
            item.classList.add(
                "active"
            );
        }
    });
}

/* =====================================================
   STATUS BAR
   ===================================================== */

function updateStatus(){

    const file =
    files.find(
        f => f.id === activeFileId
    );

    if(!file){

        fileNameEl.textContent =
        "No File";

        languageEl.textContent =
        "-";

        positionEl.textContent =
        "Ln 1, Col 1";

        charCountEl.textContent =
        "0 chars";

        return;
    }

    const pos =
    editor.getPosition();

    const value =
    editor.getValue();

    fileNameEl.textContent =
    file.name;

    languageEl.textContent =
    file.language;

    positionEl.textContent =
    `Ln ${pos.lineNumber}, Col ${pos.column}`;

    charCountEl.textContent =
    `${value.length} chars`;
}

/* =====================================================
   MONACO INIT
   ===================================================== */

require.config({

    paths:{

        vs:
        "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs"
    }
});

require(
[
    "vs/editor/editor.main"
],

function(){

    editor =
    monaco.editor.create(

        document.getElementById(
            "editor"
        ),

        {

            value:"",

            language:"plaintext",

            theme:"vs-dark",

            automaticLayout:true,

            fontSize:15,

            minimap:{
                enabled:true
            },

            wordWrap:"on",

            smoothScrolling:true
        }
    );

    editor.onDidChangeCursorPosition(
        updateStatus
    );

    editor.onDidChangeModelContent(
        updateStatus
    );

    document
    .getElementById(
        "loadingScreen"
    )
    .style.display =
    "none";

    createFile(
        "untitled.txt",
        ""
    );
});

/* =====================================================
   NEW FILE BUTTON
   ===================================================== */

document
.getElementById(
    "newFileBtn"
)
.addEventListener(
    "click",
    ()=>{

        const name =
        prompt(
            "ファイル名"
        );

        if(!name) return;

        createFile(
            name,
            ""
        );
    }
);
/* =====================================================
   STEP 3-B
   FILE OPEN / SAVE / AUTOSAVE
   ===================================================== */

/* =====================================================
   OPEN FILE
   ===================================================== */

const fileInput =
document.getElementById(
    "fileInput"
);

document
.getElementById(
    "openFileBtn"
)
.addEventListener(
    "click",
    ()=>{
        fileInput.click();
    }
);

fileInput.addEventListener(
    "change",
    async e=>{

        const selected =
        [...e.target.files];

        for(const f of selected){

            const text =
            await f.text();

            createFile(
                f.name,
                text
            );
        }

        fileInput.value = "";
    }
);

/* =====================================================
   SAVE FILE
   ===================================================== */

document
.getElementById(
    "saveFileBtn"
)
.addEventListener(
    "click",
    saveCurrentFile
);

function saveCurrentFile(){

    const file =
    files.find(
        f => f.id === activeFileId
    );

    if(!file) return;

    file.content =
    editor.getValue();

    const blob =
    new Blob(
        [file.content],
        {
            type:"text/plain"
        }
    );

    const url =
    URL.createObjectURL(blob);

    const a =
    document.createElement("a");

    a.href =
    url;

    a.download =
    file.name;

    document.body
    .appendChild(a);

    a.click();

    a.remove();

    URL.revokeObjectURL(
        url
    );
}

/* =====================================================
   CTRL + S
   ===================================================== */

window.addEventListener(
    "keydown",
    e=>{

        if(
            e.ctrlKey &&
            e.key.toLowerCase()
            === "s"
        ){

            e.preventDefault();

            saveCurrentFile();
        }
    }
);

/* =====================================================
   DRAG & DROP
   ===================================================== */

window.addEventListener(
    "dragover",
    e=>{

        e.preventDefault();
    }
);

window.addEventListener(
    "drop",
    async e=>{

        e.preventDefault();

        const dropped =
        [...e.dataTransfer.files];

        for(const file of dropped){

            const text =
            await file.text();

            createFile(
                file.name,
                text
            );
        }
    }
);

/* =====================================================
   AUTOSAVE
   ===================================================== */

const STORAGE_KEY =
"WEB_IDE_FILES";

function saveWorkspace(){

    const data =
    files.map(f=>({

        id:f.id,

        name:f.name,

        language:f.language,

        content:
        f.id === activeFileId
        ? editor.getValue()
        : (
            f.model
            ? f.model.getValue()
            : f.content
        )
    }));

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify({

            activeFileId,

            files:data
        })
    );
}

/* =====================================================
   AUTO SAVE TIMER
   ===================================================== */

setInterval(

    saveWorkspace,

    5000
);

/* =====================================================
   SAVE BEFORE EXIT
   ===================================================== */

window.addEventListener(

    "beforeunload",

    saveWorkspace
);

/* =====================================================
   RESTORE WORKSPACE
   ===================================================== */

function restoreWorkspace(){

    const raw =
    localStorage.getItem(
        STORAGE_KEY
    );

    if(!raw) return false;

    try{

        const workspace =
        JSON.parse(raw);

        files.length = 0;

        tabsEl.innerHTML = "";

        treeEl.innerHTML = "";

        workspace.files
        .forEach(file=>{

            const obj = {

                id:file.id,

                name:file.name,

                content:file.content,

                language:file.language,

                model:null
            };

            files.push(obj);

            createTab(obj);

            createTreeItem(obj);
        });

        if(
            workspace.files.length
        ){

            openFile(

                workspace
                .activeFileId
            );
        }

        return true;

    }catch(err){

        console.error(err);

        return false;
    }
}

/* =====================================================
   PATCH INIT
   ===================================================== */

/*
Step 3-A の

createFile(
    "untitled.txt",
    ""
);

を

↓へ置換
*/

if(
    !restoreWorkspace()
){

    createFile(
        "untitled.txt",
        ""
    );
}

/* =====================================================
   MANUAL SAVE BUTTON
   ===================================================== */

function forceSaveWorkspace(){

    saveWorkspace();

    alert(
        "ワークスペース保存完了"
    );
}

/* =====================================================
   EXTRA SHORTCUT
   ===================================================== */

window.addEventListener(
    "keydown",
    e=>{

        if(
            e.ctrlKey &&
            e.shiftKey &&
            e.key.toLowerCase()
            === "s"
        ){

            e.preventDefault();

            forceSaveWorkspace();
        }
    }
);
/* =====================================================
   STEP 3-C
   SEARCH / REPLACE / UNDO / REDO
   ===================================================== */

const searchModal =
document.getElementById(
    "searchModal"
);

const replaceModal =
document.getElementById(
    "replaceModal"
);

const searchInput =
document.getElementById(
    "searchText"
);

const replaceSearchInput =
document.getElementById(
    "replaceSearch"
);

const replaceWithInput =
document.getElementById(
    "replaceWith"
);

/* =====================================================
   OPEN SEARCH
   ===================================================== */

document
.getElementById(
    "searchBtn"
)
.addEventListener(
    "click",
    openSearch
);

function openSearch(){

    searchModal.classList
    .remove("hidden");

    searchInput.focus();
}

/* =====================================================
   CLOSE SEARCH
   ===================================================== */

document
.getElementById(
    "closeSearchBtn"
)
.addEventListener(
    "click",
    ()=>{

        searchModal
        .classList
        .add("hidden");
    }
);

/* =====================================================
   FIND NEXT
   ===================================================== */

let lastSearchIndex = 0;

document
.getElementById(
    "findNextBtn"
)
.addEventListener(
    "click",
    findNext
);

function findNext(){

    const text =
    searchInput.value;

    if(!text) return;

    const content =
    editor.getValue();

    let index =
    content.indexOf(
        text,
        lastSearchIndex
    );

    if(index === -1){

        lastSearchIndex = 0;

        index =
        content.indexOf(text);

        if(index === -1){

            alert("見つかりません");
            return;
        }
    }

    const model =
    editor.getModel();

    const start =
    model.getPositionAt(
        index
    );

    const end =
    model.getPositionAt(
        index + text.length
    );

    editor.setSelection({

        startLineNumber:
        start.lineNumber,

        startColumn:
        start.column,

        endLineNumber:
        end.lineNumber,

        endColumn:
        end.column
    });

    editor.revealLineInCenter(
        start.lineNumber
    );

    lastSearchIndex =
    index + text.length;

    editor.focus();
}

/* =====================================================
   OPEN REPLACE
   ===================================================== */

document
.getElementById(
    "replaceBtn"
)
.addEventListener(
    "click",
    ()=>{

        replaceModal
        .classList
        .remove("hidden");

        replaceSearchInput
        .focus();
    }
);

/* =====================================================
   CLOSE REPLACE
   ===================================================== */

document
.getElementById(
    "closeReplaceBtn"
)
.addEventListener(
    "click",
    ()=>{

        replaceModal
        .classList
        .add("hidden");
    }
);

/* =====================================================
   REPLACE ALL
   ===================================================== */

document
.getElementById(
    "replaceAllBtn"
)
.addEventListener(
    "click",
    replaceAll
);

function replaceAll(){

    const search =
    replaceSearchInput.value;

    const replace =
    replaceWithInput.value;

    if(!search) return;

    const content =
    editor.getValue();

    const escaped =
    search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );

    const result =
    content.replace(
        new RegExp(
            escaped,
            "g"
        ),
        replace
    );

    editor.setValue(
        result
    );

    alert(
        "全置換完了"
    );
}

/* =====================================================
   UNDO
   ===================================================== */

document
.getElementById(
    "undoBtn"
)
.addEventListener(
    "click",
    ()=>{

        editor.trigger(
            "",
            "undo",
            null
        );
    }
);

/* =====================================================
   REDO
   ===================================================== */

document
.getElementById(
    "redoBtn"
)
.addEventListener(
    "click",
    ()=>{

        editor.trigger(
            "",
            "redo",
            null
        );
    }
);

/* =====================================================
   CTRL + F
   ===================================================== */

window.addEventListener(
    "keydown",
    e=>{

        if(
            e.ctrlKey &&
            e.key.toLowerCase()
            === "f"
        ){

            e.preventDefault();

            openSearch();
        }
    }
);

/* =====================================================
   CTRL + H
   ===================================================== */

window.addEventListener(
    "keydown",
    e=>{

        if(
            e.ctrlKey &&
            e.key.toLowerCase()
            === "h"
        ){

            e.preventDefault();

            replaceModal
            .classList
            .remove("hidden");

            replaceSearchInput
            .focus();
        }
    }
);

/* =====================================================
   ESC CLOSE
   ===================================================== */

window.addEventListener(
    "keydown",
    e=>{

        if(
            e.key === "Escape"
        ){

            searchModal
            .classList
            .add("hidden");

            replaceModal
            .classList
            .add("hidden");
        }
    }
);

/* =====================================================
   ENTER SEARCH
   ===================================================== */

searchInput
.addEventListener(
    "keydown",
    e=>{

        if(
            e.key === "Enter"
        ){

            findNext();
        }
    }
);

/* =====================================================
   ENTER REPLACE
   ===================================================== */

replaceWithInput
.addEventListener(
    "keydown",
    e=>{

        if(
            e.key === "Enter"
        ){

            replaceAll();
        }
    }
);