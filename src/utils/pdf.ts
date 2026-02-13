export async function waitForImages(root: HTMLElement, timeoutMs = 2500) {
  const imgs = Array.from(root.querySelectorAll("img"));
  const pending = imgs.filter((img) => !img.complete);
  if (!pending.length) {
    await new Promise((r) => setTimeout(r, 100));
    return;
  }
  const loadPromises = pending.map(
    (img) =>
      new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
          return;
        }
        const done = () => {
          img.removeEventListener("load", done);
          img.removeEventListener("error", done);
          resolve();
        };
        img.addEventListener("load", done);
        img.addEventListener("error", done);
      })
  );

  await Promise.race([
    Promise.all(loadPromises),
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}

function blobToBase64(blob: Blob): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}

export async function imageUrlToBase64(url: string, timeoutMs = 15000): Promise<string | null> {
  if (url.startsWith("data:")) {
    return url;
  }
  if (url.startsWith("/")) {
    try {
      return await new Promise<string | null>((resolve) => {
        const img = new Image();
        const timer = setTimeout(() => resolve(url), 5000);

        img.onload = () => {
          clearTimeout(timer);
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) { resolve(url); return; }
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          } catch {
            resolve(url);
          }
        };

        img.onerror = () => {
          clearTimeout(timer);
          resolve(url);
        };

        img.src = url;
      });
    } catch {
      return url;
    }
  }

  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(tid);

    if (response.ok) {
      const blob = await response.blob();
      const result = await blobToBase64(blob);
      if (result) {
        console.log(`[PDF] Converted via direct fetch: ${url.substring(0, 60)}…`);
        return result;
      }
    }
  } catch {
  }

  try {
    const proxyUrl = `https://api.brokwise.com/utils/image-proxy?url=${encodeURIComponent(url)}`;
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(tid);

    if (response.ok) {
      const data = await response.json();
      if (data.dataUrl) {
        console.log(`[PDF] Converted via proxy: ${url.substring(0, 60)}…`);
        return data.dataUrl;
      }
    }
  } catch {
  }

  try {
    return await new Promise<string | null>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      const timer = setTimeout(() => {
        console.warn(`[PDF] Canvas approach timed out: ${url.substring(0, 60)}`);
        resolve(null);
      }, timeoutMs);

      img.onload = () => {
        clearTimeout(timer);
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) { resolve(null); return; }
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          console.log(`[PDF] Converted via canvas: ${url.substring(0, 60)}…`);
          resolve(dataUrl);
        } catch (e) {
          console.warn(`[PDF] Canvas tainted: ${url.substring(0, 60)}`, e);
          resolve(null);
        }
      };

      img.onerror = () => {
        clearTimeout(timer);
        console.warn(`[PDF] Image load failed: ${url.substring(0, 60)}`);
        resolve(null);
      };

      img.src = url;
    });
  } catch {
    return null;
  }
}

export async function imagesToBase64(urls: string[]): Promise<Map<string, string>> {
  console.log(`[PDF] Starting to convert ${urls.length} images to base64...`);
  const results = new Map<string, string>();

  const batchSize = 3;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const promises = batch.map(async (url) => {
      const base64 = await imageUrlToBase64(url);
      if (base64) {
        results.set(url, base64);
      }
    });
    await Promise.all(promises);
  }

  console.log(`[PDF] Successfully converted ${results.size} of ${urls.length} images`);
  return results;
}

export function makeSafeFilePart(value: string) {
  return value.toString().replace(/[^a-zA-Z0-9_-]/g, "_");
}

