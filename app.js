const symptoms = [
  { id: "G01", name: "Nilai redaman (attenuation) tinggi" },
  { id: "G02", name: "Indikator LOS (Loss of Signal) aktif" },
  { id: "G03", name: "Layanan internet putus total" },
  { id: "G04", name: "Daya optik RX di bawah ambang normal" },
  { id: "G05", name: "Gangguan terjadi pada banyak pelanggan dalam satu ruas" },
  { id: "G06", name: "Koneksi sering putus-sambung (intermiten)" },
  { id: "G07", name: "Sinyal normal setelah pembersihan konektor" },
  { id: "G08", name: "Terdapat tekukan tajam pada patchcord/dropcore" },
  { id: "G09", name: "Tidak ada daya listrik pada ONT/ODP aktif" },
  { id: "G10", name: "Perangkat ONT tidak dapat registrasi" },
  { id: "G11", name: "Hasil OTDR menunjukan event loss tinggi pada sambungan" },
  { id: "G12", name: "Gangguan muncul setelah cuaca ekstrem/hujan" }
];

const disorders = [
  {
    id: "K01",
    name: "Kabel backbone/feeder putus",
    recommendation: "Lakukan pelokasian titik putus dengan OTDR, lakukan jointing ulang atau penggantian segmen kabel, lalu validasi redaman end-to-end."
  },
  {
    id: "K02",
    name: "Konektor kotor atau longgar",
    recommendation: "Bersihkan konektor menggunakan fiber cleaning kit, pastikan konektor terpasang presisi, dan verifikasi ulang daya optik."
  },
  {
    id: "K03",
    name: "Bending loss pada patchcord/dropcore",
    recommendation: "Perbaiki jalur kabel agar radius tekuk sesuai standar, ganti patchcord bila perlu, dan lakukan pengujian kestabilan link."
  },
  {
    id: "K04",
    name: "Kegagalan catu daya perangkat",
    recommendation: "Periksa adaptor/sumber listrik, gunakan cadangan daya bila tersedia, dan lakukan restart perangkat setelah tegangan stabil."
  },
  {
    id: "K05",
    name: "Kualitas sambungan splice menurun",
    recommendation: "Ukur titik splice dengan OTDR, lakukan re-splicing pada titik loss tinggi, dan dokumentasikan nilai redaman terbaru."
  },
  {
    id: "K06",
    name: "Degradasi kualitas jalur akibat kelembapan/cuaca",
    recommendation: "Lakukan inspeksi closure dan ODP, pastikan sealing baik, keringkan area terdampak, dan tingkatkan perlindungan jalur luar ruang."
  }
];

const rules = [
  {
    id: "R01",
    premises: ["G02", "G03"],
    conclusion: "F01"
  },
  {
    id: "R02",
    premises: ["G01", "G04"],
    conclusion: "F02"
  },
  {
    id: "R03",
    premises: ["G06", "G08"],
    conclusion: "F03"
  },
  {
    id: "R04",
    premises: ["G09", "G10"],
    conclusion: "F04"
  },
  {
    id: "R05",
    premises: ["G11", "F02"],
    conclusion: "F05"
  },
  {
    id: "R06",
    premises: ["G12", "G06"],
    conclusion: "F06"
  },
  {
    id: "R07",
    premises: ["F01", "G05"],
    conclusion: "K01"
  },
  {
    id: "R08",
    premises: ["F02", "G07"],
    conclusion: "K02"
  },
  {
    id: "R09",
    premises: ["F03"],
    conclusion: "K03"
  },
  {
    id: "R10",
    premises: ["F04"],
    conclusion: "K04"
  },
  {
    id: "R11",
    premises: ["F05"],
    conclusion: "K05"
  },
  {
    id: "R12",
    premises: ["F06", "F02"],
    conclusion: "K06"
  }
];

const factLabels = {
  F01: "Terindikasi gangguan loss dan layanan putus",
  F02: "Terindikasi redaman jalur tidak normal",
  F03: "Terindikasi gangguan fisik kabel akses",
  F04: "Terindikasi masalah daya perangkat",
  F05: "Terindikasi kualitas splice buruk",
  F06: "Terindikasi dampak lingkungan/cuaca"
};

const symptomContainer = document.getElementById("symptomContainer");
const symptomTableBody = document.querySelector("#symptomTable tbody");
const disorderTableBody = document.querySelector("#disorderTable tbody");
const ruleTableBody = document.querySelector("#ruleTable tbody");
const diagnosisForm = document.getElementById("diagnosisForm");
const resultPanel = document.getElementById("resultPanel");
const resetBtn = document.getElementById("resetBtn");

function renderSymptoms() {
  symptoms.forEach((symptom) => {
    const col = document.createElement("div");
    col.className = "col-md-6";

    col.innerHTML = `
      <label class="form-check w-100 h-100 reveal" for="${symptom.id}">
        <input class="form-check-input" type="checkbox" value="${symptom.id}" id="${symptom.id}" />
        <span class="ms-2"><strong>${symptom.id}</strong> - ${symptom.name}</span>
      </label>
    `;

    symptomContainer.appendChild(col);

    const row = document.createElement("tr");
    row.innerHTML = `<td>${symptom.id}</td><td>${symptom.name}</td>`;
    symptomTableBody.appendChild(row);
  });
}

