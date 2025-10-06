// Alternar menu hambúrguer
function toggleMenu() {
  document.querySelector('.sidebar').classList.toggle('active');
}

// Mostrar página inicial (limpa filtros, se quiser)
function showHome() {
  document.querySelector('.sidebar').classList.remove('active'); // Fecha o menu
}

// Carregar dados do localStorage
let folders = JSON.parse(localStorage.getItem('folders')) || [];

// Atualizar menu com títulos das pastas
function updateMenu() {
  const menu = document.querySelector('.sidebar ul');
  // Mantém apenas o item "Home"
  menu.innerHTML = '<li><a href="#" onclick="showHome()"><i class="fas fa-home"></i> Home</a></li>';
  folders.forEach((folder, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="#" onclick="scrollToFolder(${index})">${folder.name}</a>`;
    menu.appendChild(li);
  });
}

// Função para rolar até uma pasta específica
function scrollToFolder(index) {
  const folderElement = document.querySelector(`#folder-${index}`);
  if (folderElement) {
    folderElement.scrollIntoView({ behavior: 'smooth' });
    document.querySelector('.sidebar').classList.remove('active'); // Fecha o menu
  }
}

// Exibir pastas e textos na página inicial
function displayContent() {
  const display = document.getElementById('contentDisplay');
  display.innerHTML = '';
  folders.forEach((folder, folderIndex) => {
    const folderDiv = document.createElement('div');
    folderDiv.className = 'folder';
    folderDiv.id = `folder-${folderIndex}`;
    folderDiv.innerHTML = `<h2>${folder.name}</h2>`;
    folder.texts.forEach(text => {
      folderDiv.innerHTML += `
        <h3>${text.title}</h3>
        <p>${text.content}</p>
      `;
    });
    display.appendChild(folderDiv);
  });
}

// Adicionar nova pasta/texto
document.getElementById('contentForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const folderName = document.getElementById('folderName').value;
  const textTitle = document.getElementById('textTitle').value;
  const textContent = document.getElementById('textContent').value;

  // Verifica se a pasta já existe
  let folder = folders.find(f => f.name === folderName);
  if (!folder) {
    folder = { name: folderName, texts: [] };
    folders.push(folder);
  }
  folder.texts.push({ title: textTitle, content: textContent });

  // Salva no localStorage
  localStorage.setItem('folders', JSON.stringify(folders));

  // Atualiza interface
  updateMenu();
  displayContent();
  document.getElementById('contentForm').reset(); // Limpa formulário
});

// Inicializa a página
updateMenu();
displayContent();
