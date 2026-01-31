const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("file");
const statusEl = document.getElementById("status");
const optimize = document.getElementById("optimizeImages");

uploadBtn.onclick = upload;

function setStatus(message, type = "info", { spinning = false } = {}) {
  // DaisyUI-friendly text colors
  const typeClass = {
    info: "text-info",
    success: "text-success",
    warning: "text-warning",
    error: "text-error",
  }[type] || "text-info";

  statusEl.className = `text-center text-sm ${typeClass}`;

  // Optional small spinner
  statusEl.innerHTML = spinning
    ? `<span class="loading loading-spinner loading-xs align-middle mr-2"></span><span class="align-middle">${message}</span>`
    : message;
}

async function upload() {
  const files = fileInput.files;

  if (!files || files.length === 0) {
    setStatus("Please choose at least one file to upload.", "warning");
    alert("Pick a file");
    return;
  }

  uploadBtn.disabled = true;
  uploadBtn.classList.add("btn-disabled");

  const total = files.length;
  let successCount = 0;
  let failCount = 0;
  const failedNames = [];

  setStatus(`Starting upload… (0/${total})`, "info", { spinning: true });

  for (let i = 0; i < total; i++) {
    const file = files[i];
    setStatus(`Uploading “${file.name}”… (${i}/${total})`, "info", { spinning: true });

    try {
      const res = await uploadFile(file);

      if (res.ok) {
        // If your server always returns JSON, keep this; otherwise it safely ignores non-JSON.
        try { await res.json(); } catch (_) {}
        successCount++;
      } else {
        failCount++;
        failedNames.push(`${file.name} (HTTP ${res.status})`);
      }
    } catch (err) {
      failCount++;
      failedNames.push(`${file.name} (network error)`);
    }

    setStatus(`Progress: ${successCount + failCount}/${total} files processed…`, "info", { spinning: true });
  }

  uploadBtn.disabled = false;
  uploadBtn.classList.remove("btn-disabled");

  if (failCount === 0) {
    setStatus(`✅ Done! Uploaded ${successCount}/${total} files successfully.`, "success");
  } else {
    const failedList = failedNames.length ? ` Failed: ${failedNames.join(", ")}` : "";
    setStatus(`⚠️ Finished. Uploaded ${successCount}/${total}. ${failCount} failed.${failedList}`, "error");
  }
}

async function uploadFile(file) {
  const formData = new FormData();
  formData.append("files", file);

  const url = optimize.checked ? "/upload_optimized" : "/upload";
  return fetch(url, {
    method: "POST",
    body: formData
  });
}