export async function exportElementAsPdf(opts: {
  element: HTMLElement;
  fileName: string;
  backgroundColor?: string;
}) {
  const { element, fileName, backgroundColor = "#ffffff" } = opts;

  await waitForImages(element, 5000);
  // Let the browser paint any final layout changes.
  await new Promise((r) => setTimeout(r, 100));

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  // Capture links before rasterization
  const links = Array.from(element.querySelectorAll("a")).map((a) => {
    const rect = a.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    return {
      href: a.href,
      x: rect.left - elementRect.left,
      y: rect.top - elementRect.top,
      width: rect.width,
      height: rect.height,
    };
  });

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor,
    imageTimeout: 8000,
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const elementWidth = element.offsetWidth;
  const cssScale = pdfWidth / elementWidth;

  const imgScale = pdfWidth / canvas.width;
  const imgHeight = canvas.height * imgScale;

  // Force single-page: scale down if content exceeds page height
  if (imgHeight > pdfHeight) {
    const fitScale = pdfHeight / imgHeight;
    const scaledWidth = pdfWidth * fitScale;
    const scaledHeight = pdfHeight;
    const xOffset = (pdfWidth - scaledWidth) / 2;

    pdf.addImage(imgData, "PNG", xOffset, 0, scaledWidth, scaledHeight, undefined, "FAST");

    // Add links with adjusted coordinates for scaled content
    const adjustedCssScale = cssScale * fitScale;
    links.forEach((link) => {
      const linkX = link.x * adjustedCssScale + xOffset;
      const linkY = link.y * adjustedCssScale;
      const linkW = link.width * adjustedCssScale;
      const linkH = link.height * adjustedCssScale;
      if (linkY >= 0 && linkY + linkH <= pdfHeight && link.href) {
        pdf.link(linkX, linkY, linkW, linkH, { url: link.href });
      }
    });
  } else {
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight, undefined, "FAST");

    // Add links for single page
    links.forEach((link) => {
      const linkX = link.x * cssScale;
      const linkY = link.y * cssScale;
      const linkW = link.width * cssScale;
      const linkH = link.height * cssScale;
      if (linkY >= 0 && linkY + linkH <= pdfHeight && link.href) {
        pdf.link(linkX, linkY, linkW, linkH, { url: link.href });
      }
    });
  }

  pdf.save(fileName);
}


/**
 * Generate PDF from element and return as Blob (single page).
 * Used for iOS native apps where direct download doesn't work.
 */
export async function generatePdfAsBlob(opts: {
  element: HTMLElement;
  backgroundColor?: string;
}): Promise<Blob> {
  const { element, backgroundColor = "#ffffff" } = opts;

  await waitForImages(element, 5000);
  await new Promise((r) => setTimeout(r, 100));

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  // Capture links before rasterization
  const links = Array.from(element.querySelectorAll("a")).map((a) => {
    const rect = a.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    return {
      href: a.href,
      x: rect.left - elementRect.left,
      y: rect.top - elementRect.top,
      width: rect.width,
      height: rect.height,
    };
  });

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor,
    imageTimeout: 8000,
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const elementWidth = element.offsetWidth;
  const cssScale = pdfWidth / elementWidth;

  const imgScale = pdfWidth / canvas.width;
  const imgHeight = canvas.height * imgScale;

  // Force single-page: scale down if content exceeds page height
  if (imgHeight > pdfHeight) {
    const fitScale = pdfHeight / imgHeight;
    const scaledWidth = pdfWidth * fitScale;
    const scaledHeight = pdfHeight;
    const xOffset = (pdfWidth - scaledWidth) / 2;

    pdf.addImage(imgData, "PNG", xOffset, 0, scaledWidth, scaledHeight, undefined, "FAST");

    const adjustedCssScale = cssScale * fitScale;
    links.forEach((link) => {
      const linkX = link.x * adjustedCssScale + xOffset;
      const linkY = link.y * adjustedCssScale;
      const linkW = link.width * adjustedCssScale;
      const linkH = link.height * adjustedCssScale;
      if (linkY >= 0 && linkY + linkH <= pdfHeight && link.href) {
        pdf.link(linkX, linkY, linkW, linkH, { url: link.href });
      }
    });
  } else {
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight, undefined, "FAST");

    links.forEach((link) => {
      const linkX = link.x * cssScale;
      const linkY = link.y * cssScale;
      const linkW = link.width * cssScale;
      const linkH = link.height * cssScale;
      if (linkY >= 0 && linkY + linkH <= pdfHeight && link.href) {
        pdf.link(linkX, linkY, linkW, linkH, { url: link.href });
      }
    });
  }

  return pdf.output("blob");
}
