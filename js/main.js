let rows = 0;
let cols = 0;
let dirs = 0;

const DX = 50;
const DY = 50;
const R = 10;

let arrP = []; // arrP[k] = { i: i, j: j, cx: cx, cy: cy, r: r, used: 0 };  // k==i*cols + j;
let conn = []; // conn[k][kk]==true means arrP[k] and arrP[kk] connected

let KA = -1; // arrP[KA] is the first selected point
let KB = -1; // arrP[KB] is the second selected point

let back_color = "#333333";
let used_color = "green";
let picked_color = "red";

let picked_fill = "red";
let no_fill = "transparent";

function onClickGenerate() {
  rows = Number(document.getElementById("input_rows").value);
  cols = Number(document.getElementById("input_cols").value);
  dirs = Number(document.getElementById("input_dirs").value);
  KA = -1;
  KB = -1;

  let textHtml = "";
  arrP = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      cx = DX + j * DX;
      cy = DY + i * DY;
      arrP.push({ i: i, j: j, cx: cx, cy: cy, used: 0 });
      let k = i * cols + j;
      textHtml += `<circle id="point${k}" cx="${cx}" cy="${cy}" r="${R}" stroke="${back_color}" stroke-width="4" fill="${no_fill}"/>`;
    }
  }

  conn = [];
  for (let k = 0; k < arrP.length; k++) {
    let tmp = [];
    for (let kk = 0; kk < arrP.length; kk++) tmp.push(false);
    conn.push(tmp);
  }

  function txthtmlofLine(k, kk) {
    let str = "";
    if (k >= 0 && k < arrP.length && kk >= 0 && kk < arrP.length)
      str = `<line x1="${arrP[k].cx}" y1="${arrP[k].cy}" x2="${arrP[kk].cx}" y2="${arrP[kk].cy}"
        stroke = "${back_color}" style="pointer-events:none;"/>`;

    return { str };
  }

  for (let k = 0; k < arrP.length; k++) {
    let i = arrP[k].i;
    let j = arrP[k].j;
    kk = (i - 1) * cols + j;
    if (i - 1 >= 0) textHtml += txthtmlofLine(k, kk).str;

    kk = (i - 1) * cols + (j - 1);
    if (dirs == 8 && i - 1 >= 0 && j - 1 >= 0) textHtml += txthtmlofLine(k, kk).str;

    kk = i * cols + (j - 1);
    if (j - 1 >= 0) textHtml += txthtmlofLine(k, kk).str;

    kk = (i + 1) * cols + (j - 1);
    if (dirs == 8 && i + 1 < rows && j - 1 >= 0) textHtml += txthtmlofLine(k, kk).str;
  }

  let eleSVG = document.getElementById("svg");
  eleSVG.style.width = DX * (cols + 1);
  eleSVG.style.height = DY * (rows + 1);
  eleSVG.innerHTML = textHtml;
  eleSVG.addEventListener("click", onClickSVG);
  eleSVG.addEventListener("mousemove", onMouseMoveSVG);

  toggleUnused(true);
}

function onClickSVG(evt) {
  let t = evt.target;
  let cx = t.getAttributeNS(null, "cx");
  let cy = t.getAttributeNS(null, "cy");
  if (t.nodeName != "circle") return;
  let i, j, k;
  j = (cx - DX) / DX;
  i = (cy - DY) / DY;
  k = i * cols + j;

  if (KA == -1 && KB == -1) selectA(k);
  else if (KA != -1 && KB == -1 && k != KA) selectB(k);
  else if (k == KA) deselectA(k);
  else if (k == KB) deselectB(k);
}

function selectA(k) {
  KA = k;
  highlight(k, true);
  document.getElementById("span4a").innerHTML = `x=${k % cols}, y=${Math.floor(k / cols)}`;
}
function deselectA(k) {
  KA = -1;
  highlight(k, false);
  document.getElementById("span4a").innerHTML = "";
}
function selectB(k) {
  KB = k;
  highlight(k, true);
  document.getElementById("span4b").innerHTML = `x=${k % cols}, y=${Math.floor(k / cols)}`;
}
function deselectB(k) {
  KB = -1;
  highlight(k, false);
  document.getElementById("span4b").innerHTML = "";
}

function highlight(k, isSelect) {
  let point = document.getElementById(`point${k}`);
  if (isSelect) {
    point.setAttributeNS(null, "stroke", picked_color);
    point.setAttributeNS(null, "fill", picked_fill);
  } else if (arrP[k].used) {
    point.setAttributeNS(null, "stroke", used_color);
    point.setAttributeNS(null, "fill", no_fill);
  } else {
    point.setAttributeNS(null, "stroke", back_color);
    point.setAttributeNS(null, "fill", no_fill);
  }

  for (let kk = 0; kk < arrP.length; kk++) {
    if (conn[k][kk]) {
      //highlight connected lines
      let conndLine = document.getElementById(`line_${Math.min(k, kk)}_${Math.max(k, kk)}`);
      let conndPoint = document.getElementById(`point${kk}`);

      if (isSelect) {
        conndLine.setAttributeNS(null, "stroke", picked_color);
        conndPoint.setAttributeNS(null, "stroke", picked_color);
      } else {
        conndLine.setAttributeNS(null, "stroke", used_color);
        conndPoint.setAttributeNS(null, "stroke", used_color);
      }
    }
  }
}

function parseSVG(s) {
  var div = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
  div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + s + "</svg>";
  var frag = document.createDocumentFragment();
  while (div.firstChild.firstChild) frag.appendChild(div.firstChild.firstChild);
  return frag;
}

function onKeySpace(evt) {
  if (evt.keyCode == 32) {
    evt.preventDefault();
    if (KA != -1 && KB != -1) {
      if (!conn[KA][KB]) {
        conn[KA][KB] = true;
        conn[KB][KA] = true;
        arrP[KA].used++;
        arrP[KB].used++;

        let ele = parseSVG(`<line id="line_${Math.min(KA, KB)}_${Math.max(KA, KB)}" 
          x1="${arrP[KA].cx}" y1="${arrP[KA].cy}" 
          x2="${arrP[KB].cx}" y2="${arrP[KB].cy}"
          stroke=${used_color} style="pointer-events:none;"/>`);

        document.getElementById("svg").appendChild(ele);
      } else {
        conn[KA][KB] = false;
        conn[KB][KA] = false;
        arrP[KA].used--;
        arrP[KB].used--;

        let ele = document.getElementById(`line_${Math.min(KA, KB)}_${Math.max(KA, KB)}`);
        ele.parentNode.removeChild(ele);
      }

      deselectA(KA);
      deselectB(KB);
    }
  }
}

function onMouseMoveSVG(evt) {
  let t = evt.target;
  let cx = t.getAttributeNS(null, "cx");
  let cy = t.getAttributeNS(null, "cy");
  if (t.nodeName != "circle") return;
  let i, j, k;
  j = (cx - DX) / DX;
  i = (cy - DY) / DY;
  k = i * cols + j;
  document.getElementById("span4now").innerHTML = `x=${j}, y=${i}`;
}

let isShowUnused = true;

function toggleUnused(_isShowUnused) {
  isShowUnused = _isShowUnused;
  document.getElementById("btn_show_unused").style.display = isShowUnused ? "none" : "block";
  document.getElementById("btn_hide_unused").style.display = isShowUnused ? "block" : "none";

  for (let k = 0; k < arrP.length; k++)
    if (!arrP[k].used) {
      document.getElementById(`point${k}`).style.display = isShowUnused ? "block" : "none";
    }
}
