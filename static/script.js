'use strict';

window.addEventListener('load', init);

const els = {};

function $(sel) { return document.querySelector(sel); }

function init() {
  els.fn = $('#filenamesel');
  els.fnw = $('#filenamewritein');
  els.load = $('#load');
  els.save = $('#save');
  els.cfn = $('#currfilename');
  els.con = $('#filecontent');
  els.vsec = $('#valuesection');
  els.ssec = $('#selectsection');
  els.sseco = $('#selectsection > .opener');

  loadFilenames();
  els.fn.addEventListener('change', loadFromFN);
  els.fnw.addEventListener('input', setLoadPending);
  els.load.addEventListener('click', loadFromFNW);
  els.save.addEventListener('click', save);
  els.sseco.addEventListener('click', toggleSSec);
}

function toggleSSec() {
  els.ssec.classList.toggle('off');
}

async function loadFilenames() {
  try {
    const response = await fetch('/api/');
    if (!response.ok) {
      throw response;
    }

    const data = await response.json();
    els.fn.disabled = false;
    if (!Array.isArray(data) || data.length === 0) {
      els.fn.innerHTML = '<option>no files';
      els.fn.disabled = true;
      return;
    }

    els.fn.innerHTML = '<option disabled selected>select a file';
    for (const item of data) {
      const opt = document.createElement('option');
      opt.textContent = item;
      if (item === els.cfn.textContent) {
        opt.selected = true;
      }
      els.fn.appendChild(opt);
    }
  } catch (e) {
    els.fn.innerHTML = '<option>error';
    console.error(e);
    els.fn.disabled = true;
  }
}

function setLoadPending() {
  els.load.classList.add('pending');
  els.load.disabled = false;
}

function loadFromFN() {
  els.load.disabled = true;
  load(els.fn.value);
}

function loadFromFNW() {
  els.load.classList.remove('pending');
  load(els.fnw.value);
}

async function load(name) {
  try {
    els.ssec.classList.add('off');
    els.cfn.textContent = name;
    els.con.value = '';
    els.con.disabled = true;
    els.con.placeholder = 'loading...';

    const response = await fetch(`/api/${encodeURIComponent(name)}`);
    if (!response.ok) throw new Error(`loading returned ${response.status}`);

    const text = await response.text();

    els.con.value = text;
    els.con.disabled = false;
    els.con.placeholder = '';
    els.vsec.classList.remove('notloaded');
  } catch (e) {
    els.load.disabled = false;
    els.con.value = e.toString();
    els.con.disabled = true;
    els.con.placeholder = '';
  }
}

async function save() {
  try {
    const name = els.cfn.textContent;
    els.save.classList.remove('pending');
    els.save.disabled = true;
    els.save.title = undefined;
    els.save.textContent = 'saving';

    const response = await fetch(`/api/${name}`, {
      method: 'PUT',
      body: els.con.value,
    });

    if (!response.ok) throw new Error(`saving returned ${response.status}`);

    els.save.disabled = false;
    els.save.textContent = 'save';
  } catch (e) {
    els.save.disabled = false;
    els.save.textContent = 'error, try again?';
    els.save.title = e.toString();
  }

  loadFilenames();
}
