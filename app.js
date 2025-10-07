function onLoad() {
    loadFolders();
    loadHomeContent();
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
    console.log('Página carregada às', new Date().toLocaleString());
}

let currentFolder = null;
let editingIndex = null;
let viewingIndex = null;

// Preserva quebras de linha e espaçamentos
function cleanText(text) {
    return text.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
    console.log('Toast exibido:', message);
}

function loadHomeContent() {
    const folders = JSON.parse(localStorage.getItem('folders')) || [];
    const homeContent = document.getElementById('homeContent');
    homeContent.innerHTML = '';

    console.log('Carregando conteúdo com pastas:', folders);
    if (folders.length === 0) {
        homeContent.innerHTML = '<p>Crie sua primeira pasta!</p>';
        return;
    }

    folders.forEach(folder => {
        const poems = JSON.parse(localStorage.getItem(`poems_${folder}`)) || [];
        console.log(`Poemas para ${folder}:`, poems);
        if (poems.length > 0) {
            poems.forEach((poem, index) => {
                const item = document.createElement('div');
                item.className = 'poem-item';
                item.onclick = () => showViewScreen(folder, index);
                item.innerHTML = `
                    <h3>${folder}</h3>
                    <p><strong>${poem.title}</strong><br>${poem.text || 'Sem texto'}</p>
                    <div class="counter-section">
                        <span>Recitações:</span>
                        <span id="count_${folder}_${index}">${poem.count || 0}</span>
                        <button onclick="decrementCount('${folder}', ${index}, event)">-</button>
                        <button onclick="incrementCount('${folder}', ${index}, event)">+</button>
                    </div>
                    <button class="delete-btn" onclick="deletePoem('${folder}', ${index}, event)"><i class="fas fa-trash"></i></button>
                    <button class="edit-btn" onclick="showEditScreen('${folder}', ${index}, event)"><i class="fas fa-edit"></i></button>
                    <button class="view-btn" onclick="highlightPoem('${folder}', ${index}, event)"><i class="fas fa-eye"></i></button>
                    <button class="add-poem-btn" onclick="addPoemToItem('${folder}', event)"><i class="fas fa-plus"></i></button>
                `;
                homeContent.appendChild(item);
            });
        } else {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'poem-item';
            emptyItem.innerHTML = `
                <h3>${folder}</h3>
                <p>Nenhum poema nesta pasta.</p>
                <button class="delete-btn" onclick="deleteFolder('${folder}', event)"><i class="fas fa-trash"></i></button>
                <button class="add-poem-btn" onclick="addPoemToItem('${folder}', event)"><i class="fas fa-plus"></i></button>
            `;
            homeContent.appendChild(emptyItem);
        }
    });
}