function renderDisorders() {
  disorders.forEach((disorder) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${disorder.id}</td><td>${disorder.name}</td>`;
    disorderTableBody.appendChild(row);
  });
}

function readableToken(token) {
  const symptom = symptoms.find((item) => item.id === token);
  if (symptom) {
    return `${symptom.id} (${symptom.name})`;
  }

  const disorder = disorders.find((item) => item.id === token);
  if (disorder) {
    return `${disorder.id} (${disorder.name})`;
  }

  if (factLabels[token]) {
    return `${token} (${factLabels[token]})`;
  }

  return token;
}

function renderRules() {
  rules.forEach((rule) => {
    const row = document.createElement("tr");
    const premiseText = rule.premises.map((token) => readableToken(token)).join(" AND ");
    row.innerHTML = `
      <td>${rule.id}</td>
      <td>${premiseText}</td>
      <td>${readableToken(rule.conclusion)}</td>
    `;
    ruleTableBody.appendChild(row);
  });
}

function runForwardChaining(initialFacts) {
  const facts = new Set(initialFacts);
  const firedRules = new Set();
  const trace = [];

  let changed = true;
  while (changed) {
    changed = false;

    rules.forEach((rule) => {
      if (firedRules.has(rule.id)) {
        return;
      }

      const allPremisesTrue = rule.premises.every((premise) => facts.has(premise));
      if (allPremisesTrue) {
        firedRules.add(rule.id);

        if (!facts.has(rule.conclusion)) {
          facts.add(rule.conclusion);
          changed = true;
        }

        trace.push({
          ruleId: rule.id,
          premises: [...rule.premises],
          conclusion: rule.conclusion
        });
      }
    });
  }

  const diagnoses = disorders
    .filter((disorder) => facts.has(disorder.id))
    .map((disorder) => {
      const supportingRules = rules.filter((rule) => rule.conclusion === disorder.id);
      const matchedPremises = supportingRules.flatMap((rule) => rule.premises).filter((premise) => facts.has(premise));
      const totalPremises = supportingRules.flatMap((rule) => rule.premises).length || 1;
      const confidence = Math.round((matchedPremises.length / totalPremises) * 100);

      return {
        ...disorder,
        confidence
      };
    })
    .sort((a, b) => b.confidence - a.confidence);

  return {
    facts: [...facts],
    trace,
    diagnoses
  };
}

function renderResult(result, selectedSymptoms) {
  if (selectedSymptoms.length === 0) {
    resultPanel.innerHTML = `
      <h3 class="h5 mb-3">Hasil Diagnosa</h3>
      <p class="text-danger mb-0">Pilih minimal satu gejala untuk memulai identifikasi.</p>
    `;
    return;
  }

  if (result.diagnoses.length === 0) {
    resultPanel.innerHTML = `
      <h3 class="h5 mb-3">Hasil Diagnosa</h3>
      <p class="mb-2">Tidak ditemukan gangguan spesifik berdasarkan aturan saat ini.</p>
      <p class="text-muted small mb-0">Tambahkan gejala tambahan atau evaluasi ulang data lapangan.</p>
    `;
    return;
  }

  const diagnosisHtml = result.diagnoses.map((item) => `
    <div class="mb-3 pb-3 border-bottom">
      <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
        <h4 class="h6 mb-0">${item.id} - ${item.name}</h4>
        <span class="badge-soft">${item.confidence}% kecocokan</span>
      </div>
      <p class="small mb-1"><strong>Rekomendasi:</strong> ${item.recommendation}</p>
    </div>
  `).join("");

  const traceHtml = result.trace.map((step) => `
    <div class="rule-step">
      <strong>${step.ruleId}</strong>: IF ${step.premises.map((token) => readableToken(token)).join(" AND ")} THEN ${readableToken(step.conclusion)}
    </div>
  `).join("");

  resultPanel.innerHTML = `
    <h3 class="h5 mb-3">Hasil Diagnosa</h3>
    <p class="small text-muted">Fakta awal: ${selectedSymptoms.map((token) => readableToken(token)).join("; ")}</p>
    ${diagnosisHtml}
    <h4 class="h6 mt-4 mb-2">Jejak Inferensi</h4>
    ${traceHtml || "<p class='small text-muted mb-0'>Tidak ada aturan yang ditembak.</p>"}
  `;
}

diagnosisForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedSymptoms = symptoms
    .map((symptom) => symptom.id)
    .filter((id) => document.getElementById(id).checked);

  const result = runForwardChaining(selectedSymptoms);
  renderResult(result, selectedSymptoms);
});

resetBtn.addEventListener("click", () => {
  diagnosisForm.reset();
  resultPanel.innerHTML = `
    <h3 class="h5 mb-3">Hasil Diagnosa</h3>
    <p class="text-muted mb-0">Belum ada proses identifikasi. Silakan pilih gejala terlebih dahulu.</p>
  `;
});

renderSymptoms();
renderDisorders();
renderRules();
