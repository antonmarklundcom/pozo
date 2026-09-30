<?php
/**
 * includes/calculator.php
 * Cotizador de perforación. Vanilla JS, cero dependencias.
 * TODAS las tarifas vienen de $RATES en config.php — no hay números acá.
 */
require_once __DIR__ . '/config.php';
$calcJson = json_encode($RATES, JSON_UNESCAPED_UNICODE);
?>
<div class="calc" id="cotizador">
  <div class="calc-grid">

    <div class="field">
      <label for="c-prof">Profundidad estimada <span class="hint">— en metros</span></label>
      <div class="range-row">
        <input type="range" id="c-prof" min="<?= (int)$RATES['prof_min'] ?>" max="<?= (int)$RATES['prof_max'] ?>" step="5" value="60"
               aria-describedby="c-prof-val">
        <output class="range-val tnum" id="c-prof-val" for="c-prof">60 m</output>
      </div>
      <p class="small muted" style="margin:8px 0 0">En Gran Asunción la mayoría de los pozos domiciliarios queda entre <?= (int)$RATES['prof_min'] ?> y <?= (int)$RATES['prof_max'] ?> metros. La napa la confirma el perforador en el lugar.</p>
    </div>

    <div class="field">
      <label>Tipo de suelo</label>
      <div class="opts">
        <label class="opt"><input type="radio" name="suelo" value="tierra" checked><span>Tierra / arena</span></label>
        <label class="opt"><input type="radio" name="suelo" value="mixto"><span>Mixto</span></label>
        <label class="opt"><input type="radio" name="suelo" value="roca"><span>Roca</span></label>
        <label class="opt"><input type="radio" name="suelo" value="mixto"><span>No sé</span></label>
      </div>
      <p class="small muted" style="margin:10px 0 0">Si no sabés, dejalo en «No sé»: calculamos con suelo mixto, que es lo más común en Central.</p>
    </div>

    <div class="field">
      <label>¿Qué incluimos en el cálculo?</label>
      <ul class="incl">
        <li><label><input type="checkbox" id="c-ent" checked> Entubado (caño camisa)</label></li>
        <li><label><input type="checkbox" id="c-fil" checked> Filtro y prefiltro de grava</label></li>
        <li><label><input type="checkbox" id="c-bom"> Bomba sumergible</label></li>
        <li><label><input type="checkbox" id="c-tab"> Tablero eléctrico y protecciones</label></li>
      </ul>
    </div>

    <div class="field">
      <label for="c-ciudad">Ciudad</label>
      <select id="c-ciudad">
        <?php foreach ($ZONAS as $z): ?>
          <option value="<?= e($z) ?>"<?= $z === 'Asunción' ? ' selected' : '' ?>><?= e($z) ?></option>
        <?php endforeach; ?>
        <option value="Otra ciudad">Otra ciudad del país</option>
      </select>
      <p class="small muted" style="margin:10px 0 0">Fuera de Gran Asunción se suma el traslado del equipo, que se cotiza aparte.</p>
    </div>

  </div>

  <div class="calc-out" aria-live="polite">
    <span class="lbl">Estimación referencial</span>
    <p class="calc-total tnum" id="c-total">—</p>
    <p class="small" style="color:#A8A29A;margin:0" id="c-sub">Movés la profundidad y el cálculo se actualiza solo.</p>
    <ul class="calc-break" id="c-break"></ul>
    <a class="btn btn-wa btn-lg" id="c-wa" href="<?= e(wa()) ?>" target="_blank" rel="noopener">Mandá este cálculo por WhatsApp</a>
  </div>

  <p class="calc-disc">
    Los valores son <b>referenciales</b> y sirven para dimensionar el presupuesto, no son una oferta.
    El precio final depende de la napa real, del acceso del equipo al terreno y del diámetro del entubado.
    Tarifas revisadas el <?= e(date('d/m/Y', strtotime(RATES_UPDATED))) ?>. Precios en guaraníes; consultar si incluyen IVA.
  </p>
</div>

<script>
(function(){
  var R = <?= $calcJson ?>;
  var prof = document.getElementById('c-prof');
  if(!prof) return;
  var profVal = document.getElementById('c-prof-val'),
      total   = document.getElementById('c-total'),
      sub     = document.getElementById('c-sub'),
      brk     = document.getElementById('c-break'),
      waBtn   = document.getElementById('c-wa'),
      ciudad  = document.getElementById('c-ciudad'),
      ent=document.getElementById('c-ent'), fil=document.getElementById('c-fil'),
      bom=document.getElementById('c-bom'), tab=document.getElementById('c-tab');

  var WA = <?= json_encode(WA_NUMBER) ?>;

  function gs(n){ return 'Gs. ' + Math.round(n).toLocaleString('es-PY').replace(/,/g,'.'); }
  function plain(n){ return Math.round(n).toLocaleString('es-PY').replace(/,/g,'.'); }

  function calc(){
    var m = parseInt(prof.value,10);
    var suelo = document.querySelector('input[name="suelo"]:checked').value;
    var min = R['perf_'+suelo+'_min'] * m;
    var max = R['perf_'+suelo+'_max'] * m;
    var items = [['Perforación · ' + m + ' m', min, max]];

    if(ent.checked){ var a=R.entubado_ml_min*m, b=R.entubado_ml_max*m; min+=a; max+=b; items.push(['Entubado · ' + m + ' m', a, b]); }
    if(fil.checked){ min+=R.filtro_min; max+=R.filtro_max; items.push(['Filtro y prefiltro', R.filtro_min, R.filtro_max]); }
    if(bom.checked){ min+=R.bomba_min;  max+=R.bomba_max;  items.push(['Bomba sumergible', R.bomba_min, R.bomba_max]); }
    if(tab.checked){ min+=R.tablero_min;max+=R.tablero_max;items.push(['Tablero eléctrico', R.tablero_min, R.tablero_max]); }

    total.textContent = gs(min) + ' – ' + plain(max);
    sub.textContent = 'Pozo de ' + m + ' m en suelo ' +
      (suelo==='tierra'?'de tierra o arena':suelo==='roca'?'rocoso':'mixto') +
      ' · ' + ciudad.value;

    brk.innerHTML = items.map(function(i){
      return '<li><span>'+i[0]+'</span><span>'+gs(i[1])+' – '+plain(i[2])+'</span></li>';
    }).join('');

    var msg = 'Hola, hice el cálculo en pozo.com.py: pozo artesiano de ' + m + ' m, suelo ' + suelo +
              ', en ' + ciudad.value + '. Estimación ' + gs(min) + ' – ' + plain(max) +
              '. Quiero un presupuesto real.';
    waBtn.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
    profVal.textContent = m + ' m';
  }

  [prof, ciudad, ent, fil, bom, tab].forEach(function(el){
    el.addEventListener('input', calc); el.addEventListener('change', calc);
  });
  document.querySelectorAll('input[name="suelo"]').forEach(function(el){ el.addEventListener('change', calc); });
  calc();
})();
</script>
