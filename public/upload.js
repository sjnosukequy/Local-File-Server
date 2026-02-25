const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("file");
const statusEl = document.getElementById("status");
const optimize = document.getElementById("optimizeImages");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const progressPercent = document.getElementById("progressPercent");

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
        try { await res.json(); } catch (_) { }
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

function uploadFile(file) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("files", file);

    const xhr = new XMLHttpRequest();
    const url = optimize.checked ? "/upload_optimized" : "/upload";
    xhr.open("POST", url, true);

    // Show progress bar
    progressContainer.classList.remove("hidden");
    progressBar.value = 0;
    progressText.textContent = `0 B / ${formatBytes(file.size)}`;
    progressPercent.textContent = "0%";

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);

        progressBar.value = percent;
        progressText.textContent =
          `${formatBytes(event.loaded)} / ${formatBytes(event.total)}`;
        progressPercent.textContent = `${percent}%`;
      }
    };

    xhr.onload = () => resolve({
      ok: xhr.status >= 200 && xhr.status < 300,
      status: xhr.status,
      json: async () => JSON.parse(xhr.responseText)
    });

    xhr.onerror = reject;

    xhr.send(formData);
  });

}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
