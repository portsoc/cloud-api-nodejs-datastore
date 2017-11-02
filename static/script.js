'use strict';

window.addEventListener('load', init);

function init() {
  loadFilenames();
  id('filename').addEventListener('change', setWritein);
  id('filename').addEventListener('change', setLoadPending);
  id('filenamewritein').addEventListener('input', setLoadPending);
  id('load').addEventListener('click', load);
  id('save').addEventListener('click', save);
}

async function loadFilenames() {
  const response = await fetch('/api/');
  if (!response.ok) {
    id('filename').innerHTML = '<option>error';
    id('filename').disabled = true;
    return;
  }

  const data = await response.json();
  id('filename').disabled = false;
  if (!Array.isArray(data) || data.length === 0) {
    id('filename').innerHTML = '<option>no files';
    id('filename').disabled = true;
    return;
  }

  id('filename').innerHTML = '';
  for (const item of data) {
    const opt = document.createElement('option');
    opt.textContent = item;
    id('filename').appendChild(opt);
  }

  id('filenamewritein').value = data[0];
}

function setWritein(e) {
  id('filenamewritein').value = e.target.value;
}

function setLoadPending() {
  id('load').classList.add('pending');
}

async function load() {
  try {
    const name = id('filenamewritein').value;
    id('load').classList.remove('pending');
    id('load').disabled = true;
    id('currfilename').textContent = name;
    id('filecontent').value = '';
    id('filecontent').disabled = true;
    id('filecontent').placeholder = 'loading...';

    const response = await fetch(`/api/${name}`);
    if (!response.ok) throw new Error(`loading returned ${response.status}`);

    const text = await response.text();

    id('load').disabled = false;
    id('filecontent').value = text;
    id('filecontent').disabled = false;
    id('filecontent').placeholder = '';
    id('valuesection').classList.remove('notloaded');
  } catch (e) {
    id('load').disabled = false;
    id('filecontent').value = e.toString();
    id('filecontent').disabled = true;
    id('filecontent').placeholder = '';
  }
}

async function save() {
  try {
    const name = id('currfilename').textContent;
    id('save').classList.remove('pending');
    id('save').disabled = true;
    id('save').title = undefined;
    id('save').textContent = 'saving';

    const response = await fetch(`/api/${name}`, {
      method: 'PUT',
      body: id('filecontent').value,
    });

    if (!response.ok) throw new Error(`saving returned ${response.status}`);

    id('save').disabled = false;
    id('save').textContent = 'save';
  } catch (e) {
    id('save').disabled = false;
    id('save').textContent = 'error, try again?';
    id('save').title = e.toString();
  }

  loadFilenames();
}


function id(i) { return document.getElementById(i); }