function loadFolders() {
    const folders = JSON.parse(localStorage.getItem('folders')) || [];
    const folderList = document.getElementById('folderList');
    folderList.innerHTML = '';

    console.log('Pastas carregadas:', folders);
    folders.forEach(folder => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="folder-name" onclick="viewFolder('${folder}')">${folder}</span>
            <button onclick="deleteFolder('${folder}', event)" aria-label="Excluir ${folder}"><i class="fas fa-trash"></i></button>
        `;
        folderList.appendChild(li);
    });
}

function viewFolder(folder) {
    currentFolder = folder;
    showToast(`Visualizando ${folder}`);
    loadHomeContent();
    closeSidebar();
}

function showCreateScreen() {
    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('createScreen').style.display = 'block';
    closeSidebar();
    document.getElementById('folderName').value = '';
}

function addPoemToItem(folder, event) {
    event.stopPropagation(); // Evita o clique no item
    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('createScreen').style.display = 'block';
    const folderNameInput = document.getElementById('folderName');
    folderNameInput.value = folder; // Pré-preenche a pasta
    folderNameInput.disabled = true; // Impede alteração
    document.getElementById('poemTitle').value = '';
    document.getElementById('poemText').value = '';
    console.log('Tela de criação aberta para adicionar poema à pasta:', folder);
}

function saveFolder(event) {
    event.preventDefault();
    const folderName = document.getElementById('folderName').value.trim();
    const poemTitle = document.getElementById('poemTitle').value.trim();
    let poemText = document.getElementById('poemText').value;
    poemText = cleanText(poemText);

    if (!folderName || !poemTitle || !poemText) {
        showToast('Preencha todos os campos!');
        return;
    }

    let folders = JSON.parse(localStorage.getItem('folders')) || [];
    if (!folders.includes(folderName)) {
        folders.push(folderName);
        localStorage.setItem('folders', JSON.stringify(folders));
        console.log('Nova pasta salva:', folders);
    }

    let poems = JSON.parse(localStorage.getItem(`poems_${folderName}`)) || [];
    const newPoem = { title: poemTitle, text: poemText, count: 0 };
    poems.push(newPoem);
    localStorage.setItem(`poems_${folderName}`, JSON.stringify(poems));
    console.log('Poema salvo na pasta:', folderName, newPoem);

    showToast('Poema adicionado à pasta!');
    document.getElementById('createForm').reset();
    document.getElementById('folderName').disabled = false;
    loadFolders();
    loadHomeContent();
    backToHome();
}

function backToHome() {
    document.getElementById('createScreen').style.display = 'none';
    document.getElementById('editScreen').style.display = 'none';
    document.getElementById('viewScreen').style.display = 'none';
    document.getElementById('homeScreen').style.display = 'block';
    loadHomeContent();
}

function deletePoem(folder, index, event) {
    event.stopPropagation();
    if (confirm('Excluir este poema?')) {
        let poems = JSON.parse(localStorage.getItem(`poems_${folder}`)) || [];
        poems.splice(index, 1);
        localStorage.setItem(`poems_${folder}`, JSON.stringify(poems));
        if (poems.length === 0) {
            localStorage.removeItem(`poems_${folder}`);
        }
        showToast('Poema excluído!');
        loadFolders();
        loadHomeContent();
    }
}

function deleteFolder(folder, event) {
    event.stopPropagation();
    if (confirm(`Excluir "${folder}" e todos os poemas?`)) {
        let folders = JSON.parse(localStorage.getItem('folders')) || [];
        folders = folders.filter(f => f !== folder);
        localStorage.setItem('folders', JSON.stringify(folders));
        localStorage.removeItem(`poems_${folder}`);
        showToast('Pasta excluída!');
        loadFolders();
        loadHomeContent();
    }
}

function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.add('open');
    sidebar.setAttribute('aria-hidden', 'false');
    overlay.classList.add('active');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('active');
}

function incrementCount(folder, index, event) {
    event.stopPropagation();
    let poems = JSON.parse(localStorage.getItem(`poems_${folder}`)) || [];
    if (poems[index]) {
        poems[index].count = (poems[index].count || 0) + 1;
        localStorage.setItem(`poems_${folder}`, JSON.stringify(poems));
        const countElement = document.getElementById(`count_${folder}_${index}`);
        if (countElement) countElement.textContent = poems[index].count;
        console.log(`Contador incrementado para ${folder}[${index}]: ${poems[index].count}`);
    }
    loadHomeContent();
}

function decrementCount(folder, index, event) {
    event.stopPropagation();
    let poems = JSON.parse(localStorage.getItem(`poems_${folder}`)) || [];
    if (poems[index] && poems[index].count > 0) {
        poems[index].count = (poems[index].count || 0) - 1;
        localStorage.setItem(`poems_${folder}`, JSON.stringify(poems));
        const countElement = document.getElementById(`count_${folder}_${index}`);
        if (countElement) countElement.textContent = poems[index].count;
        console.log(`Contador decrementado para ${folder}[${index}]: ${poems[index].count}`);
    }
    loadHomeContent();
}

function showEditScreen(folder, index, event) {
    event.stopPropagation();
    const poems = JSON.parse(localStorage.getItem(`poems_${folder}`)) || [];
    if (poems[index]) {
        editingIndex = { folder, index };
        document.getElementById('editFolderName').value = folder;
        document.getElementById('editPoemTitle').value = poems[index].title;
        document.getElementById('editPoemText').value = poems[index].text;
        document.getElementById('homeScreen').style.display = 'none';
        document.getElementById('editScreen').style.display = 'block';
        closeSidebar();
    }
}

function saveEdit(event) {
    event.preventDefault();
    const folderName = document.getElementById('editFolderName').value.trim();
    const poemTitle = document.getElementById('editPoemTitle').value.trim();
    let poemText = document.getElementById('editPoemText').value;
    poemText = cleanText(poemText);

    if (!folderName || !poemTitle || !poemText) {
        showToast('Preencha todos os campos!');
        return;
    }

    if (editingIndex) {
        let folders = JSON.parse(localStorage.getItem('folders')) || [];
        let oldFolder = editingIndex.folder;
        let poems = JSON.parse(localStorage.getItem(`poems_${oldFolder}`)) || [];
        let poem = poems[editingIndex.index];

        poem.title = poemTitle;
        poem.text = poemText;

        if (oldFolder !== folderName && !folders.includes(folderName)) {
            folders = folders.filter(f => f !== oldFolder);
            folders.push(folderName);
            let newPoems = JSON.parse(localStorage.getItem(`poems_${folderName}`)) || [];
            newPoems.push(poem);
            localStorage.setItem(`poems_${folderName}`, JSON.stringify(newPoems));
            localStorage.removeItem(`poems_${oldFolder}`);
            if (poems.length > 1) {
                poems.splice(editingIndex.index, 1);
                localStorage.setItem(`poems_${oldFolder}`, JSON.stringify(poems));
            } else {
                localStorage.removeItem(`poems_${oldFolder}`);
            }
        } else {
            localStorage.setItem(`poems_${oldFolder}`, JSON.stringify(poems));
        }

        localStorage.setItem('folders', JSON.stringify(folders));
        showToast('Poema editado!');
        document.getElementById('editForm').reset();
        loadFolders();
        loadHomeContent();
        backToHome();
        editingIndex = null;
    }
}

function showViewScreen(folder, index) {
    const poems = JSON.parse(localStorage.getItem(`poems_${folder}`)) || [];
    if (poems[index]) {
        viewingIndex = { folder, index };
        const viewContent = document.getElementById('viewContent');
        viewContent.innerHTML = `
            <h3>${folder}</h3>
            <p><strong>${poems[index].title}</strong><br>${poems[index].text || 'Sem texto'}</p>
            <div class="counter-section">
                <span>Recitações:</span>
                <span id="viewCount_${folder}_${index}">${poems[index].count || 0}</span>
                <button onclick="decrementViewCount('${folder}', ${index})">-</button>
                <button onclick="incrementViewCount('${folder}', ${index})">+</button>
            </div>
        `;
        document.getElementById('homeScreen').style.display = 'none';
        document.getElementById('viewScreen').style.display = 'block';
        closeSidebar();
    }
}

function incrementViewCount(folder, index) {
    let poems = JSON.parse(localStorage.getItem(`poems_${folder}`)) || [];
    if (poems[index]) {
        poems[index].count = (poems[index].count || 0) + 1;
        localStorage.setItem(`poems_${folder}`, JSON.stringify(poems));
        const countElement = document.getElementById(`viewCount_${folder}_${index}`);
        if (countElement) countElement.textContent = poems[index].count;
        console.log(`Contador incrementado na visualização para ${folder}[${index}]: ${poems[index].count}`);
    }
}

function decrementViewCount(folder, index) {
    let poems = JSON.parse(localStorage.getItem(`poems_${folder}`)) || [];
    if (poems[index] && poems[index].count > 0) {
        poems[index].count = (poems[index].count || 0) - 1;
        localStorage.setItem(`poems_${folder}`, JSON.stringify(poems));
        const countElement = document.getElementById(`viewCount_${folder}_${index}`);
        if (countElement) countElement.textContent = poems[index].count;
        console.log(`Contador decrementado na visualização para ${folder}[${index}]: ${poems[index].count}`);
    }
}

function highlightPoem(folder, index, event) {
    event.stopPropagation();
    loadHomeContent(); // Reseta
    const poems = document.querySelectorAll('.poem-item');
    poems.forEach((item, i) => {
        if (i !== index) item.classList.add('poem-hidden');
        else item.classList.add('poem-highlight');
    });
    showToast('Poema destacado! Clique no olho novamente para voltar.');
    setTimeout(() => {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.onclick = () => loadHomeContent();
        });
    }, 100);
}
